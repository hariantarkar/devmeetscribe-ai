package com.devmeetscribe.backend.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devmeetscribe.backend.llm.OllamaClient;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final OllamaClient ollamaClient;

    public HealthController(JdbcTemplate jdbcTemplate, OllamaClient ollamaClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.ollamaClient = ollamaClient;
    }

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
        result.put("model", ollamaClient.getModel());
        result.put("timestamp", Instant.now().toString());
        return result;
    }
}
