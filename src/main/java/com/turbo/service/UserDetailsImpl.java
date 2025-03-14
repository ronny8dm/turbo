package com.turbo.service;

import com.turbo.model.Authority;
import com.turbo.model.User;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;




public class UserDetailsImpl implements UserDetails {

    private Long id;
    private String username;
    private String email;
    private String password;
    private Boolean enabled;
    private Collection<Authority> authorities;
    private User user;

    // Constructor
    public UserDetailsImpl(Long id, String username, String email, String password, Boolean enabled,
            Collection<Authority> authorities, User user) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
        this.user = user;
    }

    
    public static UserDetailsImpl build(User user) {
        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(), 
                user.getEmail(),
                user.getPasswordHash(),
                user.getEnabled(),
                user.getAuthorities(),
                user);
    }


    @Override
    public Collection<Authority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username; 
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; 
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; 
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; 
    }

    @Override
    public boolean isEnabled() {
        return enabled != null ? enabled : true;
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return user.getFirstName();
    }

    public String getLastName() {
        return user.getLastName();
    }

    public String getEmail() {
        return user.getEmail();
    }
}
