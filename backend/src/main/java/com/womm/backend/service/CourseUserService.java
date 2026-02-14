package com.womm.backend.service;

import com.womm.backend.entity.CourseUser;

import java.util.List;

public interface CourseUserService {
    public CourseUser createCourseUser(CourseUser courseUser);
    public CourseUser getCourseUser(String userCwid, String courseCrn);
    public List<CourseUser> getAllCourseUsers();
    public CourseUser updateCourseUser(CourseUser courseUser);
    public void deleteCourseUser(String userCwid, String courseCrn);
}
