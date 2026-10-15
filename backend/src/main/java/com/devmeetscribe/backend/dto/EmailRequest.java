package com.devmeetscribe.backend.dto;

/** Optional request body. tone: professional (default), friendly or brief. */
public record EmailRequest(String tone) {
}
