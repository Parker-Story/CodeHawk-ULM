package com.womm.backend.id;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SubmissionId implements Serializable {
    private String userId;
    private Long assignmentId;

    public SubmissionId() {}
    public SubmissionId(String userId, Long assignmentId) {
        this.userId = userId;
        this.assignmentId = assignmentId;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        SubmissionId that = (SubmissionId) o;
        return Objects.equals(userId, that.userId) && Objects.equals(assignmentId, that.assignmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, assignmentId);
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
}