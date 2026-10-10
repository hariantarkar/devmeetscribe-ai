package com.devmeetscribe.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Shape of the JSON the LLM is asked to return for a chat question. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ChatLlmResult(String answer, List<Integer> sources) {

    public ChatLlmResult {
        sources = sources == null ? List.of() : sources;
    }
}
