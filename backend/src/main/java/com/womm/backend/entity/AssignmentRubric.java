package com.womm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assignment_rubrics")
public class AssignmentRubric {

    @Id
    @Column(name = "assignment_id")
    private Long assignmentId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "rubric_id", nullable = false)
    private Rubric rubric;

    public AssignmentRubric() {}

    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public Rubric getRubric() { return rubric; }
    public void setRubric(Rubric rubric) { this.rubric = rubric; }
}