package com.womm.backend.repository;

import com.womm.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course,String> {
}
