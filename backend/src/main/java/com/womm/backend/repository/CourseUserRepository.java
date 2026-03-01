package com.womm.backend.repository;
import com.womm.backend.entity.Course;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import com.womm.backend.id.CourseUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface CourseUserRepository extends JpaRepository<CourseUser, CourseUserId> {
    @Query("SELECT cu.course FROM CourseUser cu WHERE cu.user.id = :userId")
    List<Course> findCoursesByUserId(@Param("userId") String userId);

    @Query("SELECT cu FROM CourseUser cu WHERE cu.course.crn = :crn")
    List<CourseUser> findUsersByCourseCrn(@Param("crn") String crn);

    @Modifying
    @Transactional
    @Query("DELETE FROM CourseUser cu WHERE cu.course.crn = :crn")
    void deleteByCoursecrn(@Param("crn") String crn);

    @Query("SELECT cu FROM CourseUser cu WHERE cu.user.id = :userId")
    List<CourseUser> findCourseUsersByUserId(@Param("userId") String userId);
}