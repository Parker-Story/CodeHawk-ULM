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
    public Course createCourseDetails(@RequestBody Course course) {
        return courseService.createCourse(course);
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
    public Course updateCourseDetails(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    // Delete
    @DeleteMapping("{crn}")
    public void deleteCourseDetails(@PathVariable("crn") String crn) {
        courseService.deleteCourse(crn);
    }

}
