package com.womm.backend.repository;

import com.womm.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query("SELECT a FROM Assignment a WHERE a.course.crn = :crn")
    List<Assignment> findByCoursecrn(@Param("crn") String crn);
}