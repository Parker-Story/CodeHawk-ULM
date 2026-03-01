package com.womm.backend.id;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class CourseUserId implements Serializable {
    private String userId;
    private String courseCrn;

    public CourseUserId() {}
    public CourseUserId(String userId, String courseCrn) {
        this.userId = userId;
        this.courseCrn = courseCrn;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        CourseUserId that = (CourseUserId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(courseCrn, that.courseCrn);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, courseCrn);
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getCourseCrn() { return courseCrn; }
    public void setCourseCrn(String courseCrn) { this.courseCrn = courseCrn; }
}