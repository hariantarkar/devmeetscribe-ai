package com.devmeetscribe.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Shape of the JSON the LLM is asked to return. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AnalysisResult(
        String summary,
        List<String> decisions,
        List<TaskItem> tasks) {

    public AnalysisResult {
        decisions = decisions == null ? List.of() : decisions;
        tasks = tasks == null ? List.of() : tasks;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TaskItem(
            String title,
            String assignee,
            String deadline,
            Double confidence) {
    }
}
