package com.devmeetscribe.backend.llm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import com.devmeetscribe.backend.dto.EmailDraft;
import com.devmeetscribe.backend.exception.LlmException;
import com.fasterxml.jackson.databind.ObjectMapper;

class EmailParserTest {

    private final EmailParser parser = new EmailParser(new ObjectMapper());

    @Test
    void parsesSubjectAndBody() {
        EmailDraft draft = parser.parse("{\"subject\":\"Recap\",\"body\":\"Hi all,\\nThanks.\"}");
        assertEquals("Recap", draft.subject());
        assertEquals("Hi all,\nThanks.", draft.body());
    }

    @Test
    void joinsBodyGivenAsArrayOfLines() {
        EmailDraft draft = parser.parse("{\"subject\":\"Recap\",\"body\":[\"Hi all,\",\"Thanks.\"]}");
        assertEquals("Hi all,\nThanks.", draft.body());
    }

    @Test
    void usesDefaultSubjectWhenMissing() {
        EmailDraft draft = parser.parse("```json\n{\"body\":\"Hello\"}\n```");
        assertEquals("Meeting follow-up", draft.subject());
        assertEquals("Hello", draft.body());
    }

    @Test
    void rejectsEmptyBodyAndGarbage() {
        assertThrows(LlmException.class, () -> parser.parse("{\"subject\":\"x\",\"body\":\"\"}"));
        assertThrows(LlmException.class, () -> parser.parse("no json"));
        assertThrows(LlmException.class, () -> parser.parse(""));
    }
}
