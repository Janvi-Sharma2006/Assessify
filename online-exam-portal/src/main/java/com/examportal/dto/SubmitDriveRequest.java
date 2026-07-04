package com.examportal.dto;

import lombok.*;
import java.util.List;

@Getter @Setter
public class SubmitDriveRequest {
    private Long driveId;
    private Long studentId;
    private Integer timeTakenSeconds;
    private Integer tabViolations;
    private List<AnswerRequest> answers;

    @Getter @Setter
    public static class AnswerRequest {
        private Long questionId;
        private String selectedAnswer;
    }
}