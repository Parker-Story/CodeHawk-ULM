package com.womm.backend.service;
import com.womm.backend.entity.Course;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import com.womm.backend.repository.CourseRepository;
import com.womm.backend.repository.CourseUserRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import com.womm.backend.enums.CourseRole;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class CourseServiceImpl implements CourseService {
    CourseRepository courseRepository;
    CourseUserRepository courseUserRepository;
    UserRepository userRepository;

    public CourseServiceImpl(CourseRepository courseRepository, CourseUserRepository courseUserRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.courseUserRepository = courseUserRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Course createCourse(Course course, String userId) {
        courseRepository.findById(course.getCrn()).ifPresent(existing -> {
            if (!existing.isArchived()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "An active course exists with this CRN. Please try again.");
            }
        });
        Course savedCourse = courseRepository.save(course);
        User faculty = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        CourseUser courseUser = new CourseUser(faculty, savedCourse, CourseRole.FACULTY);
        courseUserRepository.save(courseUser);
        return savedCourse;
    }

    @Override
    public Course getCourse(String crn) {
        return courseRepository.findById(crn).get();
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course updateCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public void deleteCourse(String crn) {
        courseUserRepository.deleteByCoursecrn(crn);
        courseRepository.deleteById(crn);
    }

    @Override
    public List<Course> getCoursesByUser(String userId) {
        return courseUserRepository.findCoursesByUserId(userId);
    }
}