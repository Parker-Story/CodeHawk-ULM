package com.womm.backend.service;
import com.womm.backend.entity.Course;
import java.util.List;

public interface CourseService {
    Course createCourse(Course course, String userId);
    Course getCourse(String crn);
    List<Course> getAllCourses();
    Course updateCourse(Course course);
    void deleteCourse(String crn);
    List<Course> getCoursesByUser(String userId);
}