package com.devmeetscribe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "question is required")
        @Size(max = 1000, message = "question must be at most 1000 characters")
        String question) {
}
