package com.turbo.service;

import com.turbo.dto.SellVehicleRequest;
import com.turbo.dto.VehicleDto;
import com.turbo.dto.VehicleImageDto;
import com.turbo.exception.ResourceNotFoundException;
import com.turbo.model.Vehicle;
import com.turbo.model.VehicleFeature;
import com.turbo.model.VehicleImage;
import com.turbo.repository.VehicleRepository;
import com.turbo.repository.UserRepository;
import com.turbo.repository.VehicleFeatureRepository;
import com.turbo.repository.VehicleImageRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final VehicleFeatureRepository featureRepository;
    private final VehicleImageRepository imageRepository;
    private final UserRepository userRepository;
    private final ImageService imageService;

    
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public Vehicle getVehicle(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found: " + id));
    }

    @Transactional
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findByStatus("Available");
    }

    @Transactional
    public List<Vehicle> getVehiclesByDealership(Long dealershipId) {
        List<Vehicle> vehicles = vehicleRepository.findByDealershipId(dealershipId);
        // Initialize the collections to avoid LazyInitializationException when
        // serializing to JSON
        vehicles.forEach(vehicle -> {
            vehicle.getImages().size(); // Force initialization
        });
        return vehicles;
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        Vehicle vehicle = getVehicle(id);

        // Update basic fields
        vehicle.setMake(updatedVehicle.getMake());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setYear(updatedVehicle.getYear());
        vehicle.setDescription(updatedVehicle.getDescription());
        vehicle.setColour(updatedVehicle.getColour());
        vehicle.setVin(updatedVehicle.getVin());
        vehicle.setVrm(updatedVehicle.getVrm());
        vehicle.setBodyStyle(updatedVehicle.getBodyStyle());
        vehicle.setTransmission(updatedVehicle.getTransmission());
        vehicle.setEngineSize(updatedVehicle.getEngineSize());
        vehicle.setDoors(updatedVehicle.getDoors());

        // Update sales information
        vehicle.setStatus(updatedVehicle.getStatus());
        vehicle.setListPrice(updatedVehicle.getListPrice());

        // Update sold information if provided
        if (updatedVehicle.getSoldPrice() != null) {
            vehicle.setSoldPrice(updatedVehicle.getSoldPrice());
        }

        if (updatedVehicle.getSoldDate() != null) {
            vehicle.setSoldDate(updatedVehicle.getSoldDate());
        }

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with id: " + id));

        // First, delete all associated images
        List<VehicleImage> images = imageRepository.findByVehicleId(id);
        for (VehicleImage image : images) {
            // Delete physical file
            try {
                imageService.deleteImageFile(image);
            } catch (IOException e) {
                log.error("Failed to delete image file for image id: " + image.getId(), e);
            }
            // Delete database record
            imageRepository.delete(image);
        }

        // Now safe to delete the vehicle
        vehicleRepository.delete(vehicle);
    }

    public Vehicle sellVehicle(Long id, SellVehicleRequest sellRequest) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // Set sold price (required)
        vehicle.setSoldPrice(sellRequest.getSoldPrice());

        // Set sold date (use current time if not provided)
        if (sellRequest.getSoldDate() != null) {
            vehicle.setSoldDate(sellRequest.getSoldDate());
        } else {
            vehicle.setSoldDate(LocalDateTime.now());
        }

        // Set sold by (can be null if not provided, will be set by controller)
        if (sellRequest.getSoldBy() != null && sellRequest.getSoldBy().getId() != null) {
            vehicle.setSoldBy(userRepository.findById(sellRequest.getSoldBy().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        }

        // Set status (default to "Sold" if not provided)
        if (sellRequest.getStatus() != null) {
            vehicle.setStatus(sellRequest.getStatus());
        } else {
            vehicle.setStatus("Sold");
        }

        return vehicleRepository.save(vehicle);
    }

    // Feature management
    public VehicleFeature addFeature(Long vehicleId, VehicleFeature feature) {
        Vehicle vehicle = getVehicle(vehicleId);
        feature.setVehicle(vehicle);
        return featureRepository.save(feature);
    }

    public void removeFeature(Long vehicleId, Long featureId) {
        VehicleFeature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new EntityNotFoundException("Feature not found: " + featureId));

        if (!feature.getVehicle().getId().equals(vehicleId)) {
            throw new IllegalArgumentException("Feature does not belong to vehicle");
        }

        featureRepository.delete(feature);
    }

    public List<VehicleFeature> getVehicleFeatures(Long vehicleId) {
        return featureRepository.findByVehicleId(vehicleId);
    }

    // Image management
    public VehicleImage addImage(Long vehicleId, VehicleImage image) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found: " + vehicleId));

        image.setVehicle(vehicle);

        // Check if this is the first image or if it's explicitly set as primary
        boolean shouldBePrimary = vehicle.getImages().isEmpty() || image.getIsPrimary();

        if (shouldBePrimary) {
            // Unset any existing primary
            imageRepository.findByVehicleIdAndIsPrimaryTrue(vehicleId)
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        imageRepository.save(existingPrimary);
                    });
            image.setIsPrimary(true);
        }

        return imageRepository.save(image);
    }

    public VehicleImage updateImage(VehicleImage image) {
        return imageRepository.save(image);
    }

    public void removeImage(Long vehicleId, Long imageId) {
        VehicleImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Image not found: " + imageId));

        if (!image.getVehicle().getId().equals(vehicleId)) {
            throw new IllegalArgumentException("Image does not belong to vehicle");
        }

        imageRepository.delete(image);
    }

    public List<VehicleImage> getVehicleImages(Long vehicleId) {
        return imageRepository.findByVehicleIdOrderByDisplayOrderAsc(vehicleId);
    }

    public VehicleImage setPrimaryImage(Long vehicleId, Long imageId) {
        VehicleImage newPrimary = imageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Image not found: " + imageId));

        if (!newPrimary.getVehicle().getId().equals(vehicleId)) {
            throw new IllegalArgumentException("Image does not belong to vehicle");
        }

        // Unset current primary
        imageRepository.findByVehicleIdAndIsPrimaryTrue(vehicleId)
                .ifPresent(currentPrimary -> {
                    currentPrimary.setIsPrimary(false);
                    imageRepository.save(currentPrimary);
                });

        // Set new primary
        newPrimary.setIsPrimary(true);
        return imageRepository.save(newPrimary);
    }

    public void setFirstImageAsPrimary(Long vehicleId) {
        List<VehicleImage> images = imageRepository.findByVehicleIdOrderByDisplayOrderAsc(vehicleId);
        if (!images.isEmpty()) {
            VehicleImage firstImage = images.get(0);
            setPrimaryImage(vehicleId, firstImage.getId());
        }
    }

    public List<VehicleImage> getImagesByType(Long vehicleId, String type) {
        return imageRepository.findByVehicleIdAndType(vehicleId, type);
    }

}