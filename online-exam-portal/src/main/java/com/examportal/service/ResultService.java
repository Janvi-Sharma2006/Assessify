package com.examportal.service;

import com.examportal.dto.SubmitDriveRequest;
import com.examportal.entity.*;
import com.examportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ResultService {

    @Autowired private ResultRepository resultRepository;
    @Autowired private DriveRepository driveRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private UserRepository userRepository;

    public Map<String, Object> submitDrive(SubmitDriveRequest request) {
        Drive drive = driveRepository.findById(request.getDriveId())
                .orElseThrow(() -> new RuntimeException("Drive not found"));
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (resultRepository.existsByStudentIdAndDriveId(student.getId(), drive.getId())) {
            throw new RuntimeException("Already attempted this drive");
        }

        List<Question> questions = questionRepository.findByDriveId(request.getDriveId());
        int score = 0;
        for (SubmitDriveRequest.AnswerRequest ans : request.getAnswers()) {
            for (Question q : questions) {
                if (q.getId().equals(ans.getQuestionId())
                        && q.getCorrectAnswer().equalsIgnoreCase(ans.getSelectedAnswer())) {
                    score++;
                }
            }
        }

        int total = questions.size();
        double percentage = total > 0 ? (score * 100.0 / total) : 0;
        String status = percentage >= 50 ? "CLEARED" : "NOT_CLEARED";

        List<Result> allResults = resultRepository.findByDriveId(drive.getId());
        final int finalScore = score;
        long below = allResults.stream()
                .filter(r -> r.getScore() != null && r.getScore() < finalScore)
                .count();
        double percentile = allResults.isEmpty() ? 100.0
                : Math.round((below * 100.0 / allResults.size()) * 10) / 10.0;

        Result result = new Result();
        result.setStudent(student);
        result.setDrive(drive);
        result.setScore(score);
        result.setTotalQuestions(total);
        result.setTimeTakenSeconds(request.getTimeTakenSeconds());
        result.setTabViolations(request.getTabViolations() != null ? request.getTabViolations() : 0);
        result.setPercentile(percentile);
        result.setStatus(status);

        resultRepository.save(result);

        Map<String, Object> resp = new HashMap<>();
        resp.put("score", score);
        resp.put("total", total);
        resp.put("percentage", (int) Math.round(percentage));
        resp.put("percentile", percentile);
        resp.put("status", status);
        resp.put("tabViolations", result.getTabViolations());
        resp.put("timeTakenSeconds", request.getTimeTakenSeconds());
        return resp;
    }

    public List<Map<String, Object>> getStudentResults(Long studentId) {
        List<Result> results = resultRepository.findByStudentId(studentId);
        List<Map<String, Object>> resp = new ArrayList<>();
        for (Result r : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("driveId", r.getDrive().getId());
            map.put("driveTitle", r.getDrive().getTitle());
            map.put("score", r.getScore());
            map.put("totalQuestions", r.getTotalQuestions());
            map.put("percentage", r.getTotalQuestions() != null && r.getTotalQuestions() > 0
                    ? (int) Math.round(r.getScore() * 100.0 / r.getTotalQuestions()) : 0);
            map.put("percentile", r.getPercentile());
            map.put("status", r.getStatus());
            map.put("tabViolations", r.getTabViolations());
            resp.add(map);
        }
        return resp;
    }

    public List<Map<String, Object>> getDriveScorecard(Long driveId) {
        List<Result> results = resultRepository.findByDriveId(driveId);
        results.sort((a, b) -> b.getScore() - a.getScore());
        List<Map<String, Object>> resp = new ArrayList<>();
        int rank = 1;
        for (Result r : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("rank", rank++);
            map.put("studentId", r.getStudent().getId());
            map.put("studentName", r.getStudent().getName());
            map.put("studentEmail", r.getStudent().getEmail());
            map.put("score", r.getScore());
            map.put("totalQuestions", r.getTotalQuestions());
            map.put("percentage", r.getTotalQuestions() != null && r.getTotalQuestions() > 0
                    ? (int) Math.round(r.getScore() * 100.0 / r.getTotalQuestions()) : 0);
            map.put("percentile", r.getPercentile());
            map.put("status", r.getStatus());
            map.put("timeTakenSeconds", r.getTimeTakenSeconds());
            map.put("tabViolations", r.getTabViolations());
            resp.add(map);
        }
        return resp;
    }
}