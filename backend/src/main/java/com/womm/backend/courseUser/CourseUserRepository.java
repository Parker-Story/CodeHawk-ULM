package com.womm.backend.courseUser;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseUserRepository extends JpaRepository<CourseUser,CourseUserId> {
}
