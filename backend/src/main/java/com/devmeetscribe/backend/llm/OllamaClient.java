package com.devmeetscribe.backend.llm;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.databind.JsonNode;

/** Thin wrapper over Ollama's REST API (http://localhost:11434). */
@Component
public class OllamaClient {

    private final RestClient restClient;
    private final String model;
    private final int numCtx;

    public OllamaClient(RestClient ollamaRestClient,
                        @Value("${ollama.model}") String model,
                        @Value("${ollama.num-ctx}") int numCtx) {
        this.restClient = ollamaRestClient;
        this.model = model;
        this.numCtx = numCtx;
    }

    public String getModel() {
        return model;
    }

    /** Sends a system + user message and returns the raw text of the reply (JSON mode). */
    public String chatJson(String systemPrompt, String userPrompt) {
        return chatJson(List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)));
    }

    /** Sends a full message list (roles: system, user, assistant) and returns the raw reply (JSON mode). */
    public String chatJson(List<Map<String, String>> messages) {
        Map<String, Object> body = Map.of(
                "model", model,
                "stream", false,
                "format", "json",
                "options", Map.of("temperature", 0.2, "num_ctx", numCtx),
                "messages", messages);
        try {
            JsonNode response = restClient.post()
                    .uri("/api/chat")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
            if (response == null) {
                throw new LlmException("Empty response from Ollama");
            }
            return response.path("message").path("content").asText("");
        } catch (RestClientException ex) {
            throw new LlmException("Could not get a response from Ollama (is it running and is model '"
                    + model + "' pulled?)", ex);
        }
    }

    /** UP, MODEL_NOT_PULLED or DOWN. */
    public String status() {
        try {
            JsonNode tags = restClient.get().uri("/api/tags").retrieve().body(JsonNode.class);
            if (tags != null) {
                for (JsonNode m : tags.path("models")) {
                    if (m.path("name").asText("").startsWith(model)) {
                        return "UP";
                    }
                }
            }
            return "MODEL_NOT_PULLED";
        } catch (RestClientException ex) {
            return "DOWN";
        }
    }
}
