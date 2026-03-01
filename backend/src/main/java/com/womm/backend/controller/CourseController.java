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

    @GetMapping("/user/{userId}")
    public List<Course> getCoursesByUser(@PathVariable("userId") String userId) {
        return courseService.getCoursesByUser(userId);
    }

    @PostMapping("/{userId}")
    public Course createCourseDetails(@RequestBody Course course, @PathVariable("userId") String userId) {
        return courseService.createCourse(course, userId);
    }

    @GetMapping("/{crn}")
    public Course getCourseDetails(@PathVariable("crn") String crn) {
        return courseService.getCourse(crn);
    }

    @GetMapping()
    public List<Course> getAllCourseDetails() {
        return courseService.getAllCourses();
    }

    @PutMapping
    public Course updateCourseDetails(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    @DeleteMapping("/{crn}")
    public void deleteCourseDetails(@PathVariable("crn") String crn) {
        courseService.deleteCourse(crn);
    }
}