package com.womm.backend.repository;

import com.womm.backend.entity.Rubric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RubricRepository extends JpaRepository<Rubric, Long> {
    @Query("SELECT r FROM Rubric r WHERE r.createdBy.id = :userId")
    List<Rubric> findByCreatedById(@Param("userId") String userId);
}