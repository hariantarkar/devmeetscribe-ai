package com.devmeetscribe.backend.service;

import java.io.IOException;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.devmeetscribe.backend.exception.BadRequestException;
import com.devmeetscribe.backend.llm.WhisperClient;

/** Turns an uploaded 16 kHz WAV into transcript text (the web app converts recordings to WAV first). */
@Service
public class TranscriptionService {

    /** Whole-line sound tags such as "[Music]" or "(laughs)". */
    private static final Pattern SOUND_TAG = Pattern.compile("^[\\[(][^\\])]{1,40}[\\])]$");

    private final WhisperClient whisperClient;

    public TranscriptionService(WhisperClient whisperClient) {
        this.whisperClient = whisperClient;
    }

    public String transcribe(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Choose an audio file first.");
        }
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("Could not read the uploaded file.");
        }
        if (!isWav(bytes)) {
            throw new BadRequestException("Upload a WAV file. The web app converts audio to WAV for you.");
        }

        String text = clean(whisperClient.transcribe(bytes));
        if (text.isBlank()) {
            throw new BadRequestException("No speech was detected in the audio.");
        }
        return text;
    }

    static boolean isWav(byte[] b) {
        return b.length > 12
                && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'A' && b[10] == 'V' && b[11] == 'E';
    }

    /** One line per Whisper segment: trimmed, single-spaced, without blank lines or sound tags. */
    static String clean(String raw) {
        if (raw == null) {
            return "";
        }
        StringBuilder sb = new StringBuilder();
        for (String line : raw.replace("[BLANK_AUDIO]", " ").split("\\R")) {
            String t = line.trim().replaceAll("\\s+", " ");
            if (t.isEmpty() || SOUND_TAG.matcher(t).matches()) {
                continue;
            }
            if (sb.length() > 0) {
                sb.append('\n');
            }
            sb.append(t);
        }
        return sb.toString();
    }
}
