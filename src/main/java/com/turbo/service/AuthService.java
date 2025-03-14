package com.turbo.service;

import com.turbo.dto.LoginUserDto;
import com.turbo.dto.RegisterUserDto;
import com.turbo.model.Authority;
import com.turbo.model.User;
import com.turbo.repository.UserRepository;
import com.turbo.utils.UserTypeEnum;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.turbo.repository.AuthorityRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailService userDetailService;
    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final AuthenticationManager authenticationManager;

    public AuthService(PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider,
            UserDetailService userDetailService, UserRepository userRepository, AuthorityRepository authorityRepository,
            AuthenticationManager authenticationManager) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailService = userDetailService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.authorityRepository = authorityRepository;
    }

    @Transactional
    public User signup(RegisterUserDto userDto) {

        if (!isValidPassword(userDto.getPassword())) {
            throw new IllegalArgumentException(
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and must be at least 8 characters long.");
        }

        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new IllegalArgumentException("Username already exists.");
        }

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = new User();
        user.setFirstName(userDto.getFirstName());
        user.setEmail(userDto.getEmail());
        user.setLastName(userDto.getLastName());
        user.setUsername(userDto.getUsername());
        user.setPhone(userDto.getPhone());
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        user.setUserType(UserTypeEnum.USER);
        user.setRole(UserTypeEnum.DEALER_OWNER);
        user.setEnabled(true);

        Authority authority = authorityRepository.findByAuthority("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Authority not found"));
        user.setAuthorities(Set.of(authority));

        return userRepository.save(user);
    }

    private boolean isValidPassword(String password) {
        String passwordPattern = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password != null && password.matches(passwordPattern);
    }

    @Transactional
    public User signupAsAdmin(RegisterUserDto input) {
        logger.debug("Starting signup process for admin: {}", input.getEmail());

        // Assign ROLE_ADMIN
        Authority adminAuthority = authorityRepository.findByAuthority("ROLE_ADMIN")
                .orElseGet(() -> {
                    logger.debug("ROLE_ADMIN not found, creating new authority");
                    Authority newAuthority = new Authority();
                    newAuthority.setAuthority("ROLE_ADMIN");
                    return authorityRepository.save(newAuthority);
                });

        // Create a new admin user with ROLE_ADMIN
        User admin = new User();
        admin.setFirstName(input.getFirstName());
        admin.setEmail(input.getEmail());
        admin.setLastName(input.getLastName());
        admin.setUsername(input.getUsername());
        admin.setPasswordHash(passwordEncoder.encode(input.getPassword()));
        admin.setUserType(UserTypeEnum.ADMIN);
        admin.setEnabled(true);
        admin.getAuthorities().add(adminAuthority);

        // Save the admin user
        User savedAdmin = userRepository.save(admin);
        logger.debug("Admin user created successfully: {}", savedAdmin);

        return savedAdmin;
    }

    @Transactional
    public UserDetails authenticate(LoginUserDto input) {
        logger.debug("Authenticating user: {}", input.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getUsername(),
                        input.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        logger.debug("User authenticated successfully: {}", userDetails.getUsername());

        return userDetails;
    }

    public UserDetails loadUserByUsername(String email) {
        return userDetailService.loadUserByUsername(email);
    }

}