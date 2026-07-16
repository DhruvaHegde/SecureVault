package com.dhruva.securevault.security;

import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class EncryptionUtil {

    private static final String SECRET_KEY = "1234567890123456";

    private final SecretKeySpec secretKey =
            new SecretKeySpec(SECRET_KEY.getBytes(), "AES");

    // Encrypt Password
    public String encrypt(String password) {

        try {

            Cipher cipher = Cipher.getInstance("AES");

            cipher.init(Cipher.ENCRYPT_MODE, secretKey);

            byte[] encryptedBytes =
                    cipher.doFinal(password.getBytes());

            return Base64.getEncoder()
                    .encodeToString(encryptedBytes);

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // Decrypt Password
    public String decrypt(String encryptedPassword) {

        try {

            Cipher cipher = Cipher.getInstance("AES");

            cipher.init(Cipher.DECRYPT_MODE, secretKey);

            byte[] decodedBytes =
                    Base64.getDecoder()
                            .decode(encryptedPassword);

            return new String(cipher.doFinal(decodedBytes));

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}