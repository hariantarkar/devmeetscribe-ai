package com.devmeetscribe.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devmeetscribe.backend.dto.TranscriptionResult;
import com.devmeetscribe.backend.service.TranscriptionService;

@RestController
@RequestMapping("/api/transcribe")
public class TranscriptionController {

    private final TranscriptionService transcriptionService;

    public TranscriptionController(TranscriptionService transcriptionService) {
        this.transcriptionService = transcriptionService;
    }

    /** Multipart upload with a "file" part (16 kHz WAV). Returns {"text": "..."}; it does not save anything. */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TranscriptionResult transcribe(@RequestParam("file") MultipartFile file) {
        return new TranscriptionResult(transcriptionService.transcribe(file));
    }
}
