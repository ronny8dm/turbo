package com.turbo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.turbo.model.CompetitorsListings;
import jakarta.data.repository.Repository;

@Repository
public interface CompetitorsListingsRepository extends JpaRepository<CompetitorsListings, Long> {

    List<CompetitorsListings> findByMakeAndModelAndYear(String make, String model, String year);

    boolean existsByMakeAndModelAndYear(String make, String model, String year);

}
