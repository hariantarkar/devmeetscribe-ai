package com.devmeetscribe.backend.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devmeetscribe.backend.dto.EmailDraft;
import com.devmeetscribe.backend.dto.EmailRequest;
import com.devmeetscribe.backend.service.EmailService;

@RestController
@RequestMapping("/api/meetings/{meetingId}/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    /** Generates a follow-up email draft. The body is optional: {"tone": "professional|friendly|brief"}. */
    @PostMapping
    public EmailDraft draft(@PathVariable Long meetingId,
                            @RequestBody(required = false) EmailRequest request) {
        return emailService.draft(meetingId, request == null ? null : request.tone());
    }
}
