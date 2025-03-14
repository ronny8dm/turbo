package com.turbo.service;

import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;

public interface DashboardService {

    Map<String, Object> getSalesData(LocalDate startDate, LocalDate endDate, Long dealershipId);

    Map<String, Object> getDashboardSummary(Long dealershipId);

}
