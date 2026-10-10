package com.devmeetscribe.backend.llm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

class TranscriptSegmenterTest {

    @Test
    void splitsSingleLineBySpeakerTurn() {
        List<String> parts = TranscriptSegmenter.segment("Rahul: Hello team. Priya: Hi Rahul. Amit: Ready.");
        assertEquals(List.of("Rahul: Hello team.", "Priya: Hi Rahul.", "Amit: Ready."), parts);
    }

    @Test
    void splitsOnLineBreaksAndSkipsBlankLines() {
        List<String> parts = TranscriptSegmenter.segment("A: one\n\nB: two\r\n  \nC: three\n");
        assertEquals(List.of("A: one", "B: two", "C: three"), parts);
    }

    @Test
    void groupsLongTextIntoShortSegments() {
        String sentence = "This is a fairly long sentence about the project plan and timeline.";
        String text = (sentence + " ").repeat(20).trim();
        List<String> parts = TranscriptSegmenter.segment(text);

        assertTrue(parts.size() > 1);
        assertTrue(parts.stream().allMatch(p -> p.length() <= 400));
    }

    @Test
    void hardSplitsTextWithoutPunctuation() {
        String text = "word ".repeat(300).trim();
        List<String> parts = TranscriptSegmenter.segment(text);

        assertTrue(parts.size() >= 4);
        assertTrue(parts.stream().allMatch(p -> p.length() <= 400));
    }

    @Test
    void nullAndEmptyGiveNoSegments() {
        assertTrue(TranscriptSegmenter.segment(null).isEmpty());
        assertTrue(TranscriptSegmenter.segment("   ").isEmpty());
    }
}
