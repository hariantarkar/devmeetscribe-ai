package com.devmeetscribe.backend.llm;

import org.springframework.stereotype.Component;

import com.devmeetscribe.backend.dto.AnalysisResult;
import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Turns the LLM's raw text into an {@link AnalysisResult}, tolerating code fences and extra prose. */
@Component
public class AnalysisParser {

    private final ObjectMapper objectMapper;

    public AnalysisParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AnalysisResult parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new LlmException("LLM returned an empty response");
        }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new LlmException("LLM response did not contain a JSON object");
        }
        try {
            return objectMapper.readValue(raw.substring(start, end + 1), AnalysisResult.class);
        } catch (JsonProcessingException ex) {
            throw new LlmException("LLM returned JSON in an unexpected shape", ex);
        }
    }
}
