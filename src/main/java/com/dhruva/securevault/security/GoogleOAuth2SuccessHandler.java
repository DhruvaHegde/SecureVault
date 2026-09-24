package com.dhruva.securevault.security;

import com.dhruva.securevault.entity.User;
import com.dhruva.securevault.repository.UserRepository;
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
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

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
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setFullName(
                            name != null && !name.isBlank()
                                    ? name
                                    : email.split("@")[0]
                    );

                    newUser.setEmail(email);

                    newUser.setPassword(null);

                    newUser.setProvider("GOOGLE");

                    return userRepository.save(newUser);
                });

        // If an existing account is being used with Google,
        // mark it as Google-enabled.
        if (user.getProvider() == null ||
                user.getProvider().isBlank()) {

            user.setProvider("GOOGLE");
            userRepository.save(user);
        }

        String token = jwtUtil.generateToken(user.getEmail());

        String frontendUrl =
                "http://localhost:5173/oauth2/callback?token="
                        + token;

        response.sendRedirect(frontendUrl);
    }
}