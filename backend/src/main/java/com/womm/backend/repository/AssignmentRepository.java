package com.womm.backend.repository;

import com.womm.backend.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment,Long> {
}
