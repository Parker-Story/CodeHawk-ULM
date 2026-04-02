package com.womm.backend.repository;

import com.womm.backend.entity.RubricScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface RubricScoreRepository extends JpaRepository<RubricScore, Long> {
    @Query("SELECT rs FROM RubricScore rs WHERE rs.submission.submissionId.userId = :userId AND rs.submission.submissionId.assignmentId = :assignmentId")
    List<RubricScore> findBySubmission(@Param("assignmentId") Long assignmentId, @Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RubricScore rs WHERE rs.submission.submissionId.userId = :userId AND rs.submission.submissionId.assignmentId = :assignmentId")
    void deleteBySubmission(@Param("assignmentId") Long assignmentId, @Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RubricScore rs WHERE rs.submission.submissionId.assignmentId = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM RubricScore rs WHERE rs.rubricItem.criteria.rubric.id = :rubricId")
    void deleteByRubricId(@Param("rubricId") Long rubricId);
}