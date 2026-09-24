package com.dhruva.securevault.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private static final String AES = "AES";

    private static final String GCM_TRANSFORMATION =
            "AES/GCM/NoPadding";

    private static final int GCM_TAG_LENGTH = 128;

    private static final int IV_LENGTH = 12;

    private final SecretKeySpec secretKey;

    private final SecureRandom secureRandom = new SecureRandom();

    public EncryptionUtil(
            @Value("${securevault.encryption-key:1234567890123456}")
            String encryptionKey
    ) {

        if (encryptionKey.length() != 16) {
            throw new IllegalArgumentException(
                    "Encryption key must be exactly 16 characters."
            );
        }

        this.secretKey = new SecretKeySpec(
                encryptionKey.getBytes(StandardCharsets.UTF_8),
                AES
        );
    }

    /**
     * Encrypt using AES-GCM.
     */
    public String encrypt(String password) {

        if (password == null) {
            throw new IllegalArgumentException(
                    "Password cannot be null."
            );
        }

        try {

            byte[] iv = new byte[IV_LENGTH];

            secureRandom.nextBytes(iv);

            Cipher cipher =
                    Cipher.getInstance(GCM_TRANSFORMATION);

            GCMParameterSpec gcmSpec =
                    new GCMParameterSpec(
                            GCM_TAG_LENGTH,
                            iv
                    );

            cipher.init(
                    Cipher.ENCRYPT_MODE,
                    secretKey,
                    gcmSpec
            );

            byte[] encrypted =
                    cipher.doFinal(
                            password.getBytes(StandardCharsets.UTF_8)
                    );

            /*
             * Store:
             *
             * IV + encrypted data + authentication tag
             *
             * together in Base64.
             */
            byte[] combined =
                    new byte[iv.length + encrypted.length];

            System.arraycopy(
                    iv,
                    0,
                    combined,
                    0,
                    iv.length
            );

            System.arraycopy(
                    encrypted,
                    0,
                    combined,
                    iv.length,
                    encrypted.length
            );

            return Base64.getEncoder()
                    .encodeToString(combined);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to encrypt password.",
                    e
            );
        }
    }

    /**
     * Decrypt password.
     *
     * New AES-GCM encrypted values are supported.
     * Existing legacy AES values are also supported
     * temporarily so existing vault entries continue working.
     */
    public String decrypt(String encryptedPassword) {

        if (encryptedPassword == null) {
            throw new IllegalArgumentException(
                    "Encrypted password cannot be null."
            );
        }

        try {

            byte[] decoded =
                    Base64.getDecoder()
                            .decode(encryptedPassword);

            /*
             * AES-GCM format:
             *
             * first 12 bytes = IV
             * remaining bytes = ciphertext + auth tag
             */
            if (decoded.length > IV_LENGTH + 16) {

                byte[] iv =
                        Arrays.copyOfRange(
                                decoded,
                                0,
                                IV_LENGTH
                        );

                byte[] ciphertext =
                        Arrays.copyOfRange(
                                decoded,
                                IV_LENGTH,
                                decoded.length
                        );

                Cipher cipher =
                        Cipher.getInstance(
                                GCM_TRANSFORMATION
                        );

                GCMParameterSpec gcmSpec =
                        new GCMParameterSpec(
                                GCM_TAG_LENGTH,
                                iv
                        );

                cipher.init(
                        Cipher.DECRYPT_MODE,
                        secretKey,
                        gcmSpec
                );

                byte[] decrypted =
                        cipher.doFinal(ciphertext);

                return new String(
                        decrypted,
                        StandardCharsets.UTF_8
                );
            }

            /*
             * Legacy AES support.
             *
             * This allows existing passwords encrypted
             * using the old implementation to continue
             * working.
             */
            return decryptLegacy(encryptedPassword);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to decrypt password.",
                    e
            );
        }
    }

    /**
     * Legacy AES decryption.
     *
     * Used only for old database records.
     */
    private String decryptLegacy(String encryptedPassword) {

        try {

            Cipher cipher =
                    Cipher.getInstance("AES");

            cipher.init(
                    Cipher.DECRYPT_MODE,
                    secretKey
            );

            byte[] decodedBytes =
                    Base64.getDecoder()
                            .decode(encryptedPassword);

            byte[] decrypted =
                    cipher.doFinal(decodedBytes);

            return new String(
                    decrypted,
                    StandardCharsets.UTF_8
            );

        } catch (Exception e) {

            throw new RuntimeException(
                    "Unable to decrypt legacy password.",
                    e
            );
        }
    }
}