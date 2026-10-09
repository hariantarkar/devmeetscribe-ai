package com.devmeetscribe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateTaskRequest(
        @NotBlank(message = "title is required")
        @Size(max = 500, message = "title must be at most 500 characters")
        String title,
        String assignee,
        String deadline) {
}
