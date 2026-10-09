package com.devmeetscribe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMeetingRequest(
        @NotBlank(message = "title is required")
        @Size(max = 255, message = "title must be at most 255 characters")
        String title,

        @NotBlank(message = "transcript is required")
        String transcript) {
}
