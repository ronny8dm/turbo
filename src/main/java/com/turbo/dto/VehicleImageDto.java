package com.turbo.dto;

import java.time.LocalDateTime;
import com.turbo.model.VehicleImage;
import lombok.Data;

@Data
public class VehicleImageDto {
    private Long id;
    private String url;
    private String title;
    private String description;
    private String type;
    private Boolean isPrimary;
    private Integer displayOrder;
    private String thumbnailUrl;
    private Long fileSize;
    private String contentType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VehicleImageDto fromEntity(VehicleImage image) {
        VehicleImageDto dto = new VehicleImageDto();
        dto.setId(image.getId());
        dto.setUrl(image.getUrl());
        dto.setTitle(image.getTitle());
        dto.setDescription(image.getDescription());
        dto.setType(image.getType());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setThumbnailUrl(image.getThumbnailUrl());
        dto.setFileSize(image.getFileSize());
        dto.setContentType(image.getContentType());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setUpdatedAt(image.getUpdatedAt());
        return dto;
    }
}