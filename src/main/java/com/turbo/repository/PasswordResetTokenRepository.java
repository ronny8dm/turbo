package com.turbo.repository;

import com.turbo.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    PasswordResetToken findByToken(String token);

    void deleteByUserId(Long userId);

    boolean existsByToken(String token);

    PasswordResetToken findByUser_Id(Long userId);
}
