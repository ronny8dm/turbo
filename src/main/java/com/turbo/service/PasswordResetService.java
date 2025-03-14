package com.turbo.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.turbo.model.PasswordResetToken;
import com.turbo.model.User;
import com.turbo.repository.PasswordResetTokenRepository;
import com.turbo.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void createPasswordResetTokenForUser(User user) {
        PasswordResetToken existingToken = tokenRepository.findByUser_Id(user.getId());
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken();
        myToken.setToken(token);
        myToken.setUser(user);
        myToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(myToken);
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public String validatePasswordResetToken(String token) {
        PasswordResetToken passToken = tokenRepository.findByToken(token);
        if (passToken == null) {
            return "invalidToken";
        }
        if (passToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return "expired";
        }
        return null;
    }

    public Optional<User> getUserByToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        return resetToken != null ? Optional.of(resetToken.getUser()) : Optional.empty();
    }

    public void invalidateToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken != null) {
            tokenRepository.delete(resetToken);
        }
    }

    public Optional<User> getUserByTokenAndInvalidate(String token) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token);
        if (resetToken != null) {
            User user = resetToken.getUser();
            tokenRepository.delete(resetToken); // Invalidate token after use
            return Optional.of(user);
        }
        return Optional.empty();
    }
}
