package com.womm.backend.course;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


@Entity
@Table(name = "courses")
public class Course {

    @Id
    @Column(name = "crn", length = 5)
    private String crn;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    //TODO: add timestamp logic


    // ----- Constructors -----
    public Course() {}

    public Course(String crn, String courseName) {
        this.crn = crn;
        this.courseName = courseName;
    }


    // ----- Getters and Setters -----
    public String getCrn() {
        return crn;
    }
    public void setCrn(String crn) {
        this.crn = crn;
    }

    public String getCourseName() {
        return courseName;
    }
    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

}
