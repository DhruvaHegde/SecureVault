package com.dhruva.securevault.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OAuthCodeService {

    private static final long CODE_EXPIRATION_SECONDS = 60;

    private final SecureRandom secureRandom = new SecureRandom();

    private final Map<String, OAuthCodeEntry> codes =
            new ConcurrentHashMap<>();

    /**
     * Creates a short-lived one-time authorization code.
     */
    public String createCode(String email) {

        byte[] randomBytes = new byte[32];

        secureRandom.nextBytes(randomBytes);

        String code = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        Instant expiresAt = Instant.now()
                .plusSeconds(CODE_EXPIRATION_SECONDS);

        codes.put(
                code,
                new OAuthCodeEntry(email, expiresAt)
        );

        return code;
    }

    /**
     * Validates and consumes the OAuth code.
     *
     * The code can only be used once.
     */
    public String consumeCode(String code) {

        if (code == null || code.isBlank()) {
            return null;
        }

        /*
         * remove() makes the code one-time-use.
         */
        OAuthCodeEntry entry = codes.remove(code);

        if (entry == null) {
            return null;
        }

        /*
         * Check whether the code has expired.
         */
        if (Instant.now().isAfter(entry.expiresAt())) {
            return null;
        }

        return entry.email();
    }

    /**
     * Stores the email associated with the code
     * and the expiration time.
     */
    private record OAuthCodeEntry(
            String email,
            Instant expiresAt
    ) {
    }
}