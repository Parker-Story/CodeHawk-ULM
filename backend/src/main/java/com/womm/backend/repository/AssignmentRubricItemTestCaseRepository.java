package com.womm.backend.repository;

import com.womm.backend.entity.AssignmentRubricItemTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface AssignmentRubricItemTestCaseRepository extends JpaRepository<AssignmentRubricItemTestCase, Long> {

    @Query("SELECT a FROM AssignmentRubricItemTestCase a WHERE a.assignment.id = :assignmentId AND a.rubricItem.id = :rubricItemId")
    List<AssignmentRubricItemTestCase> findByAssignmentAndRubricItem(
            @Param("assignmentId") Long assignmentId,
            @Param("rubricItemId") Long rubricItemId
    );

    @Query("SELECT a FROM AssignmentRubricItemTestCase a WHERE a.assignment.id = :assignmentId")
    List<AssignmentRubricItemTestCase> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentRubricItemTestCase a WHERE a.assignment.id = :assignmentId AND a.rubricItem.id = :rubricItemId")
    void deleteByAssignmentAndRubricItem(
            @Param("assignmentId") Long assignmentId,
            @Param("rubricItemId") Long rubricItemId
    );

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentRubricItemTestCase a WHERE a.assignment.id = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);
}