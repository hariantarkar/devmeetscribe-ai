package com.devmeetscribe.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class TranscriptionServiceTest {

    @Test
    void cleanRemovesBlankLinesSoundTagsAndExtraSpaces() {
        String raw = " Hello   there.\n\n [Music]\n (laughs) \n We need the API by Friday. [BLANK_AUDIO]\n";
        assertEquals("Hello there.\nWe need the API by Friday.", TranscriptionService.clean(raw));
    }

    @Test
    void cleanHandlesEmptyInput() {
        assertTrue(TranscriptionService.clean(null).isEmpty());
        assertTrue(TranscriptionService.clean("[BLANK_AUDIO]").isEmpty());
        assertTrue(TranscriptionService.clean("  \n ").isEmpty());
    }

    @Test
    void cleanKeepsParenthesesInsideSentences() {
        assertEquals("He said (quietly) that it works.", TranscriptionService.clean("He said (quietly) that it works."));
    }

    @Test
    void detectsWavHeader() {
        byte[] wav = "RIFF\u0000\u0000\u0000\u0000WAVEfmt ".getBytes(StandardCharsets.ISO_8859_1);
        assertTrue(TranscriptionService.isWav(wav));
        assertFalse(TranscriptionService.isWav("ID3 not a wav file at all".getBytes(StandardCharsets.ISO_8859_1)));
        assertFalse(TranscriptionService.isWav(new byte[5]));
    }
}
