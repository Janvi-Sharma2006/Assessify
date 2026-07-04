package com.examportal.repository;

import com.examportal.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentId(Long studentId);
    List<Result> findByDriveId(Long driveId);
    boolean existsByStudentIdAndDriveId(Long studentId, Long driveId);
    void deleteByDriveId(Long driveId);
}