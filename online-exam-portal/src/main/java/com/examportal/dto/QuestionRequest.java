package com.examportal.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuestionRequest {
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String category;
    private String difficulty;
    private Long driveId;
}