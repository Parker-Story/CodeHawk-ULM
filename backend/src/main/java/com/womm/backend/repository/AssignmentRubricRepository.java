package com.womm.backend.repository;

import com.womm.backend.entity.AssignmentRubric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface AssignmentRubricRepository extends JpaRepository<AssignmentRubric, Long> {
    Optional<AssignmentRubric> findByAssignmentId(Long assignmentId);
    void deleteByAssignmentId(Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentRubric ar WHERE ar.rubric.id = :rubricId")
    void deleteByRubricId(@Param("rubricId") Long rubricId);
}