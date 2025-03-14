// UserService.java
package com.turbo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.turbo.dto.UserDto;
import com.turbo.model.User;
import com.turbo.repository.PasswordResetTokenRepository;
import com.turbo.repository.UserRepository;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public UserService(UserRepository userRepository, PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User findByEmail(String email) {
        logger.debug("Finding user by email: " + email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found for email: " + email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
    }

    public User updateUserProfile(String email, UserDto updateDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean needsUpdate = false;

        if (updateDto.getEmail() != null && !updateDto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateDto.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(updateDto.getEmail());
            needsUpdate = true;
        }

        if (updateDto.getPhone() != null && !updateDto.getPhone().equals(user.getPhone())) {
            user.setPhone(updateDto.getPhone());
            needsUpdate = true;
        }

        if (updateDto.getFirstName() != null) {
            user.setFirstName(updateDto.getFirstName());
            needsUpdate = true;
        }

        if (updateDto.getLastName() != null) {
            user.setLastName(updateDto.getLastName());
            needsUpdate = true;
        }

        if (updateDto.getNewPassword() != null && !updateDto.getNewPassword().isBlank()) {
            if (updateDto.getCurrentPassword() == null
                    || !passwordEncoder.matches(updateDto.getCurrentPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
            user.setPasswordHash(passwordEncoder.encode(updateDto.getNewPassword()));
            needsUpdate = true;
        }

        // Save and return user only if there are updates
        return needsUpdate ? userRepository.save(user) : user;
    }

    public void deleteUser(Long userId) {
        logger.debug("Deleting user with ID: " + userId);
        passwordResetTokenRepository.deleteByUserId(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    logger.error("User not found for ID: " + userId);
                    return new UsernameNotFoundException("User not found with ID: " + userId);
                });

        userRepository.delete(user);
        logger.info("User successfully deleted: " + userId);
    }
}