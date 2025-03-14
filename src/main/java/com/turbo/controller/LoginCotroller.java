package com.turbo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginCotroller {

    @GetMapping("/login")
    public String login() {
        return "login";
    }

}
