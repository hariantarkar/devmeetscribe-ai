package com.devmeetscribe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.entity.TaskStatus;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMeetingIdOrderByIdAsc(Long meetingId);

    List<Task> findByStatusOrderByIdDesc(TaskStatus status);

    List<Task> findAllByOrderByIdDesc();
}
