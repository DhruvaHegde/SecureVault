package com.dhruva.securevault.controller;

import com.dhruva.securevault.dto.PasswordRequest;
import com.dhruva.securevault.dto.PasswordResponse;
import com.dhruva.securevault.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passwords")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    // Save Password
    @PostMapping("/add")
    public String addPassword(
            @RequestBody PasswordRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        return passwordService.savePassword(request, email);
    }

    // View All Passwords
    @GetMapping
    public List<PasswordResponse> getAllPasswords(
            Authentication authentication) {

        String email = authentication.getName();
        return passwordService.getAllPasswords(email);
    }

    // Search Passwords
    @GetMapping("/search")
    public List<PasswordResponse> searchPasswords(
            @RequestParam String keyword,
            Authentication authentication) {

        String email = authentication.getName();
        return passwordService.searchPasswords(email, keyword);
    }

    // Generate Password
    @GetMapping("/generate")
    public String generatePassword(
            @RequestParam(defaultValue = "16") int length) {

        return passwordService.generatePassword(length);
    }

    // Check Password Strength
    @PostMapping("/check-strength")
    public String checkPasswordStrength(
            @RequestBody PasswordRequest request) {

        return passwordService.checkPasswordStrength(request.getPassword());
    }

    // Update Password
    @PutMapping("/{id}")
    public String updatePassword(
            @PathVariable Long id,
            @RequestBody PasswordRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        return passwordService.updatePassword(id, request, email);
    }

    // Delete Password
    @DeleteMapping("/{id}")
    public String deletePassword(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        return passwordService.deletePassword(id, email);
    }
}