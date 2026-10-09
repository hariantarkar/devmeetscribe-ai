package com.devmeetscribe.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devmeetscribe.backend.dto.CreateTaskRequest;
import com.devmeetscribe.backend.dto.TaskResponse;
import com.devmeetscribe.backend.dto.UpdateTaskRequest;
import com.devmeetscribe.backend.entity.Meeting;
import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.entity.TaskStatus;
import com.devmeetscribe.backend.exception.NotFoundException;
import com.devmeetscribe.backend.repository.MeetingRepository;
import com.devmeetscribe.backend.repository.TaskRepository;
import com.devmeetscribe.backend.util.TextUtils;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;

    public TaskService(TaskRepository taskRepository, MeetingRepository meetingRepository) {
        this.taskRepository = taskRepository;
        this.meetingRepository = meetingRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listByMeeting(Long meetingId) {
        if (!meetingRepository.existsById(meetingId)) {
            throw new NotFoundException("Meeting not found: " + meetingId);
        }
        return taskRepository.findByMeetingIdOrderByIdAsc(meetingId).stream()
                .map(MeetingMapper::toTaskResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listAll(TaskStatus status) {
        List<Task> tasks = (status == null)
                ? taskRepository.findAllByOrderByIdDesc()
                : taskRepository.findByStatusOrderByIdDesc(status);
        return tasks.stream().map(MeetingMapper::toTaskResponse).toList();
    }

    @Transactional
    public TaskResponse add(Long meetingId, CreateTaskRequest request) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new NotFoundException("Meeting not found: " + meetingId));
        Task task = new Task();
        task.setMeeting(meeting);
        task.setTitle(request.title().trim());
        task.setAssignee(TextUtils.blankToNull(request.assignee()));
        task.setDeadline(TextUtils.blankToNull(request.deadline()));
        return MeetingMapper.toTaskResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, UpdateTaskRequest request) {
        Task task = find(id);
        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title().trim());
        }
        if (request.assignee() != null) {
            task.setAssignee(TextUtils.blankToNull(request.assignee()));
        }
        if (request.deadline() != null) {
            task.setDeadline(TextUtils.blankToNull(request.deadline()));
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        return MeetingMapper.toTaskResponse(task);
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(find(id));
    }

    private Task find(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Task not found: " + id));
    }
}
