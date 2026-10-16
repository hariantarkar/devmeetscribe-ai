package com.devmeetscribe.backend.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.devmeetscribe.backend.entity.User;

import io.jsonwebtoken.JwtException;

class JwtServiceTest {

    private static final String SECRET = "a-test-secret-that-is-at-least-32-bytes-long!!";

    private static User user() {
        User user = new User();
        user.setId(7L);
        user.setName("Hari");
        return user;
    }

    @Test
    void tokenRoundTripReturnsTheUserId() {
        JwtService service = new JwtService(SECRET, 60);
        assertEquals(7L, service.parseUserId(service.generate(user())));
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService service = new JwtService(SECRET, 60);
        String token = service.generate(user());
        assertThrows(JwtException.class, () -> service.parseUserId(token + "x"));
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        String token = new JwtService(SECRET, 60).generate(user());
        JwtService other = new JwtService("another-secret-that-is-also-32-bytes-long!!", 60);
        assertThrows(JwtException.class, () -> other.parseUserId(token));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService service = new JwtService(SECRET, -1);
        String token = service.generate(user());
        assertThrows(JwtException.class, () -> service.parseUserId(token));
    }

    @Test
    void shortSecretIsRefused() {
        assertThrows(IllegalStateException.class, () -> new JwtService("too-short", 60));
    }
}
