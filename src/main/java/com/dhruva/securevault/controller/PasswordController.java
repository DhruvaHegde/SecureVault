package com.dhruva.securevault.controller;

import com.dhruva.securevault.dto.PasswordRequest;
import com.dhruva.securevault.service.PasswordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/passwords")
public class PasswordController {

    @Autowired
    private PasswordService passwordService;

    @PostMapping("/add")
    public String addPassword(
            @RequestBody PasswordRequest request,
            @RequestParam String email) {

        return passwordService.savePassword(request, email);
    }
}