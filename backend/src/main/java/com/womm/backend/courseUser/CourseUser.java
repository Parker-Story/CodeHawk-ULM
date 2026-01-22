package com.womm.backend.courseUser;

import com.womm.backend.course.Course;
import com.womm.backend.user.User;

import jakarta.persistence.*;
//TODO: does not work :( idk
@Entity
@Table(name = "course_users")
public class CourseUser {

    @EmbeddedId
    private CourseUserId courseUserId;

    @ManyToOne
    @MapsId("userCwid")
    @JoinColumn(name = "user_cwid")
    private User user;

    @ManyToOne
    @MapsId("courseCrn")
    @JoinColumn(name = "course_crn")
    private Course course;


    // ----- Constructors -----
    public CourseUser() {}

    public CourseUser(User user, Course course) {
        this.user = user;
        this.course = course;
        courseUserId = new CourseUserId(user.getCwid(), course.getCrn());
    }

    // ----- Getters/Setters ------
    public CourseUserId getCourseUserId() {
        return courseUserId;
    }

    public Course getCourse() {
        return course;
    }
    public void setCourse(Course course) {
        this.course = course;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
}
