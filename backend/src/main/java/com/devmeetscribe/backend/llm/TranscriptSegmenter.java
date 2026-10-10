package com.devmeetscribe.backend.llm;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Splits a transcript into short numbered lines so answers can cite them.
 * Order of splitting: line breaks, then speaker turns ("Priya: ..."), then sentences.
 */
public final class TranscriptSegmenter {

    private static final int TARGET_LENGTH = 280;
    private static final int MAX_LENGTH = 400;

    private static final Pattern SPEAKER_TURN =
            Pattern.compile("(?<=[.!?])\\s+(?=[A-Z][A-Za-z.'-]*(?: [A-Z][A-Za-z.'-]*){0,2}:\\s)");
    private static final Pattern SENTENCE = Pattern.compile("(?<=[.!?])\\s+");

    private TranscriptSegmenter() {
    }

    public static List<String> segment(String transcript) {
        List<String> segments = new ArrayList<>();
        if (transcript == null) {
            return segments;
        }
        for (String line : transcript.split("\\R")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) {
                continue;
            }
            for (String turn : SPEAKER_TURN.split(trimmed)) {
                addTurn(turn.trim(), segments);
            }
        }
        return segments;
    }

    private static void addTurn(String turn, List<String> out) {
        if (turn.isEmpty()) {
            return;
        }
        if (turn.length() <= TARGET_LENGTH) {
            out.add(turn);
            return;
        }
        StringBuilder current = new StringBuilder();
        for (String sentence : SENTENCE.split(turn)) {
            if (current.length() > 0 && current.length() + sentence.length() + 1 > TARGET_LENGTH) {
                emit(current.toString(), out);
                current.setLength(0);
            }
            if (current.length() > 0) {
                current.append(' ');
            }
            current.append(sentence);
        }
        if (current.length() > 0) {
            emit(current.toString(), out);
        }
    }

    /** Adds the text, hard-splitting at spaces when it is longer than MAX_LENGTH. */
    private static void emit(String text, List<String> out) {
        String rest = text.trim();
        while (rest.length() > MAX_LENGTH) {
            int cut = rest.lastIndexOf(' ', MAX_LENGTH);
            if (cut < MAX_LENGTH / 2) {
                cut = MAX_LENGTH;
            }
            out.add(rest.substring(0, cut).trim());
            rest = rest.substring(cut).trim();
        }
        if (!rest.isEmpty()) {
            out.add(rest);
        }
    }
}
