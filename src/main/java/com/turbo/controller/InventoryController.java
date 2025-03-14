package com.turbo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class InventoryController {

    @GetMapping("/inventory")
    public String getInventory() {
        return "layout/inventory";
    }
}
