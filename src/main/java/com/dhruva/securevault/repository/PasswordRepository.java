package com.dhruva.securevault.repository;

import com.dhruva.securevault.entity.PasswordEntry;
import com.dhruva.securevault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordRepository extends JpaRepository<PasswordEntry, Long> {

    List<PasswordEntry> findByUser(User user);

}