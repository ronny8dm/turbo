package com.turbo.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turbo.repository.AnalyticsRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    @Override
    public Map<String, Object> getSalesData(LocalDate startDate, LocalDate endDate, Long dealershipId) {
        System.out.println("Raw input - startDate: " + startDate + ", endDate: " + endDate);

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

       
        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        System.out.println("Current period: " + startDate + " to " + endDate);
        System.out.println("Days in current period: " + daysBetween);

      
        List<Object[]> salesData = analyticsRepository.findSalesByDateRange(startDateTime, endDateTime, dealershipId);
        List<String> bodyStyles = analyticsRepository.findDistinctBodyStyles(dealershipId);
        List<Object[]> topSellingCars = analyticsRepository.findTopSellingCarsByDateRange(startDateTime, endDateTime,
                dealershipId);

        Map<String, List<Map<String, Object>>> topSellingByBodyStyle = new HashMap<>();
        Long availableVehicles = analyticsRepository.countAvailableVehicles(dealershipId);
        Long reservedVehicles = analyticsRepository.countReservedVehicles(dealershipId);
        Long totalStock = analyticsRepository.countTotalCurrentStock(dealershipId);
        Object[] employeeStats = analyticsRepository.getEmployeeStats(dealershipId);
        Double averageInventory = analyticsRepository.calculateAverageInventory(
                startDateTime, endDateTime, dealershipId);

        if (averageInventory == null) {
            averageInventory = 1.0;
        }

        for (String bodyStyle : bodyStyles) {
            List<Object[]> bodyStyleData = analyticsRepository.findTopSellingCarsByBodyStyle(
                    bodyStyle, startDateTime, endDateTime, dealershipId);

            List<Map<String, Object>> formattedData = bodyStyleData.stream()
                    .map(row -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("brand", row[0]);
                        item.put("model", row[1]);
                        item.put("quantity", row[2]);
                        item.put("percentage", row[3]);
                        return item;
                    })
                    .collect(Collectors.toList());

            topSellingByBodyStyle.put(bodyStyle, formattedData);
        }

        List<Map<String, Object>> formattedTopSelling = topSellingCars.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("model", row[1]);
                    item.put("bodyStyle", row[2]);
                    item.put("quantity", row[3]);
                    item.put("percentage", row[4]);
                    return item;
                })
                .collect(Collectors.toList());
       
        BigDecimal totalSales = analyticsRepository.calculateTotalSalesAmount(startDateTime, endDateTime, dealershipId);
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        
        LocalDate previousEndDate = startDate.minusDays(1);
        LocalDate previousStartDate = previousEndDate.minusDays(daysBetween - 1);
        LocalDateTime previousStartDateTime = previousStartDate.atStartOfDay();
        LocalDateTime previousEndDateTime = previousEndDate.plusDays(1).atStartOfDay();

       
        System.out.println(
                "Previous period: " + previousStartDate + " to " + previousEndDate + " (" + daysBetween + " days)");

        BigDecimal previousTotal = analyticsRepository.calculateTotalSalesAmount(previousStartDateTime,
                previousEndDateTime, dealershipId);
        if (previousTotal == null) {
            previousTotal = BigDecimal.ZERO;
        }

        System.out.println("Previous total: " + previousTotal);
        System.out.println("Current total: " + totalSales);

        double percentageChange = 0;
        if (previousTotal.compareTo(BigDecimal.ZERO) > 0) {
           
            percentageChange = totalSales.subtract(previousTotal)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(previousTotal, 2, RoundingMode.HALF_UP)
                    .doubleValue();

            
        }

        System.out.println("Percentage change: " + percentageChange + "%");

  
        List<Object[]> vehiclesSoldByDate = analyticsRepository.findVehiclesSoldByDateRange(startDateTime, endDateTime,
                dealershipId);
        Integer totalVehiclesSold = analyticsRepository.countVehiclesSold(startDateTime, endDateTime, dealershipId);
        if (totalVehiclesSold == null) {
            totalVehiclesSold = 0;
        }

        Integer previousVehiclesSold = analyticsRepository.countVehiclesSold(previousStartDateTime, previousEndDateTime,
                dealershipId);
        if (previousVehiclesSold == null) {
            previousVehiclesSold = 0;
        }

        System.out.println("Previous vehicles sold: " + previousVehiclesSold);
        System.out.println("Current vehicles sold: " + totalVehiclesSold);

        double vehicleSalesPercentageChange = 0;
        if (previousVehiclesSold > 0) {
            vehicleSalesPercentageChange = ((double) (totalVehiclesSold - previousVehiclesSold) * 100)
                    / previousVehiclesSold;

        }

        System.out.println("Vehicle sales percentage change: " + vehicleSalesPercentageChange + "%");

   
        BigDecimal averageListPrice = analyticsRepository.calculateAverageListPrice(startDateTime, endDateTime,
                dealershipId);
        BigDecimal averageSoldPrice = analyticsRepository.calculateAverageSoldPrice(startDateTime, endDateTime,
                dealershipId);

        if (averageListPrice == null) {
            averageListPrice = BigDecimal.ZERO;
        }

        if (averageSoldPrice == null) {
            averageSoldPrice = BigDecimal.ZERO;
        }

        double profitMargin = 0;
        if (averageListPrice.compareTo(BigDecimal.ZERO) > 0) {
            profitMargin = averageSoldPrice.subtract(averageListPrice)
                    .divide(averageListPrice, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }

       
        Map<String, Object> result = new HashMap<>();
        result.put("totalSales", totalSales);
        result.put("percentageChange", percentageChange);
        result.put("salesData", salesData);
        result.put("vehiclesSoldByDate", vehiclesSoldByDate);
        result.put("totalVehiclesSold", totalVehiclesSold);
        result.put("vehicleSalesPercentageChange", vehicleSalesPercentageChange);
        result.put("averagePrice", averageSoldPrice);
        result.put("profitMargin", profitMargin);
        result.put("topSellingCars", formattedTopSelling);
        result.put("topSellingByBodyStyle", topSellingByBodyStyle);
        result.put("bodyStyles", bodyStyles);
        result.put("availableVehicles", availableVehicles);
        result.put("reservedVehicles", reservedVehicles);
        result.put("totalStock", totalStock);
        result.put("employeeStats", employeeStats);
        result.put("averageInventory", averageInventory);

        return result;
    }

}
