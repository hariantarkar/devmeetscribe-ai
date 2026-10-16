package com.devmeetscribe.backend.service;

import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devmeetscribe.backend.dto.AuthResponse;
import com.devmeetscribe.backend.dto.LoginRequest;
import com.devmeetscribe.backend.dto.RegisterRequest;
import com.devmeetscribe.backend.dto.UserResponse;
import com.devmeetscribe.backend.entity.User;
import com.devmeetscribe.backend.exception.BadRequestException;
import com.devmeetscribe.backend.exception.UnauthorizedException;
import com.devmeetscribe.backend.repository.UserRepository;
import com.devmeetscribe.backend.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists. Sign in instead.");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return respond(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(normalize(request.email()))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new UnauthorizedException("Incorrect email or password."));
        return respond(user);
    }

    @Transactional(readOnly = true)
    public UserResponse me(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Please sign in again."));
        return toResponse(user);
    }

    private AuthResponse respond(User user) {
        return new AuthResponse(jwtService.generate(user), toResponse(user));
    }

    private static UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
