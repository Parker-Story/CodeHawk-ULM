package com.womm.backend.repository;

import com.womm.backend.entity.SubmissionFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SubmissionFileRepository extends JpaRepository<SubmissionFile, Long> {
    List<SubmissionFile> findByUserIdAndAssignmentIdOrderByFileOrder(String userId, Long assignmentId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM SubmissionFile sf WHERE sf.userId = :userId AND sf.assignmentId = :assignmentId")
    void deleteByUserIdAndAssignmentId(@Param("userId") String userId, @Param("assignmentId") Long assignmentId);
}
