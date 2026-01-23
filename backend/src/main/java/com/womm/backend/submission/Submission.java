package com.womm.backend.submission;

import com.womm.backend.assignment.Assignment;
import com.womm.backend.user.User;
import jakarta.persistence.*;

@Entity
@Table(name = "submissions")
public class Submission {

    @EmbeddedId
    private SubmissionId submissionId;

    @ManyToOne
    @MapsId("userCwid")
    @JoinColumn(name = "user_cwid")
    private User user;

    @ManyToOne
    @MapsId("assignmentId")
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;


    // ----- Constructors -----
    public Submission() {}

    public Submission(User user, Assignment assignment) {
        this.user = user;
        this.assignment = assignment;
        submissionId = new SubmissionId(user.getCwid(), assignment.getId());
    }


    // ----- Getters/Setters -----
    public SubmissionId getSubmissionId() {
        return submissionId;
    }
    public void setSubmissionId(SubmissionId submissionId) {
        this.submissionId = submissionId;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }

    public Assignment getAssignment() {
        return assignment;
    }
    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

}
