package com.devmeetscribe.backend.llm;

import org.springframework.stereotype.Component;

import com.devmeetscribe.backend.dto.ChatLlmResult;
import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Turns the LLM's raw reply into a {@link ChatLlmResult}. */
@Component
public class ChatParser {

    private final ObjectMapper objectMapper;

    public ChatParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public ChatLlmResult parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new LlmException("LLM returned an empty response");
        }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new LlmException("LLM response did not contain a JSON object");
        }
        ChatLlmResult result;
        try {
            result = objectMapper.readValue(raw.substring(start, end + 1), ChatLlmResult.class);
        } catch (JsonProcessingException ex) {
            throw new LlmException("LLM returned JSON in an unexpected shape", ex);
        }
        if (result.answer() == null || result.answer().isBlank()) {
            throw new LlmException("LLM returned no answer");
        }
        return result;
    }
}
