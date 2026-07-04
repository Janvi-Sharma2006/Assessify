package com.examportal.repository;

import com.examportal.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriveRepository extends JpaRepository<Drive, Long> {
    List<Drive> findByCreatedById(Long createdById);
    Optional<Drive> findByInviteSlug(String inviteSlug);
    List<Drive> findByStatus(String status);
}