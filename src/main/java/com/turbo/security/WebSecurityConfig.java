package com.turbo.security;

import com.turbo.config.JwtAuthenticationFilter;
import com.turbo.service.Auth2SuccessHandler;
import com.turbo.service.Auth2UserService;
import com.turbo.service.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.util.List;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

        private static final Log logger = LogFactory.getLog(WebSecurityConfig.class);

        private final AuthenticationProvider authenticationProvider;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final Auth2UserService auth2UserService;
        private final Auth2SuccessHandler auth2SuccessHandler;

        @Autowired
        JwtTokenProvider jwtTokenProvider;

        public WebSecurityConfig(
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        AuthenticationProvider authenticationProvider, Auth2UserService auth2UserService,
                        Auth2SuccessHandler auth2SuccessHandler) {
                this.authenticationProvider = authenticationProvider;
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.auth2UserService = auth2UserService;
                this.auth2SuccessHandler = auth2SuccessHandler;
                logger.debug("WebSecurityConfig initialized with JwtAuthenticationFilter, AuthenticationProvider, and Auth2UserService");
        }

        @Bean
        public AuthenticationManager authenticationManagerBean(AuthenticationConfiguration authenticationConfiguration)
                        throws Exception {
                logger.debug("Creating AuthenticationManager bean");
                return authenticationConfiguration.getAuthenticationManager();
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                logger.debug("Configuring SecurityFilterChain");
                http
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                                .authorizeHttpRequests(authorize -> authorize
                                                .requestMatchers("/api/auth/**", "/api/password/**", "/grantcode",
                                                                "/login",
                                                                "/signup", "/error", "/webjars/**", "/css/**", "/js/**",
                                                                "/images/**")
                                                .permitAll()
                                                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                                                .requestMatchers("/api/**", "/api/new_listing/**/images")
                                                .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .oauth2Login(oauth2 -> oauth2
                                                .loginPage("/login")
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(auth2UserService))
                                                .successHandler(auth2SuccessHandler))
                                .logout(logout -> logout
                                                .logoutUrl("/api/auth/logout")
                                                .permitAll());

                logger.debug("SecurityFilterChain configured successfully");
                return http.build();
        }

        @Bean
        CorsConfigurationSource corsConfigurationSource() {
                logger.debug("Configuring CORS");
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(List.of("http://localhost:8080"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration("/**", configuration);

                logger.debug("CORS configuration completed");
                return source;
        }
}