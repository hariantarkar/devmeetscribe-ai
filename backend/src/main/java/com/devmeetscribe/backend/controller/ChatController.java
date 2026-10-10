package com.devmeetscribe.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.devmeetscribe.backend.dto.ChatExchange;
import com.devmeetscribe.backend.dto.ChatMessageResponse;
import com.devmeetscribe.backend.dto.ChatRequest;
import com.devmeetscribe.backend.service.ChatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/meetings/{meetingId}/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<ChatMessageResponse> history(@PathVariable Long meetingId) {
        return chatService.history(meetingId);
    }

    @PostMapping
    public ChatExchange ask(@PathVariable Long meetingId, @Valid @RequestBody ChatRequest request) {
        return chatService.ask(meetingId, request.question());
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clear(@PathVariable Long meetingId) {
        chatService.clear(meetingId);
    }
}
