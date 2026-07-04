package com.examportal.repository;

import com.examportal.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDriveId(Long driveId);
    void deleteByDriveId(Long driveId);
}