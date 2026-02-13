package com.womm.backend.course;

import com.womm.backend.assignment.Assignment;
import com.womm.backend.courseUser.CourseUser;
import jakarta.persistence.*;
import java.util.List;


@Entity
@Table(name = "courses")
public class Course {

    @Id
    @Column(name = "crn", length = 5)
    private String crn;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    //TODO: add timestamp logic


    @OneToMany(mappedBy = "course")
    private List<CourseUser> users;

    @OneToMany(mappedBy = "course")
    private List<Assignment> assignments;


    // ----- Constructors -----
    public Course() {}

    public Course(String crn, String courseName) {
        this.crn = crn;
        this.courseName = courseName;
    }


    // ----- Getters/Setters -----
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
