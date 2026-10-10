package com.devmeetscribe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devmeetscribe.backend.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByMeetingIdOrderByIdAsc(Long meetingId);

    /** Newest first; callers reverse it. */
    List<ChatMessage> findTop6ByMeetingIdOrderByIdDesc(Long meetingId);

    void deleteByMeetingId(Long meetingId);
}
