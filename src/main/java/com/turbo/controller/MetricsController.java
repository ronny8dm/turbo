package com.turbo.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.turbo.service.AnalyticsService;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public MetricsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics")
    public String getAnalytics() {
        return "layout/analytics";
    }

    @GetMapping("/sales")
    public ResponseEntity<Map<String, Object>> getSalesData(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Long dealershipId) {

        System.out.println("API received parameters: startDate=" + startDate + ", endDate=" + endDate
                + ", dealershipId=" + dealershipId);

        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);

        }
        if (endDate == null) {
            endDate = LocalDate.now();

        }
        Map<String, Object> salesData = analyticsService.getSalesData(startDate, endDate, dealershipId);
        return ResponseEntity.ok(salesData);
    }
}
