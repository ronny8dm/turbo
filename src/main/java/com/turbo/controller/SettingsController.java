package com.turbo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SettingsController {

    @GetMapping("/settings")
    public String getSettings() {
        return "layout/settings";
    }
}
