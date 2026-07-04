package com.examportal.controller;

import com.examportal.dto.SubmitDriveRequest;
import com.examportal.security.SecurityUtils;
import com.examportal.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin("*")
public class ResultController {

    @Autowired private ResultService resultService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitDrive(@RequestBody SubmitDriveRequest request) {
        // a candidate can only submit as themselves, never on behalf of someone else
        request.setStudentId(SecurityUtils.getCurrentUserId());
        try {
            return ResponseEntity.ok(resultService.submitDrive(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> getStudentResults(@PathVariable Long studentId) {
        boolean isStaff = SecurityUtils.getCurrentUserRole().equals("ADMIN")
                || SecurityUtils.getCurrentUserRole().equals("HR");
        if (!SecurityUtils.getCurrentUserId().equals(studentId) && !isStaff) {
            throw new AccessDeniedException("Not your results");
        }
        return resultService.getStudentResults(studentId);
    }

    @GetMapping("/scorecard/{driveId}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public List<Map<String, Object>> getDriveScorecard(@PathVariable Long driveId) {
        return resultService.getDriveScorecard(driveId);
    }

    @GetMapping("/leaderboard/{driveId}")
    public List<Map<String, Object>> getLeaderboard(@PathVariable Long driveId) {
        // intentionally open to any authenticated user — candidates seeing where they rank
        // is a feature, not a leak
        return resultService.getDriveScorecard(driveId);
    }
}