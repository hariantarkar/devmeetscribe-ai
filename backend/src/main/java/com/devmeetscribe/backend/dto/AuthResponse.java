package com.devmeetscribe.backend.dto;

public record AuthResponse(String token, UserResponse user) {
}
