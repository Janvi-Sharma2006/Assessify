package com.examportal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;

    // Easy | Medium | Hard
    private String difficulty;

    // Java | DSA | SQL | Aptitude | DBMS
    private String category;

    @ManyToOne
    @JoinColumn(name = "drive_id")
    private Drive drive;
}