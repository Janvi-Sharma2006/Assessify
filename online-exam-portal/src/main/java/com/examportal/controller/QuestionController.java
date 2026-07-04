package com.examportal.controller;

import com.examportal.dto.QuestionRequest;
import com.examportal.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.examportal.entity.Question;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin("*")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping("/add")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public String addQuestion(@RequestBody QuestionRequest request) {
        return questionService.addQuestion(request);
    }

    @GetMapping("/drive/{driveId}")
    public List<Question> getQuestionsByDrive(@PathVariable Long driveId) {
        return questionService.getQuestionsByDrive(driveId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public String deleteQuestion(@PathVariable Long id) {
        return questionService.deleteQuestion(id);
    }
}