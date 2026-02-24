package com.womm.backend.controller;

import com.womm.backend.service.CourseUserService;
import com.womm.backend.entity.CourseUser;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path="/courseUser")
@CrossOrigin(origins = "https://codehawk-ulm.onrender.com")
public class CourseUserController {

    CourseUserService courseUserService;

    public CourseUserController(CourseUserService courseUserService) {
        this.courseUserService = courseUserService;
    }


    // ----- CRUD -----
    @PostMapping
    public CourseUser createCourseUserDetails(@RequestBody CourseUser courseUser) {
        return courseUserService.createCourseUser(courseUser);
    }

    @GetMapping("/{userCwid}/{courseCrn}")
    public CourseUser getCourseUserDetails(@PathVariable String userCwid, @PathVariable String courseCrn) {
        return courseUserService.getCourseUser(userCwid, courseCrn);
    }

    @GetMapping
    public List<CourseUser> getAllCourseUserDetails() {
        return courseUserService.getAllCourseUsers();
    }

    @PutMapping
    public CourseUser updateCourseUserDetails(@RequestBody CourseUser courseUser) {
        return courseUserService.updateCourseUser(courseUser);
    }

    @DeleteMapping("/{userCwid}/{courseCrn}")
    public void deleteCourseUserDetails(@PathVariable String userCwid, @PathVariable String courseCrn) {
        courseUserService.deleteCourseUser(userCwid, courseCrn);
    }
}
