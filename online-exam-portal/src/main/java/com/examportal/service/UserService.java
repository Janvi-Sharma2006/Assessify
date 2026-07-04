package com.examportal.service;

import com.examportal.dto.LoginRequest;
import com.examportal.dto.RegisterRequest;
import com.examportal.entity.User;
import com.examportal.repository.UserRepository;
import com.examportal.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "STUDENT");
        user.setCompany(request.getCompany());
        userRepository.save(user);
        return "Registered successfully";
    }

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("company", user.getCompany());
        return response;
    }
}