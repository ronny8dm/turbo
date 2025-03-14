package com.turbo.service;

import com.turbo.model.Authority;
import com.turbo.model.User;
import com.turbo.repository.AuthorityRepository;
import com.turbo.repository.UserRepository;
import com.turbo.utils.UserTypeEnum;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
@Transactional
public class Auth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = new DefaultOAuth2UserService().loadUser(userRequest);

       
        System.out.println("OAuth2User loaded: " + oauth2User.getAttributes());

       
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

    
        System.out.println("Extracted email: " + email);
        System.out.println("Extracted name: " + name);

      
        Optional<User> existingUser = userRepository.findByEmailWithAuthorities(email);

        if (existingUser.isEmpty()) {
           
            System.out.println("User not found, creating new user");

           
            User user = new User();
            user.setEmail(email);
            user.setUsername(email); 

           
            String[] nameParts = name.split(" ");
            user.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
            user.setLastName(nameParts.length > 1 ? nameParts[1] : "");

            user.setEnabled(true);
            user.setUserType(UserTypeEnum.USER); 

            
            Authority authority = authorityRepository.findByAuthority("ROLE_USER")
                    .orElseGet(() -> {
                        Authority newAuthority = new Authority();
                        newAuthority.setAuthority("ROLE_USER");
                        return authorityRepository.save(newAuthority);
                    });

            user.getAuthorities().add(authority);

            String randomPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
            user.setPasswordHash(randomPasswordHash);

            userRepository.save(user);

          
            System.out.println("New user created: " + user);
        } else {
            
            System.out.println("User found: " + existingUser.get());
        }

        return oauth2User;
    }

}