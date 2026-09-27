package com.dhruva.securevault.security;

import com.dhruva.securevault.entity.User;
import com.dhruva.securevault.repository.UserRepository;
import com.dhruva.securevault.service.OAuthCodeService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuth2SuccessHandler
        implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OAuthCodeService oauthCodeService;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        if (email == null || email.isBlank()) {
            response.sendError(
                    HttpServletResponse.SC_BAD_REQUEST,
                    "Google account email not available."
            );
            return;
        }

        User user = userRepository.findByEmail(email)
                .orElse(null);

        // Existing account
        if (user != null) {

            // Existing LOCAL account cannot silently switch to Google
            if ("LOCAL".equalsIgnoreCase(user.getProvider())) {

                response.sendError(
                        HttpServletResponse.SC_CONFLICT,
                        "An account with this email already exists. Please login using email and password."
                );

                return;
            }

            // Existing GOOGLE account
            if ("GOOGLE".equalsIgnoreCase(user.getProvider())) {

                String code = oauthCodeService.createCode(
                        user.getEmail()
                );

                response.sendRedirect(
                        "http://localhost:5173/oauth2/callback?code="
                                + code
                );

                return;
            }
        }

        // New Google account
        User newUser = new User();

        newUser.setFullName(
                name != null && !name.isBlank()
                        ? name
                        : email.split("@")[0]
        );

        newUser.setEmail(email);
        newUser.setPassword(null);
        newUser.setProvider("GOOGLE");

        User savedUser = userRepository.save(newUser);

        // Create one-time OAuth code
        String code = oauthCodeService.createCode(
                savedUser.getEmail()
        );

        response.sendRedirect(
                "http://localhost:5173/oauth2/callback?code="
                        + code
        );
    }
}