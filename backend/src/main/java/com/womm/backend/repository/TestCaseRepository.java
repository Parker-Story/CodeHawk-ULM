package com.womm.backend.repository;

import com.womm.backend.entity.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    @Query("SELECT t FROM TestCase t WHERE t.assignment.id = :assignmentId")
    List<TestCase> findByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Query("SELECT t FROM TestCase t WHERE t.assignment.id = :assignmentId AND t.hidden = false")
    List<TestCase> findVisibleByAssignmentId(@Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM TestCase t WHERE t.assignment.id = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);
}