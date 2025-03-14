package com.turbo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RegisterUserDto {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;

}
