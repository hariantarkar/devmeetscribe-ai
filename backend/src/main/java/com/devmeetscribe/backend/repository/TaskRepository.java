package com.devmeetscribe.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devmeetscribe.backend.entity.Task;
import com.devmeetscribe.backend.entity.TaskStatus;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMeetingIdOrderByIdAsc(Long meetingId);

    List<Task> findByStatusOrderByIdDesc(TaskStatus status);

    List<Task> findAllByOrderByIdDesc();

    List<Task> findByMeetingOwnerIdOrderByIdDesc(Long ownerId);

    List<Task> findByMeetingOwnerIdAndStatusOrderByIdDesc(Long ownerId, TaskStatus status);

    Optional<Task> findByIdAndMeetingOwnerId(Long id, Long ownerId);
}
