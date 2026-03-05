package com.womm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "rubric_scores")
public class RubricScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "rubric_item_id", nullable = false)
    private RubricItem rubricItem;

    @JsonIgnore
    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "submission_assignment_id", referencedColumnName = "assignment_id"),
            @JoinColumn(name = "submission_user_id", referencedColumnName = "user_id")
    })
    private Submission submission;

    @Column(name = "awarded_points", nullable = false)
    private double awardedPoints = 0;

    public RubricScore() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RubricItem getRubricItem() { return rubricItem; }
    public void setRubricItem(RubricItem rubricItem) { this.rubricItem = rubricItem; }
    public Submission getSubmission() { return submission; }
    public void setSubmission(Submission submission) { this.submission = submission; }
    public double getAwardedPoints() { return awardedPoints; }
    public void setAwardedPoints(double awardedPoints) { this.awardedPoints = awardedPoints; }
}