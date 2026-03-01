package com.womm.backend.entity;
import com.womm.backend.id.CourseUserId;
import jakarta.persistence.*;

@Entity
@Table(name = "course_users")
public class CourseUser {
    @EmbeddedId
    private CourseUserId courseUserId;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
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
        courseUserId = new CourseUserId(user.getId(), course.getCrn());
    }

    // ----- Getters/Setters ------
    public CourseUserId getCourseUserId() { return courseUserId; }
    public void setCourseUserId(CourseUserId courseUserId) { this.courseUserId = courseUserId; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}