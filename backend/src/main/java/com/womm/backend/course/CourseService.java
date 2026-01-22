package com.womm.backend.course;

import java.util.List;

public interface CourseService {
    public Course createCourse(Course course);
    public Course getCourse(String crn);
    public List<Course> getAllCourses();
    public Course updateCourse(Course course);
    public void deleteCourse(String crn);
}
