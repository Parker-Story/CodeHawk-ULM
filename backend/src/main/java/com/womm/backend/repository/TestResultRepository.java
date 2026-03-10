package com.womm.backend.repository;

import com.womm.backend.entity.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    @Query("SELECT tr FROM TestResult tr WHERE tr.submission.submissionId.assignmentId = :assignmentId AND tr.submission.submissionId.userId = :userId")
    List<TestResult> findBySubmission(@Param("assignmentId") Long assignmentId, @Param("userId") String userId);

    @Query("SELECT tr FROM TestResult tr WHERE tr.submission.submissionId.assignmentId = :assignmentId")
    List<TestResult> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TestResult tr WHERE tr.submission.submissionId.assignmentId = :assignmentId AND tr.submission.submissionId.userId = :userId")
    void deleteBySubmission(@Param("assignmentId") Long assignmentId, @Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TestResult tr WHERE tr.submission.submissionId.userId = :userId AND tr.submission.assignment.course.crn = :crn")
    void deleteByUserIdAndCourseCrn(@Param("userId") String userId, @Param("crn") String crn);

    @Modifying
    @Transactional
    @Query("DELETE FROM TestResult tr WHERE tr.submission.submissionId.assignmentId = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);

}