package com.turbo.controller;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseEntity.BodyBuilder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turbo.dto.UserDto;
import com.turbo.dto.UserProfileResponse;
import com.turbo.model.User;
import com.turbo.service.UserDetailsImpl;
import com.turbo.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserDto userDto,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        try {
            User updatedUser = userService.updateUserProfile(currentUser.getUsername(), userDto);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        logger.info("Getting profile for user: " + currentUser.getUsername());
        try {
            User user = userService.findByEmail(currentUser.getUsername());
            UserProfileResponse response = UserProfileResponse.fromUser(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting user profile: ", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("Request to delete user: " + userId);
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok()
                    .body(new HashMap<String, String>() {
                        {
                            put("message", "User successfully deleted");
                        }
                    });
        } catch (UsernameNotFoundException e) {
            logger.error("Error deleting user: ", e);
            return ((BodyBuilder) ResponseEntity.notFound())
                    .body(new HashMap<String, String>() {
                        {
                            put("error", e.getMessage());
                        }
                    });
        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.badRequest()
                    .body(new HashMap<String, String>() {
                        {
                            put("error", e.getMessage());
                        }
                    });
        }
    }

}
