package com.womm.backend.repository;

import com.womm.backend.id.CourseUserId;
import com.womm.backend.entity.CourseUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUserRepository extends JpaRepository<CourseUser, CourseUserId> {
}
