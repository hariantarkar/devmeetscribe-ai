package com.devmeetscribe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devmeetscribe.backend.entity.Meeting;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findAllByOrderByCreatedAtDesc();
}
