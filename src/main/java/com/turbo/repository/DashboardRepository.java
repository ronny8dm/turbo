package com.turbo.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.turbo.model.Vehicle;

import jakarta.data.repository.Repository;

@Repository
public interface DashboardRepository extends JpaRepository<Vehicle, Long> {

}