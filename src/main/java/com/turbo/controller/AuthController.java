package com.turbo.controller;

import com.turbo.dto.RegisterUserDto;
import com.turbo.dto.LoginUserDto;
import com.turbo.model.User;
import com.turbo.payload.LoginResponse;
import com.turbo.service.AuthService;
import com.turbo.service.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class.getName());

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        logger.info("AuthController initialized successfully");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterUserDto userDto) {
        try {
            authService.signup(userDto);
            return ResponseEntity.ok("User registered successfully!");
        } catch (IllegalArgumentException e) {
            log.error("Validation error during signup: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            log.error("Database constraint violation during signup: ", e);
            if (e.getMessage().contains("users_username_key")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Username is already taken.");
            } else if (e.getMessage().contains("users_email_key")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered.");
            }
            return ResponseEntity.badRequest().body("Invalid data provided.");
        } catch (Exception e) {
            log.error("Unexpected error during signup: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @PostMapping("/signup-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterUserDto registerUserDto) {
        User user = authService.signupAsAdmin(registerUserDto);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        try {
            logger.info("Authenticating user with email: " + loginUserDto.getUsername());
            UserDetails authenticatedUser = authService.authenticate(loginUserDto);
            log.info("User authenticated successfully: " + authenticatedUser.getUsername());

            Map<String, Object> claims = Map.of(
                    "username", authenticatedUser.getUsername());
            log.info("Claims created: " + claims);

            String jwtToken = jwtTokenProvider.generateToken(claims, authenticatedUser);
            logger.info("JWT token generated: " + jwtToken);

            LoginResponse loginResponse = new LoginResponse()
                    .setToken(jwtToken)
                    .setExpiresIn(jwtTokenProvider.getExpirationTime());
            log.info("Returning response: " + loginResponse);

            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            log.error("Authentication failed: " + e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<Void> verifyToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            if (jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
