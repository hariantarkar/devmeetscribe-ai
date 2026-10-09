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

import com.devmeetscribe.backend.dto.CreateMeetingRequest;
import com.devmeetscribe.backend.dto.CreateTaskRequest;
import com.devmeetscribe.backend.dto.MeetingDetail;
import com.devmeetscribe.backend.dto.MeetingListItem;
import com.devmeetscribe.backend.dto.TaskResponse;
import com.devmeetscribe.backend.service.MeetingService;
import com.devmeetscribe.backend.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;
    private final TaskService taskService;

    public MeetingController(MeetingService meetingService, TaskService taskService) {
        this.meetingService = meetingService;
        this.taskService = taskService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MeetingDetail create(@Valid @RequestBody CreateMeetingRequest request) {
        return meetingService.create(request);
    }

    @GetMapping
    public List<MeetingListItem> list() {
        return meetingService.list();
    }

    @GetMapping("/{id}")
    public MeetingDetail get(@PathVariable Long id) {
        return meetingService.get(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        meetingService.delete(id);
    }

    @PostMapping("/{id}/analyze")
    public MeetingDetail analyze(@PathVariable Long id) {
        return meetingService.analyze(id);
    }

    @GetMapping("/{id}/tasks")
    public List<TaskResponse> tasks(@PathVariable Long id) {
        return taskService.listByMeeting(id);
    }

    @PostMapping("/{id}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse addTask(@PathVariable Long id, @Valid @RequestBody CreateTaskRequest request) {
        return taskService.add(id, request);
    }
}
