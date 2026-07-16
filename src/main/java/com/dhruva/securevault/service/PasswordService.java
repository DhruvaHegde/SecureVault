package com.dhruva.securevault.service;

import com.dhruva.securevault.dto.PasswordRequest;
import com.dhruva.securevault.entity.PasswordEntry;
import com.dhruva.securevault.entity.User;
import com.dhruva.securevault.repository.PasswordRepository;
import com.dhruva.securevault.repository.UserRepository;
import com.dhruva.securevault.security.EncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    @Autowired
    private PasswordRepository passwordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;

    public String savePassword(PasswordRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return "User not found!";
        }

        PasswordEntry entry = new PasswordEntry();

        entry.setWebsiteName(request.getWebsiteName());
        entry.setWebsiteUrl(request.getWebsiteUrl());
        entry.setUsername(request.getUsername());

        // Encrypt Password Before Saving
        entry.setEncryptedPassword(
                encryptionUtil.encrypt(request.getPassword())
        );

        entry.setCategory(request.getCategory());
        entry.setNotes(request.getNotes());

        entry.setUser(user);

        passwordRepository.save(entry);

        return "Password Saved Successfully!";
    }
}