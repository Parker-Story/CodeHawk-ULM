package com.womm.backend.controller;

import com.womm.backend.service.CourseService;
import com.womm.backend.entity.Course;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping(path = "/course")
public class CourseController {
    CourseService courseService;
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Get courses by faculty - must be ABOVE /{crn} to avoid routing conflict
    @GetMapping("/faculty/{cwid}")
    public List<Course> getCoursesByFaculty(@PathVariable("cwid") String cwid) {
        return courseService.getCoursesByFaculty(cwid);
    }

    // Create
    @PostMapping("/{cwid}")
    public Course createCourseDetails(@RequestBody Course course, @PathVariable("cwid") String cwid) {
        return courseService.createCourse(course, cwid);
    }

    // Retrieve One
    @GetMapping("/{crn}")
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
    @DeleteMapping("/{crn}")
    public void deleteCourseDetails(@PathVariable("crn") String crn) {
        courseService.deleteCourse(crn);
    }
}