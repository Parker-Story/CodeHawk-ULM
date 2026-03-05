package com.womm.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "assignment_rubric_item_test_cases")
public class AssignmentRubricItemTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "rubric_item_id", nullable = false)
    private RubricItem rubricItem;

    @ManyToOne
    @JoinColumn(name = "test_case_id", nullable = false)
    private TestCase testCase;

    public AssignmentRubricItemTestCase() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public RubricItem getRubricItem() { return rubricItem; }
    public void setRubricItem(RubricItem rubricItem) { this.rubricItem = rubricItem; }
    public TestCase getTestCase() { return testCase; }
    public void setTestCase(TestCase testCase) { this.testCase = testCase; }
}