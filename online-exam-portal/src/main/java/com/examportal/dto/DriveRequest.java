package com.examportal.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
public class DriveRequest {
    private String title;
    private String position;
    private String category;
    private String difficulty;
    private int duration;
    private int totalQuestions;
    private LocalDate deadline;
    private Long createdById;
}