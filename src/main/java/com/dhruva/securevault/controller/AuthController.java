package com.dhruva.securevault.controller;

import com.dhruva.securevault.dto.LoginRequest;
import com.dhruva.securevault.dto.RegisterRequest;
import com.dhruva.securevault.security.JwtUtil;
import com.dhruva.securevault.service.OAuthCodeService;
import com.dhruva.securevault.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private OAuthCodeService oauthCodeService;

    @Autowired
    private JwtUtil jwtUtil;

    // Register
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request
    ) {

        String result = userService.registerUser(request);

        if ("Email already exists!".equals(result)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", result));
        }

        return ResponseEntity.ok(
                Map.of("message", result)
        );
    }

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        String result = userService.loginUser(request);

        // User not found
        if ("User not found!".equals(result)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", result));
        }

        // Wrong password
        if ("Invalid Password!".equals(result)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", result));
        }

        // Google account trying password login
        if (result.startsWith("This account uses Google login")) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", result));
        }

        // Successful login
        return ResponseEntity.ok(
                Map.of("token", result)
        );
    }

    // Google OAuth code exchange
    @PostMapping("/oauth2/exchange")
    public ResponseEntity<?> exchangeOAuthCode(
            @RequestBody Map<String, String> request
    ) {

        String code = request.get("code");

        if (code == null || code.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "OAuth code is required."
                    ));
        }

        String email = oauthCodeService.consumeCode(code);

        if (email == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid or expired OAuth code."
                    ));
        }

        String token = jwtUtil.generateToken(email);

        return ResponseEntity.ok(
                Map.of("token", token)
        );
    }
}