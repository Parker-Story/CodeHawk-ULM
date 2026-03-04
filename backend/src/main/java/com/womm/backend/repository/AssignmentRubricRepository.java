package com.womm.backend.repository;

import com.womm.backend.entity.AssignmentRubric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AssignmentRubricRepository extends JpaRepository<AssignmentRubric, Long> {
    Optional<AssignmentRubric> findByAssignmentId(Long assignmentId);
    void deleteByAssignmentId(Long assignmentId);
}