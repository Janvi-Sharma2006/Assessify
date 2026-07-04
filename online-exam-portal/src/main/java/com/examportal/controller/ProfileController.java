package com.examportal.controller;

import com.examportal.dto.ProfileRequest;
import com.examportal.security.SecurityUtils;
import com.examportal.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin("*")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        if (!SecurityUtils.getCurrentUserId().equals(userId) && !SecurityUtils.isAdmin()) {
            throw new AccessDeniedException("Not your profile");
        }
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveProfile(@RequestBody ProfileRequest request) {
        // never trust a client-supplied userId — always the authenticated caller
        request.setUserId(SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(profileService.saveProfile(request));
    }
}