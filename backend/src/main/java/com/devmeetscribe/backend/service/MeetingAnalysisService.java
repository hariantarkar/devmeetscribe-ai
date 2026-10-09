package com.devmeetscribe.backend.service;

import org.springframework.stereotype.Service;

import com.devmeetscribe.backend.dto.AnalysisResult;
import com.devmeetscribe.backend.exception.LlmException;
import com.devmeetscribe.backend.llm.AnalysisParser;
import com.devmeetscribe.backend.llm.OllamaClient;

/** Asks the LLM to turn a transcript into summary, decisions and tasks. */
@Service
public class MeetingAnalysisService {

    private static final int MAX_ATTEMPTS = 2;

    private static final String SYSTEM_PROMPT = """
            You are a meeting analysis assistant. Read the meeting transcript and respond with ONLY valid JSON
            in exactly this shape:
            {
              "summary": "3-5 sentence overview of the meeting",
              "decisions": ["a decision that was clearly made"],
              "tasks": [
                {"title": "action item", "assignee": "person name or null", "deadline": "deadline text or null", "confidence": 0.0}
              ]
            }
            Rules:
            - Only list decisions that were actually made. Do not include ideas, questions or unresolved issues.
            - Only list tasks that are explicitly mentioned as work to be done.
            - Set "assignee" to null unless a person is clearly named as responsible.
            - Set "deadline" to null unless a deadline is explicitly stated.
            - "confidence" is a number between 0 and 1 showing how sure you are the task is real.
            - Never invent information. If nothing is found, use empty arrays.
            """;

    private final OllamaClient ollamaClient;
    private final AnalysisParser parser;

    public MeetingAnalysisService(OllamaClient ollamaClient, AnalysisParser parser) {
        this.ollamaClient = ollamaClient;
        this.parser = parser;
    }

    public AnalysisResult analyze(String transcript) {
        LlmException last = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                String raw = ollamaClient.chatJson(SYSTEM_PROMPT, "Meeting transcript:\n\n" + transcript);
                return parser.parse(raw);
            } catch (LlmException ex) {
                last = ex;
            }
        }
        throw last;
    }
}
