// DealershipService.java
package com.turbo.service;

import com.turbo.dto.DealershipDto;
import com.turbo.dto.UserDto;
import com.turbo.model.Authority;
import com.turbo.model.Dealership;
import com.turbo.model.User;
import com.turbo.repository.AuthorityRepository;
import com.turbo.repository.DealershipRepository;
import com.turbo.repository.UserRepository;
import com.turbo.utils.UserTypeEnum;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class DealershipService {

    @Autowired
    private final DealershipRepository dealershipRepository;
    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final PasswordEncoder passwordEncoder;
    @Autowired
    private final PasswordResetService passwordResetService;
    @Autowired
    private AuthorityRepository authorityRepository;

    

    public Dealership createDealership(DealershipDto dto, String ownerUsername) {

        System.out.println("Creating dealership for owner: {} " + ownerUsername);

        User owner = userRepository.findByEmail(ownerUsername) // Try email first
                .orElseGet(() -> userRepository.findByUsername(ownerUsername)
                        .orElseThrow(() -> {
                            System.out.println("User not found with username/email: {} " + ownerUsername);
                            return new EntityNotFoundException("User not found");
                        }));
        System.out.println("Owner found: {} " + owner);

        if (dealershipRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Dealership with this email already exists");
        }

        Dealership dealership = new Dealership();
        dealership.setName(dto.getName());
        dealership.setAddress(dto.getAddress());
        dealership.setPhone(dto.getPhone());
        dealership.setEmail(dto.getEmail());
        dealership.setOwner(owner);

        owner.setDealership(dealership);
        return dealershipRepository.save(dealership);
    }

    public User addUserToDealership(Long dealershipId, UserDto dto) {
        Dealership dealership = dealershipRepository.findById(dealershipId)
                .orElseThrow(() -> new EntityNotFoundException("Dealership not found"));

        // Check if user already exists in this dealership
        if (userRepository.findByEmailAndDealership_Id(dto.getEmail(), dealershipId).isPresent()) {
            throw new IllegalArgumentException("User with email " + dto.getEmail() +
                    " is already registered to this dealership");
        }

        // Check if user exists in system
        User user = userRepository.findByEmail(dto.getEmail())
                .map(existingUser -> {
                    if (existingUser.getDealership() != null) {
                        throw new IllegalArgumentException("User is already associated with another dealership");
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(dto.getUsername());
                    newUser.setEmail(dto.getEmail());
                    newUser.setFirstName(dto.getFirstName());
                    newUser.setLastName(dto.getLastName());
                    String tempPassword = generateTemporaryPassword();
                    newUser.setPasswordHash(passwordEncoder.encode(tempPassword));
                    newUser.setUserType(UserTypeEnum.DEALER_SALES);
                    newUser.setRole(UserTypeEnum.DEALER_SALES);
                    newUser.setEnabled(true);

                    Authority authority = authorityRepository.findByAuthority("ROLE_USER")
                            .orElseGet(() -> {
                                Authority newAuthority = new Authority();
                                newAuthority.setAuthority("ROLE_USER");
                                return authorityRepository.save(newAuthority);
                            });

                    Set<Authority> authorities = new HashSet<>();
                    authorities.add(authority);
                    newUser.setAuthorities(authorities);

                    return newUser;

                });

        user.setDealership(dealership);
        User savedUser = userRepository.save(user);

        // Only create reset token for new users
        if (user.getPasswordHash() != null) {
            passwordResetService.createPasswordResetTokenForUser(savedUser);
        }

        return savedUser;
    }

    private String generateTemporaryPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public Dealership getDealership(Long id) {
        return dealershipRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dealership not found"));
    }

    public List<Dealership> getAllDealerships() {
        return dealershipRepository.findAll();
    }

    public Dealership updateDealership(Long id, DealershipDto dto) {
        Dealership dealership = getDealership(id);

        dealership.setName(dto.getName());
        dealership.setAddress(dto.getAddress());
        dealership.setPhone(dto.getPhone());
        dealership.setEmail(dto.getEmail());

        return dealershipRepository.save(dealership);
    }

    public void deleteDealership(Long id) {
        if (!dealershipRepository.existsById(id)) {
            throw new EntityNotFoundException("Dealership not found");
        }
        dealershipRepository.deleteById(id);
    }

    public List<User> getDealershipUsers(Long dealershipId) {
        Dealership dealership = getDealership(dealershipId);
        return new ArrayList<>(dealership.getUsers());
    }

}