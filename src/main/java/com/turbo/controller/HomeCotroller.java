package com.turbo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeCotroller {

    @GetMapping("/")
    public String home() {
        return "layout/index";
    }
}
