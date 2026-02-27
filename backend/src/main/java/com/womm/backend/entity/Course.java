package com.womm.backend.entity;

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

    @Column(name = "course_abbreviation")
    private String courseAbbreviation;

    @Column(name = "course_description", columnDefinition = "TEXT")
    private String courseDescription;

    @Column(name = "semester")
    private String semester;

    @Column(name = "year")
    private String year;

    @Column(name = "days")
    private String days; // stored as comma-separated e.g. "mon,tue,wed"

    @Column(name = "start_time")
    private String startTime;

    @Column(name = "end_time")
    private String endTime;

    @Column(name = "code", unique = true)
    private String code;

    @Column(name = "archived")
    private boolean archived = false;

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
    public String getCrn() { return crn; }
    public void setCrn(String crn) { this.crn = crn; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseAbbreviation() { return courseAbbreviation; }
    public void setCourseAbbreviation(String courseAbbreviation) { this.courseAbbreviation = courseAbbreviation; }

    public String getCourseDescription() { return courseDescription; }
    public void setCourseDescription(String courseDescription) { this.courseDescription = courseDescription; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getDays() { return days; }
    public void setDays(String days) { this.days = days; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
}