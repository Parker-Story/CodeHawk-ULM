package com.womm.backend.service;
import com.womm.backend.entity.Course;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import com.womm.backend.id.CourseUserId;
import com.womm.backend.repository.CourseRepository;
import com.womm.backend.repository.CourseUserRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

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
    public Course createCourse(Course course, String facultyCwid) {
        Course savedCourse = courseRepository.save(course);
        User faculty = userRepository.findById(facultyCwid).get();
        CourseUser courseUser = new CourseUser(faculty, savedCourse);
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
    public List<Course> getCoursesByFaculty(String cwid) {
        return courseUserRepository.findCoursesByUserCwid(cwid);
    }
}