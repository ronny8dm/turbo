package com.turbo.service;

import com.turbo.model.User;
import com.turbo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        // Fetch user with authorities
        User user = userRepository.findByEmailWithAuthorities(emailOrUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + emailOrUsername));

        // Debugging
        System.out.println("User authorities: " + user.getAuthorities());

        return UserDetailsImpl.build(user);
    }
}
