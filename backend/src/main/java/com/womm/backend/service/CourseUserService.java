package com.womm.backend.service;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import java.util.List;

public interface CourseUserService {
    CourseUser createCourseUser(CourseUser courseUser);
    CourseUser getCourseUser(String userId, String courseCrn);
    List<CourseUser> getAllCourseUsers();
    CourseUser updateCourseUser(CourseUser courseUser);
    void deleteCourseUser(String userId, String courseCrn);
    CourseUser addUserToCourse(String crn, String cwid);
    List<User> getUsersByCourse(String crn);
    CourseUser enrollByCode(String code, String cwid);
}