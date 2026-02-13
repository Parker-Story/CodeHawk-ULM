package com.womm.backend.submission;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SubmissionId implements Serializable {

    private String userCwid;
    private Long assignmentId;


    // ----- Constructors -----
    public SubmissionId() {}

    public SubmissionId(String userCwid, Long assignmentId) {
        this.userCwid = userCwid;
        this.assignmentId = assignmentId;
    }


    // ----- Equals/Hash -----

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SubmissionId that = (SubmissionId) o;
        return Objects.equals(userCwid, that.userCwid) && Objects.equals(assignmentId, that.assignmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userCwid, assignmentId);
    }

    // ----- Getters/Setters -----
    public String getUserCwid() {
        return userCwid;
    }
    public void setUserCwid(String userCwid) {
        this.userCwid = userCwid;
    }

    public Long getAssignmentId() {
        return assignmentId;
    }
    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

}
