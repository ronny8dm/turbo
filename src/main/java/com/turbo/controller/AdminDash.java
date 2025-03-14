package com.turbo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turbo.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class AdminDash {

    @Autowired
    public AdminDash(DashboardService dashboardService) {
    }

    @GetMapping("/admin")
    public String login() {
        return "admindash";
    }

}
