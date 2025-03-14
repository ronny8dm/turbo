package com.turbo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.turbo.model.Dealership;

@Repository
public interface DealershipRepository extends JpaRepository<Dealership, Long> {
    boolean existsByName(String name);

    boolean existsByEmail(String email);

    Optional<Dealership> findByOwnerId(Long ownerId);

    List<Dealership> findByUsers_Id(Long userId);

}
