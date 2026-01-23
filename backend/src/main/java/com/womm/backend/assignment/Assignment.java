package com.womm.backend.assignment;

import com.womm.backend.course.Course;
import jakarta.persistence.*;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_crn", nullable = false)
    private Course course;

    @Column(name = "title", nullable = false)
    private String title;

    //TODO: Description


    // ----- Constructors -----
    public Assignment() {}

    public Assignment(Course course, String title) {
        this.course = course;
        this.title = title;
    }


    // ----- Getters/Setters -----
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }

    public Course getCourse() {
        return course;
    }
    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

}
