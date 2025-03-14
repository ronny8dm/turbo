package com.turbo.repository;

import com.turbo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.authorities WHERE u.email = :email")
    Optional<User> findByEmailWithAuthorities(@Param("email") String email);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmailAndDealership_Id(String email, Long dealershipId);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
