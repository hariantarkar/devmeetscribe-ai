package com.devmeetscribe.backend.llm;

import org.springframework.stereotype.Component;

import com.devmeetscribe.backend.dto.EmailDraft;
import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/** Turns the LLM's raw reply into an {@link EmailDraft}. Accepts the body as text or as an array of lines. */
@Component
public class EmailParser {

    private static final String DEFAULT_SUBJECT = "Meeting follow-up";

    private final ObjectMapper objectMapper;

    public EmailParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public EmailDraft parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new LlmException("LLM returned an empty response");
        }
        int start = raw.indexOf('{');
        int end = raw.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new LlmException("LLM response did not contain a JSON object");
        }
        JsonNode root;
        try {
            root = objectMapper.readTree(raw.substring(start, end + 1));
        } catch (JsonProcessingException ex) {
            throw new LlmException("LLM returned invalid JSON", ex);
        }

        String subject = text(root.get("subject")).trim();
        String body = text(root.get("body")).trim();
        if (body.isEmpty()) {
            throw new LlmException("LLM returned an email without a body");
        }
        if (subject.isEmpty()) {
            subject = DEFAULT_SUBJECT;
        }
        if (subject.length() > 150) {
            subject = subject.substring(0, 150);
        }
        return new EmailDraft(subject, body);
    }

    private static String text(JsonNode node) {
        if (node == null || node.isNull()) {
            return "";
        }
        if (node.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : node) {
                if (sb.length() > 0) {
                    sb.append('\n');
                }
                sb.append(item.asText());
            }
            return sb.toString();
        }
        return node.asText();
    }
}
