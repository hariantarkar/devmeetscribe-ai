package com.devmeetscribe.backend.dto;

/** A transcript line (1-based) that supports an answer. The text always comes from the stored transcript. */
public record ChatSource(int line, String text) {
}
