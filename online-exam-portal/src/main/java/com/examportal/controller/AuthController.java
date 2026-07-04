package com.examportal.controller;

import com.examportal.dto.LoginRequest;
import com.examportal.dto.RegisterRequest;
import com.examportal.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String result = userService.register(request);
        if (result.equals("Email already exists")) {
            return ResponseEntity.status(400).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> result = userService.login(request);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }
}