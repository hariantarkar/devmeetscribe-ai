package com.devmeetscribe.backend.service;

import com.devmeetscribe.backend.dto.DecisionResponse;
import com.devmeetscribe.backend.dto.MeetingDetail;
import com.devmeetscribe.backend.dto.MeetingListItem;
import com.devmeetscribe.backend.dto.TaskResponse;
import com.devmeetscribe.backend.entity.Decision;
import com.devmeetscribe.backend.entity.Meeting;
import com.devmeetscribe.backend.entity.Task;

/** Entity to DTO mapping. Call inside a transaction (lazy collections). */
public final class MeetingMapper {

    private MeetingMapper() {
    }

    public static TaskResponse toTaskResponse(Task t) {
        return new TaskResponse(t.getId(), t.getMeeting().getId(), t.getTitle(),
                t.getAssignee(), t.getDeadline(), t.getStatus(), t.getConfidence());
    }

    public static DecisionResponse toDecisionResponse(Decision d) {
        return new DecisionResponse(d.getId(), d.getText());
    }

    public static MeetingListItem toListItem(Meeting m) {
        return new MeetingListItem(m.getId(), m.getTitle(), m.getStatus(), m.getCreatedAt());
    }

    public static MeetingDetail toDetail(Meeting m) {
        return new MeetingDetail(
                m.getId(), m.getTitle(), m.getTranscript(), m.getSummary(), m.getStatus(), m.getCreatedAt(),
                m.getDecisions().stream().map(MeetingMapper::toDecisionResponse).toList(),
                m.getTasks().stream().map(MeetingMapper::toTaskResponse).toList());
    }
}
