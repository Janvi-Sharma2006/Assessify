package com.examportal.service;

import com.examportal.dto.DriveRequest;
import com.examportal.entity.Drive;
import com.examportal.entity.User;
import com.examportal.repository.DriveRepository;
import com.examportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.ResultRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class DriveService {

    @Autowired private DriveRepository driveRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private ResultRepository resultRepository;

    public Drive createDrive(DriveRequest request) {
        User hr = userRepository.findById(request.getCreatedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Drive drive = new Drive();
        drive.setTitle(request.getTitle());
        drive.setPosition(request.getPosition());
        drive.setCategory(request.getCategory());
        drive.setDifficulty(request.getDifficulty());
        drive.setDuration(request.getDuration());
        drive.setTotalQuestions(request.getTotalQuestions());
        drive.setTotalMarks(request.getTotalQuestions()); // 1 mark per question by default
        drive.setDeadline(request.getDeadline());
        drive.setStatus("DRAFT");
        drive.setCreatedBy(hr);

        String slug = request.getTitle().toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "")
                + "-" + UUID.randomUUID().toString().substring(0, 6);
        drive.setInviteSlug(slug);

        return driveRepository.save(drive);
    }

    public List<Drive> getDrivesByUser(Long userId) {
        return driveRepository.findByCreatedById(userId);
    }

    public List<Drive> getAllDrives() {
        return driveRepository.findAll();
    }

    public List<Drive> getLiveDrives() {
        return driveRepository.findByStatus("LIVE");
    }

    public Drive getDriveById(Long id) {
        return driveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
    }

    public Drive getDriveBySlug(String slug) {
        return driveRepository.findByInviteSlug(slug)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
    }

    public Drive toggleStatus(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
        if ("DRAFT".equals(drive.getStatus())) drive.setStatus("LIVE");
        else if ("LIVE".equals(drive.getStatus())) drive.setStatus("CLOSED");
        return driveRepository.save(drive);
    }

    public Drive setStatus(Long driveId, String status) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
        drive.setStatus(status);
        return driveRepository.save(drive);
    }

    @Transactional
    public void deleteDrive(Long driveId) {
        if (!driveRepository.existsById(driveId)) {
            throw new RuntimeException("Drive not found");
        }
        resultRepository.deleteByDriveId(driveId);   // remove attempts tied to this drive
        questionRepository.deleteByDriveId(driveId); // remove its question bank
        driveRepository.deleteById(driveId);          // finally remove the drive itself
    }

    public void assertOwnerOrAdmin(Long driveId, Long callerId, boolean isAdmin) {
        if (isAdmin) return;
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found"));
        if (drive.getCreatedBy() == null || !drive.getCreatedBy().getId().equals(callerId)) {
            throw new AccessDeniedException("You do not own this drive");
        }
    }
}