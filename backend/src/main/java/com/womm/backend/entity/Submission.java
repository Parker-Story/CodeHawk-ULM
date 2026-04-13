package com.womm.backend.entity;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.womm.backend.id.SubmissionId;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
public class Submission {
    @EmbeddedId
    private SubmissionId submissionId;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("assignmentId")
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_content", columnDefinition = "LONGTEXT")
    private String fileContent;

    @Column(name = "score")
    private Integer score;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "ai_probability")
    private Double aiProbability;

    @Column(name = "ai_percentage")
    private Double aiPercentage;

    @Column(name = "ai_label")
    private String aiLabel;

    @Column(name = "ai_confidence")
    private String aiConfidence;
    @Column(name = "submitted_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime submittedAt;

    // ----- Constructors -----
    public Submission() {}
    public Submission(User user, Assignment assignment) {
        this.user = user;
        this.assignment = assignment;
    }

    // ----- Getters/Setters -----
    public SubmissionId getSubmissionId() { return submissionId; }
    public void setSubmissionId(SubmissionId submissionId) { this.submissionId = submissionId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    public Double getAiProbability() { return aiProbability; }
    public void setAiProbability(Double aiProbability) { this.aiProbability = aiProbability; }
    public Double getAiPercentage() { return aiPercentage; }
    public void setAiPercentage(Double aiPercentage) { this.aiPercentage = aiPercentage; }
    public String getAiLabel() { return aiLabel; }
    public void setAiLabel(String aiLabel) { this.aiLabel = aiLabel; }
    public String getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(String aiConfidence) { this.aiConfidence = aiConfidence; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}