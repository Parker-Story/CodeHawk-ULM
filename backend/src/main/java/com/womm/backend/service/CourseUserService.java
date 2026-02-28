package com.womm.backend.service;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import java.util.List;

public interface CourseUserService {
    public CourseUser createCourseUser(CourseUser courseUser);
    public CourseUser getCourseUser(String userCwid, String courseCrn);
    public List<CourseUser> getAllCourseUsers();
    public CourseUser updateCourseUser(CourseUser courseUser);
    public void deleteCourseUser(String userCwid, String courseCrn);
    CourseUser addUserToCourse(String crn, String cwid);
    List<User> getUsersByCourse(String crn);
    CourseUser enrollByCode(String code, String cwid);
}