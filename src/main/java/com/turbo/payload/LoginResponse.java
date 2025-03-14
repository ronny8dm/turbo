package com.turbo.payload;

import lombok.Getter;

@Getter
public class LoginResponse {
    // Getters and Setters
    private String token;
    private long expiresIn;

    public LoginResponse setToken(String token) {
        this.token = token;
        return this;
    }

    public LoginResponse setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
        return this;
    }
}
