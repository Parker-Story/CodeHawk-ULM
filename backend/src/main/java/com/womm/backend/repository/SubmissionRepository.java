package com.womm.backend.repository;
import com.womm.backend.entity.Submission;
import com.womm.backend.id.SubmissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, SubmissionId> {

    @Query("SELECT s FROM Submission s WHERE s.assignment.id = :assignmentId")
    List<Submission> findByAssignmentId(@Param("assignmentId") Long assignmentId);
}