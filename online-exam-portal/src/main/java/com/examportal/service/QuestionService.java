package com.examportal.service;

import com.examportal.dto.QuestionRequest;
import com.examportal.entity.Drive;
import com.examportal.entity.Question;
import com.examportal.repository.DriveRepository;
import com.examportal.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class QuestionService {

    @Autowired private QuestionRepository questionRepository;
    @Autowired private DriveRepository driveRepository;

    public String addQuestion(QuestionRequest request) {
        Drive drive = driveRepository.findById(request.getDriveId()).orElse(null);
        if (drive == null) {
            return "Drive not found";
        }

        Question question = new Question();
        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptionA());
        question.setOptionB(request.getOptionB());
        question.setOptionC(request.getOptionC());
        question.setOptionD(request.getOptionD());
        question.setCorrectAnswer(request.getCorrectAnswer());
        question.setCategory(request.getCategory());
        question.setDifficulty(request.getDifficulty());
        question.setDrive(drive);

        questionRepository.save(question);
        return "Question added";
    }

    public List<Question> getQuestionsByDrive(Long driveId) {
        return questionRepository.findByDriveId(driveId);
    }

    public String deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            return "Question not found";
        }
        questionRepository.deleteById(questionId);
        return "Question deleted";
    }
}