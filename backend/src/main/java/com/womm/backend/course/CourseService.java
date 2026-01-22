package com.womm.backend.course;

import java.util.List;

public interface CourseService {
    public String createCourse(Course course);
    public Course getCourse(String crn);
    public List<Course> getAllCourses();
    public String updateCourse(Course course);
    public String deleteCourse(String crn);
}
