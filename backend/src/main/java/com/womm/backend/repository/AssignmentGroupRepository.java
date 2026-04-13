package com.womm.backend.repository;

import com.womm.backend.entity.AssignmentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface AssignmentGroupRepository extends JpaRepository<AssignmentGroup, Long> {

    List<AssignmentGroup> findByAssignmentId(Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentGroup g WHERE g.assignment.id = :assignmentId")
    void deleteByAssignmentId(@Param("assignmentId") Long assignmentId);
}
