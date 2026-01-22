package com.womm.backend.courseUser;

import com.womm.backend.course.CourseRepository;
import com.womm.backend.user.UserRepository;
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

        String userCwid = courseUser.getCourseUserId().getUserCwid();
        String courseCrn = courseUser.getCourseUserId().getCourseCrn();

        courseUser.setUser(userRepository.findById(userCwid).get());
        courseUser.setCourse(courseRepository.findById(courseCrn).get());

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

        String userCwid = courseUser.getCourseUserId().getUserCwid();
        String courseCrn = courseUser.getCourseUserId().getCourseCrn();

        courseUser.setUser(userRepository.findById(userCwid).get());
        courseUser.setCourse(courseRepository.findById(courseCrn).get());

        return courseUserRepository.save(courseUser);

    }

    @Override
    public void deleteCourseUser(String userCwid, String courseCrn) {
        courseUserRepository.deleteById(new CourseUserId(userCwid, courseCrn));
    }
}
