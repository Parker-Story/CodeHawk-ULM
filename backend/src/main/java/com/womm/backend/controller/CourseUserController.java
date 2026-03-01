package com.womm.backend.controller;
import com.womm.backend.service.CourseUserService;
import com.womm.backend.entity.CourseUser;
import org.springframework.web.bind.annotation.*;
import com.womm.backend.entity.User;
import java.util.List;

@RestController
@RequestMapping(path="/courseUser")
public class CourseUserController {
    CourseUserService courseUserService;

    public CourseUserController(CourseUserService courseUserService) {
        this.courseUserService = courseUserService;
    }

    @PostMapping
    public CourseUser createCourseUserDetails(@RequestBody CourseUser courseUser) {
        return courseUserService.createCourseUser(courseUser);
    }

    @PostMapping("/add/{crn}/{cwid}")
    public CourseUser addUserToCourse(@PathVariable String crn, @PathVariable String cwid) {
        return courseUserService.addUserToCourse(crn, cwid);
    }

    @GetMapping("/{userId}/{courseCrn}")
    public CourseUser getCourseUserDetails(@PathVariable String userId, @PathVariable String courseCrn) {
        return courseUserService.getCourseUser(userId, courseCrn);
    }

    @GetMapping
    public List<CourseUser> getAllCourseUserDetails() {
        return courseUserService.getAllCourseUsers();
    }

    @PutMapping
    public CourseUser updateCourseUserDetails(@RequestBody CourseUser courseUser) {
        return courseUserService.updateCourseUser(courseUser);
    }

    @DeleteMapping("/{userId}/{courseCrn}")
    public void deleteCourseUserDetails(@PathVariable String userId, @PathVariable String courseCrn) {
        courseUserService.deleteCourseUser(userId, courseCrn);
    }

    @GetMapping("/roster/{crn}")
    public List<User> getRosterByCourse(@PathVariable String crn) {
        return courseUserService.getUsersByCourse(crn);
    }

    @PostMapping("/enroll/{code}/{cwid}")
    public CourseUser enrollStudentByCode(@PathVariable String code, @PathVariable String cwid) {
        return courseUserService.enrollByCode(code, cwid);
    }
}