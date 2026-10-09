package com.devmeetscribe.backend.dto;

import com.devmeetscribe.backend.entity.TaskStatus;

public record TaskResponse(
        Long id,
        Long meetingId,
        String title,
        String assignee,
        String deadline,
        TaskStatus status,
        Double confidence) {
}
