package com.examportal.controller;

import com.examportal.dto.DriveRequest;
import com.examportal.entity.Drive;
import com.examportal.security.SecurityUtils;
import com.examportal.service.DriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drives")
@CrossOrigin("*")
public class DriveController {

    @Autowired private DriveService driveService;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Drive> createDrive(@RequestBody DriveRequest request) {
        // never trust a client-supplied "createdById" — always the authenticated caller
        request.setCreatedById(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(driveService.createDrive(request));
    }

    @GetMapping("/all")
    public List<Drive> getAllDrives() {
        return driveService.getAllDrives();
    }

    @GetMapping("/live")
    public List<Drive> getLiveDrives() {
        return driveService.getLiveDrives();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Drive> getDriveById(@PathVariable Long id) {
        return ResponseEntity.ok(driveService.getDriveById(id));
    }

    @GetMapping("/my/{userId}")
    public List<Drive> getMyDrives(@PathVariable Long userId) {
        if (!SecurityUtils.getCurrentUserId().equals(userId) && !SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("Not your drives");
        }
        return driveService.getDrivesByUser(userId);
    }

    @GetMapping("/invite/{slug}")
    public ResponseEntity<Drive> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(driveService.getDriveBySlug(slug));
    }

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Drive> toggleStatus(@PathVariable Long id) {
        driveService.assertOwnerOrAdmin(id, SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin());
        return ResponseEntity.ok(driveService.toggleStatus(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<Drive> setStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        driveService.assertOwnerOrAdmin(id, SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin());
        return ResponseEntity.ok(driveService.setStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<String> deleteDrive(@PathVariable Long id) {
        driveService.assertOwnerOrAdmin(id, SecurityUtils.getCurrentUserId(), SecurityUtils.isAdmin());
        driveService.deleteDrive(id);
        return ResponseEntity.ok("Drive deleted");
    }
}