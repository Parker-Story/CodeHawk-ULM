package com.womm.backend.repository;

import com.womm.backend.entity.RubricCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RubricCriteriaRepository extends JpaRepository<RubricCriteria, Long> {
    @Query("SELECT c FROM RubricCriteria c WHERE c.rubric.id = :rubricId ORDER BY c.displayOrder ASC")
    List<RubricCriteria> findByRubricId(@Param("rubricId") Long rubricId);
}