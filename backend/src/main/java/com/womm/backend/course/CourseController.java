package com.womm.backend.course;

import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping(path = "/course")
public class CourseController {

    CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // ----- CRUD -----
    // Create
    @PostMapping
    public String createCourseDetails(@RequestBody Course course) {
        courseService.createCourse(course);
        return "Course created successfully.";
    }

    // Retrieve One
    @GetMapping("{crn}")
    public Course getCourseDetails(@PathVariable("crn") String crn) {
        return courseService.getCourse(crn);
    }

    // Retrieve All
    @GetMapping()
    public List<Course> getAllCourseDetails() {
        return courseService.getAllCourses();
    }

    // Update
    @PutMapping
    public String updateCourseDetails(@RequestBody Course course) {
        courseService.updateCourse(course);
        return "Course updated successfully.";
    }

    // Delete
    @DeleteMapping("{crn}")
    public String deleteCourseDetails(@PathVariable("crn") String crn) {
        courseService.deleteCourse(crn);
        return "Course deleted successfully.";
    }

}
