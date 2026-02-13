package com.womm.backend.courseUser;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CourseUserId implements Serializable {

    private String userCwid;
    private String courseCrn;


    // ----- Constructors -----
    public CourseUserId() {}

    public CourseUserId(String userCwid, String courseCrn) {
        this.userCwid = userCwid;
        this.courseCrn = courseCrn;
    }


    // ----- Equals/Hash -----
    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        CourseUserId that = (CourseUserId) o;
        return Objects.equals(userCwid, that.userCwid) && Objects.equals(courseCrn, that.courseCrn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userCwid, courseCrn);
    }


    // ----- Getters/Setters -----
    public String getUserCwid() {
        return userCwid;
    }
    public void setUserCwid(String userCwid) {
        this.userCwid = userCwid;
    }

    public String getCourseCrn() {
        return courseCrn;
    }
    public void setCourseCrn(String courseCrn) {
        this.courseCrn = courseCrn;
    }

}
