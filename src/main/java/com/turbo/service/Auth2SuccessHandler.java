package com.turbo.service;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

@Component
public class Auth2SuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger logger = Logger.getLogger(Auth2SuccessHandler.class.getName());

    private final JwtTokenProvider jwtTokenProvider;

    public Auth2SuccessHandler(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
        logger.info("Auth2SuccessHandler initialized");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        logger.info("onAuthenticationSuccess method called");
        logger.info("Authentication success for user: " + authentication.getName());

        // Cast to OAuth2User
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        logger.info("OAuth2User details: " + oauth2User.getAttributes());

        // Extract user details and claims
        Map<String, Object> claims = new HashMap<>();
        claims.put("username", oauth2User.getAttribute("email")); // Assuming "email" attribute exists
        claims.put("roles", authentication.getAuthorities());
        logger.info("Claims: " + claims);

        // Create a temporary UserDetails-like object for JWT generation
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                oauth2User.getAttribute("email"), // Use email as the username
                "",
                authentication.getAuthorities() // Use the same authorities
        );
        logger.info("UserDetails created for JWT generation: " + userDetails);

        // Generate JWT token using the userDetails-like object
        String token = jwtTokenProvider.generateToken(claims, userDetails);
        logger.info("Generated JWT token: " + token);

        // Send HTML that will store both token and token in localStorage
        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authentication Success</title>
                    <script>
                        window.onload = function() {
                            // Store both as token and jwtToken for compatibility
                            localStorage.setItem('jwtToken', '%s');

                            sessionStorage.setItem('token', '%s');

                            console.log('Token stored in localStorage and sessionStorage');

                            // Check if token was stored successfully
                            const storedToken = localStorage.getItem('token');
                            if (storedToken) {
                                console.log('Token verified in localStorage');

                                // Redirect with a small delay to ensure storage is complete
                                setTimeout(function() {
                                    window.location.href = '/';
                                }, 100);
                            } else {
                                window.location.href = '/';
                            }
                        }
                    </script>
                </head>
                <body>
                    <p>Authentication successful. Redirecting...</p>
                </body>
                </html>
                """
                .formatted(token, token, token);

        response.setContentType("text/html;charset=UTF-8");
        response.getWriter().write(html);
    }
}