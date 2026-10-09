package com.devmeetscribe.backend.dto;

import java.time.Instant;
import java.util.List;

import com.devmeetscribe.backend.entity.MeetingStatus;

public record MeetingDetail(
        Long id,
        String title,
        String transcript,
        String summary,
        MeetingStatus status,
        Instant createdAt,
        List<DecisionResponse> decisions,
        List<TaskResponse> tasks) {
}
