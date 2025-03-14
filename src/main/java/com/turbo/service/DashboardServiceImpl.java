package com.turbo.service;

import com.turbo.repository.DashboardRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final DashboardRepository dashboardRepository;

    

    @Override
    public Map<String, Object> getSalesData(LocalDate startDate, LocalDate endDate, Long dealershipId) {

        return null;
    }

    @Override
    public Map<String, Object> getDashboardSummary(Long dealershipId) {
        return null;
    }
}