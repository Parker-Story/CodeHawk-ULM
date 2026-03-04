package com.womm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "rubric_items")
public class RubricItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "criteria_id", nullable = false)
    private RubricCriteria criteria;

    @Column(nullable = false)
    private String label;

    @Column(name = "max_points", nullable = false)
    private double maxPoints = 0;

    @Column(name = "auto_grade", nullable = false)
    private boolean autoGrade = false;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @ManyToMany
    @JoinTable(
            name = "rubric_item_test_cases",
            joinColumns = @JoinColumn(name = "rubric_item_id"),
            inverseJoinColumns = @JoinColumn(name = "test_case_id")
    )
    private List<TestCase> testCases;

    public RubricItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public RubricCriteria getCriteria() { return criteria; }
    public void setCriteria(RubricCriteria criteria) { this.criteria = criteria; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public double getMaxPoints() { return maxPoints; }
    public void setMaxPoints(double maxPoints) { this.maxPoints = maxPoints; }
    public boolean isAutoGrade() { return autoGrade; }
    public void setAutoGrade(boolean autoGrade) { this.autoGrade = autoGrade; }
    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
    public List<TestCase> getTestCases() { return testCases; }
    public void setTestCases(List<TestCase> testCases) { this.testCases = testCases; }
}