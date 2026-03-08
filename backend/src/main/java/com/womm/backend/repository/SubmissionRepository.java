package com.womm.backend.repository;
import com.womm.backend.entity.Submission;
import com.womm.backend.id.SubmissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface SubmissionRepository extends JpaRepository<Submission, SubmissionId> {

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId")
    List<Submission> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.assignment.id = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT COUNT(s) FROM Submission s WHERE s.submissionId.userId = :userId AND s.assignment.course.crn = :crn")
    long countByUserIdAndCourseCrn(@Param("userId") String userId, @Param("crn") String crn);

    @Modifying
    @Transactional
    @Query("DELETE FROM Submission s WHERE s.submissionId.userId = :userId AND s.assignment.course.crn = :crn")
    void deleteByUserIdAndCourseCrn(@Param("userId") String userId, @Param("crn") String crn);


}