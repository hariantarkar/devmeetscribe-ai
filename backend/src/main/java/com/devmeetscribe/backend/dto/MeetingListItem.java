package com.devmeetscribe.backend.dto;

import java.time.Instant;

import com.devmeetscribe.backend.entity.MeetingStatus;

public record MeetingListItem(
        Long id,
        String title,
        MeetingStatus status,
        Instant createdAt) {
}
