package com.devmeetscribe.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import com.devmeetscribe.backend.dto.EmailDraft;
import com.devmeetscribe.backend.entity.Decision;
import com.devmeetscribe.backend.entity.Meeting;
import com.devmeetscribe.backend.entity.MeetingStatus;
import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.entity.TaskStatus;
import com.devmeetscribe.backend.exception.BadRequestException;
import com.devmeetscribe.backend.exception.LlmException;
import com.devmeetscribe.backend.exception.NotFoundException;
import com.devmeetscribe.backend.llm.EmailParser;
import com.devmeetscribe.backend.llm.OllamaClient;
import com.devmeetscribe.backend.repository.MeetingRepository;
import com.devmeetscribe.backend.security.CurrentUser;

/** Writes a follow-up email draft from an analyzed meeting. Nothing is stored or sent. */
@Service
public class EmailService {

    private static final int MAX_ATTEMPTS = 2;

    private static final Map<String, String> TONES = Map.of(
            "professional", "professional and polite",
            "friendly", "warm and friendly, but still clear",
            "brief", "very short and direct, under 120 words");

    private static final String SYSTEM_PROMPT = """
            You write follow-up emails after meetings. Respond with ONLY valid JSON in exactly this shape:
            {"subject": "email subject", "body": "email body as plain text"}
            Rules:
            - Tone: %s.
            - Use only the summary, decisions and open action items you are given. Never invent names, dates, owners or decisions.
            - Start with "Hi all," and end with a short closing followed by "[Your name]".
            - Include a short recap, then the decisions, then the open action items, each as lines starting with "- ".
            - For an action item with no owner write "owner to be confirmed". For one with no deadline, leave the deadline out.
            - If there are no decisions or no open action items, leave that section out.
            - Plain text only. No markdown, no bold, no headings.
            """;

    private record Context(String title, String summary, List<String> decisions, List<String> openTasks) {
    }

    private final MeetingRepository meetingRepository;
    private final OllamaClient ollamaClient;
    private final EmailParser parser;
    private final TransactionTemplate tx;

    public EmailService(MeetingRepository meetingRepository,
                        OllamaClient ollamaClient,
                        EmailParser parser,
                        TransactionTemplate tx) {
        this.meetingRepository = meetingRepository;
        this.ollamaClient = ollamaClient;
        this.parser = parser;
        this.tx = tx;
    }

    public EmailDraft draft(Long meetingId, String toneKey) {
        String key = toneKey == null ? "" : toneKey.trim().toLowerCase(Locale.ROOT);
        String tone = TONES.getOrDefault(key, TONES.get("professional"));

        Context context = tx.execute(status -> {
            Meeting meeting = meetingRepository.findByIdAndOwnerId(meetingId, CurrentUser.id())
                    .orElseThrow(() -> new NotFoundException("Meeting not found: " + meetingId));
            if (meeting.getStatus() != MeetingStatus.ANALYZED) {
                throw new BadRequestException(
                        "Analyze the meeting first, so the email can include its summary, decisions and tasks.");
            }
            List<String> decisions = meeting.getDecisions().stream().map(Decision::getText).toList();
            List<String> openTasks = meeting.getTasks().stream()
                    .filter(t -> t.getStatus() != TaskStatus.DONE)
                    .map(EmailService::formatTask)
                    .toList();
            String summary = meeting.getSummary() == null ? "" : meeting.getSummary();
            return new Context(meeting.getTitle(), summary, decisions, openTasks);
        });

        String system = SYSTEM_PROMPT.formatted(tone);
        String user = buildUserPrompt(context);

        LlmException last = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                return parser.parse(ollamaClient.chatJson(system, user));
            } catch (LlmException ex) {
                last = ex;
            }
        }
        throw last;
    }

    private static String buildUserPrompt(Context c) {
        StringBuilder sb = new StringBuilder();
        sb.append("Meeting: ").append(c.title()).append("\n\n");
        sb.append("Summary: ").append(c.summary().isBlank() ? "(none)" : c.summary()).append("\n\n");
        sb.append("Decisions:\n");
        if (c.decisions().isEmpty()) {
            sb.append("(none)\n");
        } else {
            c.decisions().forEach(d -> sb.append("- ").append(d).append('\n'));
        }
        sb.append("\nOpen action items:\n");
        if (c.openTasks().isEmpty()) {
            sb.append("(none)\n");
        } else {
            c.openTasks().forEach(t -> sb.append(t).append('\n'));
        }
        return sb.toString();
    }

    private static String formatTask(Task t) {
        return "- " + t.getTitle()
                + " | owner: " + (t.getAssignee() == null ? "unassigned" : t.getAssignee())
                + " | deadline: " + (t.getDeadline() == null ? "none" : t.getDeadline());
    }
}
