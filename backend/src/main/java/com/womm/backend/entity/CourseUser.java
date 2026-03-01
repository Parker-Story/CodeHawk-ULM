package com.womm.backend.entity;
import com.womm.backend.enums.CourseRole;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "course_role", nullable = false)
    private CourseRole courseRole;

    // ----- Constructors -----
    public CourseUser() {}

    public CourseUser(User user, Course course, CourseRole courseRole) {
        this.user = user;
        this.course = course;
        this.courseRole = courseRole;
        courseUserId = new CourseUserId(user.getId(), course.getCrn());
    }

    // ----- Getters/Setters ------
    public CourseUserId getCourseUserId() { return courseUserId; }
    public void setCourseUserId(CourseUserId courseUserId) { this.courseUserId = courseUserId; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public CourseRole getCourseRole() { return courseRole; }
    public void setCourseRole(CourseRole courseRole) { this.courseRole = courseRole; }
}