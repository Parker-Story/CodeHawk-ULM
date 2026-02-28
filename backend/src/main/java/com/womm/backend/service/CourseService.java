package com.womm.backend.service;

import com.womm.backend.entity.Course;

import java.util.List;

public interface CourseService {
    Course createCourse(Course course, String facultyCwid);
    public Course getCourse(String crn);
    public List<Course> getAllCourses();
    public Course updateCourse(Course course);
    public void deleteCourse(String crn);
    List<Course> getCoursesByFaculty(String cwid);
}
