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
public class CourseUserServiceImpl implements CourseUserService {
    CourseUserRepository courseUserRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;

    public CourseUserServiceImpl(CourseUserRepository courseUserRepository, UserRepository userRepository, CourseRepository courseRepository) {
        this.courseUserRepository = courseUserRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public CourseUser createCourseUser(CourseUser courseUser) {
        return courseUserRepository.save(courseUser);
    }

    @Override
    public CourseUser getCourseUser(String userCwid, String courseCrn) {
        return courseUserRepository.findById(new CourseUserId(userCwid, courseCrn)).get();
    }

    @Override
    public List<CourseUser> getAllCourseUsers() {
        return courseUserRepository.findAll();
    }

    @Override
    public CourseUser updateCourseUser(CourseUser courseUser) {
        return courseUserRepository.save(courseUser);
    }

    @Override
    public void deleteCourseUser(String userCwid, String courseCrn) {
        courseUserRepository.deleteById(new CourseUserId(userCwid, courseCrn));
    }

    @Override
    public CourseUser addUserToCourse(String crn, String cwid) {
        User user = userRepository.findById(cwid).get();
        Course course = courseRepository.findById(crn).get();
        CourseUser courseUser = new CourseUser(user, course);
        return courseUserRepository.save(courseUser);
    }

    @Override
    public List<User> getUsersByCourse(String crn) {
        return courseUserRepository.findUsersByCourseCrn(crn);
    }

    @Override
    public CourseUser enrollByCode(String code, String cwid) {
        Course course = courseRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Course not found with code: " + code));
        User user = userRepository.findById(cwid)
            .orElseThrow(() -> new RuntimeException("User not found with cwid: " + cwid));
        CourseUser courseUser = new CourseUser(user, course);
        return courseUserRepository.save(courseUser);
    }
}