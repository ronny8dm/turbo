package com.turbo.repository;

import com.turbo.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVin(String vin);

    Optional<Vehicle> findByVrm(String vrm);

    List<Vehicle> findByStatus(String status);

    List<Vehicle> findByMakeAndModel(String make, String model);

    List<Vehicle> findByDealershipId(Long dealershipId);

    @Query("SELECT v FROM Vehicle v WHERE v.status = 'AVAILABLE' AND v.dealership.id = ?1")
    List<Vehicle> findAvailableVehiclesByDealership(Long dealershipId);
}