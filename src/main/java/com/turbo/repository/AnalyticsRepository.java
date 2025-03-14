package com.turbo.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.turbo.model.Vehicle;

import jakarta.data.repository.Repository;

@Repository
public interface AnalyticsRepository extends JpaRepository<Vehicle, Long> {

        @Query("SELECT CAST(v.soldDate AS date) as date, SUM(v.soldPrice) as total FROM Vehicle v " +
                        "WHERE v.soldDate BETWEEN :startDate AND :endDate AND v.status = 'Sold' AND v.dealership.id = :dealershipId "
                        +
                        "GROUP BY CAST(v.soldDate AS date) ORDER BY date")
        List<Object[]> findSalesByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT SUM(v.soldPrice) FROM Vehicle v " +
                        "WHERE v.soldDate BETWEEN :startDate AND :endDate AND v.status = 'Sold' AND v.dealership.id = :dealershipId")
        BigDecimal calculateTotalSalesAmount(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = :status AND v.dealership.id = :dealershipId")
        Long countVehiclesByStatus(@Param("status") String status, @Param("dealershipId") Long dealershipId);

        @Query("SELECT COUNT(v) FROM Vehicle v " +
                        "WHERE v.status = :status AND v.soldDate BETWEEN :startDate AND :endDate AND v.dealership.id = :dealershipId")
        Long countVehiclesByStatusAndDateRange(
                        @Param("status") String status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT v FROM Vehicle v WHERE v.status = 'Sold' AND v.soldDate IS NOT NULL AND v.dealership.id = :dealershipId")
        List<Vehicle> findSoldVehicles(@Param("dealershipId") Long dealershipId);

        @Query("SELECT CAST(v.soldDate AS date) as saleDate, COUNT(v), AVG(v.soldPrice) FROM Vehicle v " +
                        "WHERE v.status = 'Sold' AND v.soldDate BETWEEN :startDate AND :endDate " +
                        "AND v.dealership.id = :dealershipId " +
                        "GROUP BY CAST(v.soldDate AS date) ORDER BY saleDate")
        List<Object[]> findVehiclesSoldByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT COUNT(v) FROM Vehicle v " +
                        "WHERE v.status = 'Sold' AND v.soldDate BETWEEN :startDate AND :endDate " +
                        "AND v.dealership.id = :dealershipId")
        Integer countVehiclesSold(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT AVG(v.listPrice) FROM Vehicle v " +
                        "WHERE v.status = 'Sold' AND v.soldDate BETWEEN :startDate AND :endDate " +
                        "AND v.dealership.id = :dealershipId")
        BigDecimal calculateAverageListPrice(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT AVG(v.soldPrice) FROM Vehicle v " +
                        "WHERE v.status = 'Sold' AND v.soldDate BETWEEN :startDate AND :endDate " +
                        "AND v.dealership.id = :dealershipId")
        BigDecimal calculateAverageSoldPrice(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.dealership.id = :dealershipId")
        Integer countTotalVehicles(@Param("dealershipId") Long dealershipId);

        @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.createdAt <= :before AND v.dealership.id = :dealershipId")
        Integer countTotalVehiclesBefore(
                        @Param("before") LocalDateTime before,
                        @Param("dealershipId") Long dealershipId);

       
        @Query(value = "SELECT AVG(DATEDIFF(sold_date, created_at)) " +
                        "FROM vehicle " +
                        "WHERE status = 'Sold' AND sold_date IS NOT NULL", nativeQuery = true)
        Double calculateAverageDaysToSell();

        @Query("SELECT DISTINCT v.bodyStyle FROM Vehicle v WHERE v.dealership.id = :dealershipId")
        List<String> findDistinctBodyStyles(@Param("dealershipId") Long dealershipId);

        @Query("""
                        SELECT v.make as brand, v.model, v.bodyStyle, COUNT(v) as quantity,
                        (COUNT(v) * 100.0 / (SELECT COUNT(*) FROM Vehicle v2 WHERE v2.status = 'Sold'
                        AND v2.dealership.id = :dealershipId AND v2.soldDate BETWEEN :startDate AND :endDate)) as percentage
                        FROM Vehicle v
                        WHERE v.status = 'Sold'
                        AND v.dealership.id = :dealershipId
                        AND v.soldDate BETWEEN :startDate AND :endDate
                        GROUP BY v.make, v.model, v.bodyStyle
                        ORDER BY COUNT(v) DESC
                        """)
        List<Object[]> findTopSellingCarsByDateRange(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("""
                        SELECT v.make as brand, v.model, COUNT(v) as quantity,
                        (COUNT(v) * 100.0 / (SELECT COUNT(*) FROM Vehicle v2
                        WHERE v2.status = 'Sold' AND v2.bodyStyle = :bodyStyle
                        AND v2.dealership.id = :dealershipId AND v2.soldDate BETWEEN :startDate AND :endDate)) as percentage
                        FROM Vehicle v
                        WHERE v.status = 'Sold'
                        AND v.bodyStyle = :bodyStyle
                        AND v.dealership.id = :dealershipId
                        AND v.soldDate BETWEEN :startDate AND :endDate
                        GROUP BY v.make, v.model
                        ORDER BY COUNT(v) DESC
                        """)
        List<Object[]> findTopSellingCarsByBodyStyle(
                        @Param("bodyStyle") String bodyStyle,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

        @Query("""
                        SELECT COUNT(v) FROM Vehicle v
                        WHERE v.status = 'Available'
                        AND v.dealership.id = :dealershipId
                        """)
        Long countAvailableVehicles(@Param("dealershipId") Long dealershipId);

        @Query("""
                        SELECT COUNT(v) FROM Vehicle v
                        WHERE v.status = 'Reserved'
                        AND v.dealership.id = :dealershipId
                        """)
        Long countReservedVehicles(@Param("dealershipId") Long dealershipId);

        @Query("""
                        SELECT COUNT(v) FROM Vehicle v
                        WHERE (v.status = 'Available' OR v.status = 'Reserved')
                        AND v.dealership.id = :dealershipId
                        """)
        Long countTotalCurrentStock(@Param("dealershipId") Long dealershipId);

        @Query(value = """
                        SELECT
                            COUNT(*) as total,
                            SUM(CASE WHEN enabled = true THEN 1 ELSE 0 END) as active,
                            SUM(CASE WHEN enabled = false THEN 1 ELSE 0 END) as inactive
                        FROM users
                        WHERE dealership_id = :dealershipId
                        AND user_type = 'DEALER_SALES'
                        """, nativeQuery = true)
        Object[] getEmployeeStats(@Param("dealershipId") Long dealershipId);

        @Query(value = """
                        SELECT AVG(daily_count) FROM (
                            SELECT DATE(created_at) as day, COUNT(*) as daily_count
                            FROM vehicles
                            WHERE dealership_id = :dealershipId
                            AND created_at BETWEEN :startDate AND :endDate
                            GROUP BY DATE(created_at)
                        ) as daily_counts
                        """, nativeQuery = true)
        Double calculateAverageInventory(
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("dealershipId") Long dealershipId);

}
