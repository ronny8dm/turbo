package com.turbo.service;

import com.turbo.model.VehicleImage;
import com.turbo.model.Vehicle;
import com.turbo.repository.VehicleImageRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final VehicleImageRepository vehicleImageRepository;

    @Value("${app.upload.dir:${user.home}/uploads/vehicles}")
    private String uploadDir;

    public VehicleImage saveImage(MultipartFile file, Vehicle vehicle, int displayOrder, boolean isPrimary)
            throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + getExtension(file.getOriginalFilename());
        Path filePath = uploadPath.resolve(filename);

        // Save the file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Create VehicleImage entity
        VehicleImage image = new VehicleImage();
        image.setVehicle(vehicle);
        image.setUrl("/uploads/vehicles/" + filename);
        image.setThumbnailUrl("/uploads/vehicles/" + filename);
        image.setDisplayOrder(displayOrder);
        image.setFileSize(file.getSize());
        image.setContentType(file.getContentType());

        if (isPrimary) {
            vehicleImageRepository.findByVehicleIdAndIsPrimaryTrue(vehicle.getId())
                    .ifPresent(existingPrimary -> {
                        existingPrimary.setIsPrimary(false);
                        vehicleImageRepository.save(existingPrimary);
                    });
        }

        return vehicleImageRepository.save(image);
    }

    public void deleteImageFile(VehicleImage image) throws IOException {
        if (image.getUrl() == null) {
            return;
        }

        // Extract filename from URL
        String filename = image.getUrl().substring(image.getUrl().lastIndexOf('/') + 1);
        Path filePath = Paths.get(uploadDir, filename);

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Failed to delete image file: " + filePath, e);
            throw e;
        }
    }

    private String getExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse("");
    }
}