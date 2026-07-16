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