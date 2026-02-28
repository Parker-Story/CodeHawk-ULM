package com.womm.backend.entity;

import com.womm.backend.id.SubmissionId;
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

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_content", columnDefinition = "LONGTEXT")
    private String fileContent; // Base64 encoded file content


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

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }

}
