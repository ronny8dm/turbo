package com.turbo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.turbo.dto.SellVehicleRequest;
import com.turbo.dto.VehicleImageDto;
import com.turbo.exception.ResourceNotFoundException;
import com.turbo.model.User;
import com.turbo.model.Vehicle;
import com.turbo.model.VehicleFeature;
import com.turbo.model.VehicleImage;
import com.turbo.service.ImageService;
import com.turbo.service.UserDetailsImpl;
import com.turbo.service.UserService;
import com.turbo.service.VehicleDataService;
import com.turbo.service.VehicleService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private static final Logger logger = LoggerFactory.getLogger(VehicleController.class);
    private final VehicleService vehicleService;
    private final VehicleDataService vehicleDataService;
    private final UserService userService;
    private final ImageService imageService;

   
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(vehicleService.createVehicle(vehicle));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(vehicleService.getVehicle(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/lookup/{registrationNumber}")
    public ResponseEntity<?> lookupVehicleByRegistration(@PathVariable String registrationNumber) {
        try {
            JsonNode vehicleData = vehicleDataService.getVehicleByRegistration(registrationNumber);
            return ResponseEntity.ok(vehicleData);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Could not find vehicle data for registration number: " + registrationNumber);
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Vehicle>> getAllVehicles(@RequestParam Long dealershipId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByDealership(dealershipId));
    }

    @GetMapping("/dealership/{dealershipId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByDealership(@PathVariable Long dealershipId) {
        List<Vehicle> vehicles = vehicleService.getVehiclesByDealership(dealershipId);
        return ResponseEntity.ok(vehicles);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @RequestBody Vehicle vehicle) {
        try {
            return ResponseEntity.ok(vehicleService.updateVehicle(id, vehicle));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/sell")
    public ResponseEntity<?> sellVehicle(@PathVariable Long id,
            @RequestBody SellVehicleRequest sellRequest,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            
            if (sellRequest.getSoldPrice() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Sold price is required"));
            }

         
            if (sellRequest.getSoldBy() == null || sellRequest.getSoldBy().getId() == null) {
                User user = userService.findByEmail(currentUser.getUsername());
                sellRequest.setSoldBy(user);
            }

            
            Vehicle updatedVehicle = vehicleService.sellVehicle(id, sellRequest);
            return ResponseEntity.ok(updatedVehicle);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to sell vehicle: " + e.getMessage()));
        }
    }

    @PostMapping("/{vehicleId}/features")
    public ResponseEntity<?> addFeature(@PathVariable Long vehicleId, @RequestBody VehicleFeature feature) {
        try {
            VehicleFeature savedFeature = vehicleService.addFeature(vehicleId, feature);
            return ResponseEntity.ok(savedFeature);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add feature: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{vehicleId}/features/{featureId}")
    public ResponseEntity<?> removeFeature(@PathVariable Long vehicleId, @PathVariable Long featureId) {
        try {
            vehicleService.removeFeature(vehicleId, featureId);
            return ResponseEntity.ok(Map.of("message", "Feature removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove feature: " + e.getMessage()));
        }
    }

    @GetMapping("/{vehicleId}/features")
    public ResponseEntity<List<VehicleFeature>> getVehicleFeatures(@PathVariable Long vehicleId) {
        try {
            return ResponseEntity.ok(vehicleService.getVehicleFeatures(vehicleId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

   
    @PostMapping("/{vehicleId}/images")
    @Transactional
    public ResponseEntity<?> addImage(
            @PathVariable Long vehicleId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "type", defaultValue = "EXTERIOR") String type,
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary) {
        try {

            Vehicle vehicle = vehicleService.getVehicle(vehicleId);
            
            VehicleImage image = imageService.saveImage(file, vehicle, displayOrder, isPrimary);
            image.setType(type);

           
            VehicleImage savedImage = vehicleService.addImage(vehicleId, image);
            logger.info("Saved image data {}", savedImage);
            return ResponseEntity.ok(savedImage);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{vehicleId}/images/{imageId}")
    public ResponseEntity<Void> removeImage(
            @PathVariable Long vehicleId,
            @PathVariable Long imageId) {
        try {
            vehicleService.removeImage(vehicleId, imageId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{vehicleId}/images")
    public ResponseEntity<List<VehicleImageDto>> getVehicleImages(@PathVariable Long vehicleId) {
        logger.info("Fetching images for vehicle {}", vehicleId);
        try {
            List<VehicleImage> images = vehicleService.getVehicleImages(vehicleId);
            logger.info("Found {} images for vehicle {}", images.size(), vehicleId);

           
            List<VehicleImageDto> imageDTOs = images.stream()
                    .map(VehicleImageDto::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(imageDTOs);
        } catch (EntityNotFoundException e) {
            logger.error("Vehicle not found: {}", vehicleId, e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{vehicleId}/images/{imageId}/primary")
    public ResponseEntity<VehicleImage> setPrimaryImage(
            @PathVariable Long vehicleId,
            @PathVariable Long imageId) {
        try {
            return ResponseEntity.ok(vehicleService.setPrimaryImage(vehicleId, imageId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{vehicleId}/images/type/{type}")
    public ResponseEntity<List<VehicleImage>> getImagesByType(
            @PathVariable Long vehicleId,
            @PathVariable String type) {
        try {
            return ResponseEntity.ok(vehicleService.getImagesByType(vehicleId, type));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}