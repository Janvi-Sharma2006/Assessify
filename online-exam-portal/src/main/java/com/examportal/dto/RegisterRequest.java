package com.examportal.dto;

import lombok.*;

@Getter @Setter
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;     // HR | STUDENT
    private String company;
}