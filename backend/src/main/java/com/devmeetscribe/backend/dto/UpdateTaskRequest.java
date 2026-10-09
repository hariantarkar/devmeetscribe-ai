package com.devmeetscribe.backend.dto;

import com.devmeetscribe.backend.entity.TaskStatus;

import jakarta.validation.constraints.Size;

/**
 * All fields are optional. Null = leave unchanged.
 * For assignee/deadline, an empty string clears the value.
 */
public record UpdateTaskRequest(
        @Size(max = 500, message = "title must be at most 500 characters")
        String title,
        String assignee,
        String deadline,
        TaskStatus status) {
}
