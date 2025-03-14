package com.turbo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Getter
@Setter
@Entity
@Table(name = "vehicles")
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "vehicle_seq")
    @SequenceGenerator(name = "vehicle_seq", sequenceName = "vehicle_sequence", allocationSize = 1)
    private Long id;

    private String abiCode;
    private String description;
    private Integer year;
    private String make;
    private String model;
    private String bodyStyle;
    private String engineSize;
    private Integer doors;
    private String transmission;
    private String fuelType;
    private Integer seats;
    private String vin;
    private String engineNumber;
    private String colour;
    private String imageUrl;

    private Integer insuranceGroup;
    private Integer insuranceGroupMax;

    private String vrm;
    private String status = "Available";

    @NotNull
    private BigDecimal listPrice;
    private BigDecimal soldPrice;

    @ManyToOne
    @JoinColumn(name = "sold_by_user_id")
    private User soldBy;

    private LocalDateTime soldDate;

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private Set<VehicleFeature> features = new HashSet<>();

    @OneToMany(mappedBy = "vehicle", fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private Set<VehicleImage> images = new HashSet<>();

    public VehicleImage getPrimaryImage() {
        return images.stream()
                .filter(VehicleImage::getIsPrimary)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.iterator().next());
    }

    @ManyToOne
    @JoinColumn(name = "dealership_id")
    private Dealership dealership;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Version
    private Long version;

    public Integer getDaysInStock() {
        if (createdAt == null) {
            return 0;
        }
        return (int) Duration.between(createdAt, LocalDateTime.now()).toDays();
    }
}