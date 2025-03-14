package com.turbo.repository;

import com.turbo.model.VehicleFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleFeatureRepository extends JpaRepository<VehicleFeature, Long> {
    List<VehicleFeature> findByVehicleId(Long vehicleId);
}