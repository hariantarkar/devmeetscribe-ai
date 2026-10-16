package com.devmeetscribe.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devmeetscribe.backend.entity.Meeting;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findAllByOrderByCreatedAtDesc();

    List<Meeting> findAllByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Optional<Meeting> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByIdAndOwnerId(Long id, Long ownerId);
}
