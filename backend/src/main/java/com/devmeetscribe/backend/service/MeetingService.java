package com.devmeetscribe.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.devmeetscribe.backend.dto.AnalysisResult;
import com.devmeetscribe.backend.dto.CreateMeetingRequest;
import com.devmeetscribe.backend.dto.MeetingDetail;
import com.devmeetscribe.backend.dto.MeetingListItem;
import com.devmeetscribe.backend.entity.Decision;
import com.devmeetscribe.backend.entity.Meeting;
import com.devmeetscribe.backend.entity.MeetingStatus;
import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.exception.BadRequestException;
import com.devmeetscribe.backend.exception.NotFoundException;
import com.devmeetscribe.backend.repository.MeetingRepository;
import com.devmeetscribe.backend.util.TextUtils;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingAnalysisService analysisService;
    private final TransactionTemplate tx;

    @Value("${meetscribe.max-transcript-chars:20000}")
    private int maxTranscriptChars;

    public MeetingService(MeetingRepository meetingRepository,
                          MeetingAnalysisService analysisService,
                          TransactionTemplate tx) {
        this.meetingRepository = meetingRepository;
        this.analysisService = analysisService;
        this.tx = tx;
    }

    @Transactional
    public MeetingDetail create(CreateMeetingRequest request) {
        if (request.transcript().length() > maxTranscriptChars) {
            throw new BadRequestException("Transcript is too long (max " + maxTranscriptChars
                    + " characters for now). Long-transcript chunking is on the roadmap.");
        }
        Meeting meeting = new Meeting();
        meeting.setTitle(request.title().trim());
        meeting.setTranscript(request.transcript().trim());
        return MeetingMapper.toDetail(meetingRepository.save(meeting));
    }

    @Transactional(readOnly = true)
    public List<MeetingListItem> list() {
        return meetingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MeetingMapper::toListItem)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingDetail get(Long id) {
        return MeetingMapper.toDetail(find(id));
    }

    @Transactional
    public void delete(Long id) {
        meetingRepository.delete(find(id));
    }

    /**
     * Runs the LLM outside any DB transaction (it can take a while),
     * then saves the results in a short transaction. Re-analysing replaces earlier AI output.
     */
    public MeetingDetail analyze(Long id) {
        String transcript = tx.execute(status -> find(id).getTranscript());

        AnalysisResult result = analysisService.analyze(transcript);

        return tx.execute(status -> {
            Meeting meeting = find(id);
            apply(meeting, result);
            return MeetingMapper.toDetail(meetingRepository.save(meeting));
        });
    }

    private void apply(Meeting meeting, AnalysisResult result) {
        meeting.setSummary(result.summary() == null ? "" : result.summary().trim());
        meeting.getDecisions().clear();
        meeting.getTasks().clear();

        for (String text : result.decisions()) {
            String clean = TextUtils.blankToNull(text);
            if (clean != null) {
                Decision decision = new Decision();
                decision.setMeeting(meeting);
                decision.setText(clean);
                meeting.getDecisions().add(decision);
            }
        }

        for (AnalysisResult.TaskItem item : result.tasks()) {
            if (item == null) {
                continue;
            }
            String title = TextUtils.blankToNull(item.title());
            if (title == null) {
                continue;
            }
            Task task = new Task();
            task.setMeeting(meeting);
            task.setTitle(title.length() > 500 ? title.substring(0, 500) : title);
            task.setAssignee(TextUtils.blankToNull(item.assignee()));
            task.setDeadline(TextUtils.blankToNull(item.deadline()));
            if (item.confidence() != null) {
                task.setConfidence(Math.max(0.0, Math.min(1.0, item.confidence())));
            }
            meeting.getTasks().add(task);
        }
        meeting.setStatus(MeetingStatus.ANALYZED);
    }

    private Meeting find(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Meeting not found: " + id));
    }
}
