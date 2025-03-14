package com.turbo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class VehicleDto {
    private Long id;
    private String make;
    private String model;
    private Integer year;
    private String vin;
    private String vrm;
    private BigDecimal listPrice;
    private String status;
    private Set<VehicleFeatureDto> features;
    private List<VehicleImageDto> images;
    private VehicleImageDto primaryImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
