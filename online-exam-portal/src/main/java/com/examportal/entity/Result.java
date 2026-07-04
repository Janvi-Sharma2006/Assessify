package com.examportal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "results")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer score;
    private Integer totalQuestions;
    private Integer timeTakenSeconds;
    private Integer tabViolations;
    private Double percentile;

    // CLEARED | NOT_CLEARED
    private String status;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "drive_id")
    private Drive drive;
}