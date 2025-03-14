package com.turbo.repository;

import com.turbo.model.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, Long> {
    List<VehicleImage> findByVehicleIdOrderByDisplayOrderAsc(Long vehicleId);

    Optional<VehicleImage> findByVehicleIdAndIsPrimaryTrue(Long vehicleId);

    List<VehicleImage> findByVehicleIdAndType(Long vehicleId, String type);

    List<VehicleImage> findByVehicleId(Long id);
}