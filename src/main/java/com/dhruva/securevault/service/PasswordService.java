package com.dhruva.securevault.service;

import com.dhruva.securevault.dto.PasswordRequest;
import com.dhruva.securevault.dto.PasswordResponse;
import com.dhruva.securevault.entity.PasswordEntry;
import com.dhruva.securevault.entity.User;
import com.dhruva.securevault.repository.PasswordRepository;
import com.dhruva.securevault.repository.UserRepository;
import com.dhruva.securevault.security.EncryptionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PasswordService {

    @Autowired
    private PasswordRepository passwordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EncryptionUtil encryptionUtil;

    // ===========================
    // Save Password
    // ===========================
    public String savePassword(PasswordRequest request, String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return "User not found!";
        }

        PasswordEntry entry = new PasswordEntry();

        entry.setWebsiteName(request.getWebsiteName());
        entry.setWebsiteUrl(request.getWebsiteUrl());
        entry.setUsername(request.getUsername());
        entry.setEncryptedPassword(encryptionUtil.encrypt(request.getPassword()));
        entry.setCategory(request.getCategory());
        entry.setNotes(request.getNotes());
        entry.setUser(user);

        passwordRepository.save(entry);

        return "Password Saved Successfully!";
    }

    // ===========================
    // Get All Passwords
    // ===========================
    public List<PasswordResponse> getAllPasswords(String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new ArrayList<>();
        }

        List<PasswordEntry> entries = passwordRepository.findByUser(user);
        List<PasswordResponse> response = new ArrayList<>();

        for (PasswordEntry entry : entries) {

            PasswordResponse passwordResponse = new PasswordResponse();

            passwordResponse.setWebsiteName(entry.getWebsiteName());
            passwordResponse.setWebsiteUrl(entry.getWebsiteUrl());
            passwordResponse.setUsername(entry.getUsername());
            passwordResponse.setPassword(
                    encryptionUtil.decrypt(entry.getEncryptedPassword())
            );
            passwordResponse.setCategory(entry.getCategory());
            passwordResponse.setNotes(entry.getNotes());

            response.add(passwordResponse);
        }

        return response;
    }

    // ===========================
    // Update Password
    // ===========================
    public String updatePassword(Long id,
                                 PasswordRequest request,
                                 String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return "User not found!";
        }

        PasswordEntry entry = passwordRepository.findById(id).orElse(null);

        if (entry == null) {
            return "Password entry not found!";
        }

        if (!entry.getUser().getId().equals(user.getId())) {
            return "Unauthorized!";
        }

        entry.setWebsiteName(request.getWebsiteName());
        entry.setWebsiteUrl(request.getWebsiteUrl());
        entry.setUsername(request.getUsername());
        entry.setEncryptedPassword(
                encryptionUtil.encrypt(request.getPassword())
        );
        entry.setCategory(request.getCategory());
        entry.setNotes(request.getNotes());

        passwordRepository.save(entry);

        return "Password Updated Successfully!";
    }

    // ===========================
    // Delete Password
    // ===========================
    public String deletePassword(Long id, String email) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return "User not found!";
        }

        PasswordEntry entry = passwordRepository.findById(id).orElse(null);

        if (entry == null) {
            return "Password entry not found!";
        }

        if (!entry.getUser().getId().equals(user.getId())) {
            return "Unauthorized!";
        }

        passwordRepository.delete(entry);

        return "Password Deleted Successfully!";
    }
}