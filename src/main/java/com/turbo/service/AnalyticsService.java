package com.turbo.service;

import java.util.Map;
import java.time.LocalDate;

public interface AnalyticsService {

    Map<String, Object> getSalesData(LocalDate startDate, LocalDate endDate, Long dealershipId);

}
