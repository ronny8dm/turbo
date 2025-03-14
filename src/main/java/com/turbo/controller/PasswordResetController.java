package com.turbo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import com.turbo.model.User;
import com.turbo.repository.UserRepository;
import com.turbo.service.PasswordResetService;

@Controller
@RequestMapping("/api/password")
public class PasswordResetController {
    private final PasswordResetService passwordResetService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetController(PasswordResetService passwordResetService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.passwordResetService = passwordResetService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/reset-request")
    public ResponseEntity<String> resetPasswordRequest(@RequestParam("email") String email) {
        return userRepository.findByEmailWithAuthorities(email)
                .map(user -> {
                    passwordResetService.createPasswordResetTokenForUser(user);
                    return ResponseEntity.ok("Reset password email sent");
                })
                .orElse(ResponseEntity.badRequest().body("User not found"));
    }

    @PostMapping("/reset")
    public String resetPassword(@RequestParam("token") String token,
            @RequestParam("password") String password,
            RedirectAttributes redirectAttributes) {
        String result = passwordResetService.validatePasswordResetToken(token);
        if (result != null) {
            redirectAttributes.addFlashAttribute("error", "Invalid token");
            return "redirect:/login";
        }

        return passwordResetService.getUserByToken(token)
                .map(user -> {
                    user.setPasswordHash(passwordEncoder.encode(password));
                    userRepository.save(user);
                    redirectAttributes.addFlashAttribute("message", "Password reset successful. Please login.");
                    return "redirect:/login";
                })
                .orElse("redirect:/login");
    }

    @GetMapping("/reset-password")
    public String showResetPasswordForm(@RequestParam String token, Model model) {
        String result = passwordResetService.validatePasswordResetToken(token);
        if (result != null) {
            return "redirect:/error?message=" + result;
        }
        model.addAttribute("token", token);
        return "reset-password";
    }

    @GetMapping("/forgot")
    public String showForgotPasswordForm(Model model) {
        return "forgot-password";
    }
}