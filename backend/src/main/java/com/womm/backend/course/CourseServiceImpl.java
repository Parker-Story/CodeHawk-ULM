package com.womm.backend.course;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseServiceImpl implements CourseService {

    CourseRepository courseRepository;

    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public String createCourse(Course course) {
        courseRepository.save(course);
        return "Create Success...";
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
    public String updateCourse(Course course) {
        courseRepository.save(course);
        return "Update Success...";
    }

    @Override
    public String deleteCourse(String crn) {
        courseRepository.deleteById(crn);
        return "Delete Success...";
    }

}
