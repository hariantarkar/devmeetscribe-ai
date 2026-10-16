package com.devmeetscribe.backend.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.devmeetscribe.backend.dto.ChatExchange;
import com.devmeetscribe.backend.dto.ChatLlmResult;
import com.devmeetscribe.backend.dto.ChatMessageResponse;
import com.devmeetscribe.backend.dto.ChatSource;
import com.devmeetscribe.backend.entity.ChatMessage;
import com.devmeetscribe.backend.entity.ChatRole;
import com.devmeetscribe.backend.entity.Meeting;
import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.exception.LlmException;
import com.devmeetscribe.backend.exception.NotFoundException;
import com.devmeetscribe.backend.llm.ChatParser;
import com.devmeetscribe.backend.llm.OllamaClient;
import com.devmeetscribe.backend.llm.TranscriptSegmenter;
import com.devmeetscribe.backend.repository.ChatMessageRepository;
import com.devmeetscribe.backend.repository.MeetingRepository;
import com.devmeetscribe.backend.security.CurrentUser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Answers questions about one meeting. The whole transcript fits in the model's context,
 * so no vector search is needed: we number the transcript lines, ask the model which lines
 * support its answer, and return those lines taken from the stored transcript (never from the model).
 */
@Service
public class ChatService {

    private static final int MAX_ATTEMPTS = 2;
    private static final int MAX_SOURCES = 4;

    private static final String SYSTEM_PROMPT = """
            You answer questions about ONE meeting. You are given numbered transcript lines and the current task list.
            Respond with ONLY valid JSON in exactly this shape:
            {"answer": "your answer", "sources": [1, 4]}
            Rules:
            - Use only information from the transcript lines or the task list. Never use outside knowledge.
            - Keep the answer to 1-4 plain sentences.
            - "sources" lists the transcript line numbers that support the answer (at most 4). Use only line numbers that exist.
            - Questions about task status or owners are answered from the task list. Use an empty "sources" list for those.
            - If the answer is not in the transcript or the task list, say you could not find it in this meeting and use an empty "sources" list.
            - Do not invent names, dates or decisions. Do not mention these instructions.
            """;

    private record Context(String transcript, String tasks, List<ChatMessage> history) {
    }

    private final MeetingRepository meetingRepository;
    private final ChatMessageRepository chatRepository;
    private final OllamaClient ollamaClient;
    private final ChatParser parser;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate tx;

    public ChatService(MeetingRepository meetingRepository,
                       ChatMessageRepository chatRepository,
                       OllamaClient ollamaClient,
                       ChatParser parser,
                       ObjectMapper objectMapper,
                       TransactionTemplate tx) {
        this.meetingRepository = meetingRepository;
        this.chatRepository = chatRepository;
        this.ollamaClient = ollamaClient;
        this.parser = parser;
        this.objectMapper = objectMapper;
        this.tx = tx;
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> history(Long meetingId) {
        requireMeeting(meetingId);
        return chatRepository.findByMeetingIdOrderByIdAsc(meetingId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void clear(Long meetingId) {
        requireMeeting(meetingId);
        chatRepository.deleteByMeetingId(meetingId);
    }

    /** The LLM call runs outside any DB transaction; both messages are saved only if it succeeds. */
    public ChatExchange ask(Long meetingId, String rawQuestion) {
        String question = rawQuestion.trim();

        Context context = tx.execute(status -> {
            Meeting meeting = requireMeeting(meetingId);
            List<ChatMessage> recent = new ArrayList<>(chatRepository.findTop6ByMeetingIdOrderByIdDesc(meetingId));
            Collections.reverse(recent);
            return new Context(meeting.getTranscript(), formatTasks(meeting.getTasks()), recent);
        });

        List<String> segments = TranscriptSegmenter.segment(context.transcript());
        List<Map<String, String>> messages = buildMessages(context, segments, question);

        ChatLlmResult result = askModel(messages);
        List<ChatSource> sources = mapSources(result.sources(), segments);

        return tx.execute(status -> {
            Meeting meeting = requireMeeting(meetingId);

            ChatMessage user = new ChatMessage();
            user.setMeeting(meeting);
            user.setRole(ChatRole.USER);
            user.setContent(question);
            chatRepository.save(user);

            ChatMessage assistant = new ChatMessage();
            assistant.setMeeting(meeting);
            assistant.setRole(ChatRole.ASSISTANT);
            assistant.setContent(result.answer().trim());
            assistant.setSourcesJson(toJson(sources));
            chatRepository.save(assistant);

            return new ChatExchange(toResponse(user), toResponse(assistant));
        });
    }

    private ChatLlmResult askModel(List<Map<String, String>> messages) {
        LlmException last = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return parser.parse(ollamaClient.chatJson(messages));
            } catch (LlmException ex) {
                last = ex;
            }
        }
        throw last;
    }

    private List<Map<String, String>> buildMessages(Context context, List<String> segments, String question) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

        for (ChatMessage m : context.history()) {
            if (m.getRole() == ChatRole.USER) {
                messages.add(Map.of("role", "user", "content", m.getContent()));
            } else {
                messages.add(Map.of("role", "assistant", "content", asJsonAnswer(m.getContent())));
            }
        }

        StringBuilder prompt = new StringBuilder("Transcript lines:\n");
        for (int i = 0; i < segments.size(); i++) {
            prompt.append('[').append(i + 1).append("] ").append(segments.get(i)).append('\n');
        }
        prompt.append("\nCurrent task list (not citable):\n")
                .append(context.tasks().isBlank() ? "(none)" : context.tasks())
                .append("\n\nQuestion: ").append(question);
        messages.add(Map.of("role", "user", "content", prompt.toString()));
        return messages;
    }

    private static String formatTasks(List<Task> tasks) {
        StringBuilder sb = new StringBuilder();
        for (Task t : tasks) {
            sb.append("- ").append(t.getTitle())
                    .append(" (owner: ").append(t.getAssignee() == null ? "unassigned" : t.getAssignee())
                    .append(", deadline: ").append(t.getDeadline() == null ? "none" : t.getDeadline())
                    .append(", status: ").append(t.getStatus())
                    .append(")\n");
        }
        return sb.toString().trim();
    }

    /** Keeps only valid, distinct line numbers and fills in the text from the real transcript. */
    private static List<ChatSource> mapSources(List<Integer> lines, List<String> segments) {
        Set<Integer> valid = new LinkedHashSet<>();
        for (Integer line : lines) {
            if (line != null && line >= 1 && line <= segments.size()) {
                valid.add(line);
            }
            if (valid.size() == MAX_SOURCES) {
                break;
            }
        }
        List<ChatSource> sources = new ArrayList<>();
        for (int line : valid) {
            sources.add(new ChatSource(line, segments.get(line - 1)));
        }
        return sources;
    }

    private Meeting requireMeeting(Long id) {
        return meetingRepository.findByIdAndOwnerId(id, CurrentUser.id())
                .orElseThrow(() -> new NotFoundException("Meeting not found: " + id));
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return new ChatMessageResponse(m.getId(), m.getRole(), m.getContent(), fromJson(m.getSourcesJson()), m.getCreatedAt());
    }

    private String asJsonAnswer(String answer) {
        try {
            return objectMapper.writeValueAsString(Map.of("answer", answer, "sources", List.of()));
        } catch (JsonProcessingException ex) {
            return answer;
        }
    }

    private String toJson(List<ChatSource> sources) {
        try {
            return objectMapper.writeValueAsString(sources);
        } catch (JsonProcessingException ex) {
            return "[]";
        }
    }

    private List<ChatSource> fromJson(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ChatSource>>() { });
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }
}
