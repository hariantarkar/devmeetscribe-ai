package com.devmeetscribe.backend.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devmeetscribe.backend.llm.OllamaClient;
import com.devmeetscribe.backend.llm.WhisperClient;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final OllamaClient ollamaClient;
    private final WhisperClient whisperClient;

    public HealthController(JdbcTemplate jdbcTemplate, OllamaClient ollamaClient, WhisperClient whisperClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.ollamaClient = ollamaClient;
        this.whisperClient = whisperClient;
    }

    /** status reflects the database and Ollama. Whisper is optional (audio upload only), so it is reported separately. */
    @GetMapping
    public Map<String, Object> health() {
        String database;
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            database = "UP";
        } catch (Exception ex) {
            database = "DOWN";
        }
        String ollama = ollamaClient.status();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("status", "UP".equals(database) && "UP".equals(ollama) ? "UP" : "DEGRADED");
        result.put("database", database);
        result.put("ollama", ollama);
        result.put("whisper", whisperClient.status());
        result.put("model", ollamaClient.getModel());
        result.put("timestamp", Instant.now().toString());
        return result;
    }
}
