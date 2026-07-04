package com.examportal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "drives")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Drive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String position;
    private String category;
    private String difficulty;
    private int duration;
    private int totalQuestions;
    private int totalMarks;

    // DRAFT | LIVE | CLOSED
    private String status;

    private LocalDate deadline;

    @Column(unique = true)
    private String inviteSlug;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;
}