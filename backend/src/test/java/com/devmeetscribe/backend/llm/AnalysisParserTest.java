package com.devmeetscribe.backend.llm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.devmeetscribe.backend.dto.AnalysisResult;
import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.databind.ObjectMapper;

class AnalysisParserTest {

    private final AnalysisParser parser = new AnalysisParser(new ObjectMapper());

    @Test
    void parsesPlainJson() {
        String raw = """
                {"summary":"Team planned the release.",
                 "decisions":["Use Spring Boot"],
                 "tasks":[{"title":"Finish login API","assignee":null,"deadline":"Friday","confidence":0.9}]}
                """;
        AnalysisResult result = parser.parse(raw);

        assertEquals("Team planned the release.", result.summary());
        assertEquals(1, result.decisions().size());
        assertEquals("Finish login API", result.tasks().get(0).title());
        assertNull(result.tasks().get(0).assignee());
        assertEquals("Friday", result.tasks().get(0).deadline());
    }

    @Test
    void parsesJsonInsideCodeFence() {
        String raw = "Here you go:\n```json\n{\"summary\":\"ok\",\"decisions\":[],\"tasks\":[]}\n```";
        assertEquals("ok", parser.parse(raw).summary());
    }

    @Test
    void missingListsBecomeEmpty() {
        AnalysisResult result = parser.parse("{\"summary\":\"only summary\"}");
        assertTrue(result.decisions().isEmpty());
        assertTrue(result.tasks().isEmpty());
    }

    @Test
    void throwsOnGarbage() {
        assertThrows(LlmException.class, () -> parser.parse("no json here"));
        assertThrows(LlmException.class, () -> parser.parse(""));
    }
}
