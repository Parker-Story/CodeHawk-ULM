package com.womm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "submission_files")
public class SubmissionFile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_content", columnDefinition = "LONGTEXT")
    private String fileContent;

    @Column(name = "file_order")
    private Integer fileOrder;

    @Column(name = "ai_probability")
    private Double aiProbability;

    @Column(name = "ai_percentage")
    private Double aiPercentage;

    @Column(name = "ai_label")
    private String aiLabel;

    @Column(name = "ai_confidence")
    private String aiConfidence;

    public SubmissionFile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }
    public Integer getFileOrder() { return fileOrder; }
    public void setFileOrder(Integer fileOrder) { this.fileOrder = fileOrder; }
    public Double getAiProbability() {
        return aiProbability;
    }
    public void setAiProbability(Double aiProbability) {
        this.aiProbability = aiProbability;
    }
    public Double getAiPercentage() {
        return aiPercentage;
    }
    public void setAiPercentage(Double aiPercentage) {
        this.aiPercentage = aiPercentage;
    }
    public String getAiLabel() {
        return aiLabel;
    }
    public void setAiLabel(String aiLabel) {
        this.aiLabel = aiLabel;
    }
    public String getAiConfidence() {
        return aiConfidence;
    }
    public void setAiConfidence(String aiConfidence) {
        this.aiConfidence = aiConfidence;
    }
}
