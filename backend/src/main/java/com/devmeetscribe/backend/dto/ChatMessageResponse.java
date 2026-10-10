package com.devmeetscribe.backend.dto;

import java.time.Instant;
import java.util.List;

import com.devmeetscribe.backend.entity.ChatRole;

public record ChatMessageResponse(
        Long id,
        ChatRole role,
        String content,
        List<ChatSource> sources,
        Instant createdAt) {
}
