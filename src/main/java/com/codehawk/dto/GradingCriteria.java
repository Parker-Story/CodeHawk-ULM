package com.codehawk.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

// assignment criteria from db - test cases + due date + late penalty
public class GradingCriteria {
    private String assignmentId;
    private Instant dueAt;
    private List<TestCase> testCases = new ArrayList<>();
    private LatePenaltyRule latePenaltyRule;

    public String getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(String assignmentId) {
        this.assignmentId = assignmentId;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public void setDueAt(Instant dueAt) {
        this.dueAt = dueAt;
    }

    public List<TestCase> getTestCases() {
        return testCases;
    }

    public void setTestCases(List<TestCase> testCases) {
        this.testCases = testCases != null ? testCases : new ArrayList<>();
    }

    public LatePenaltyRule getLatePenaltyRule() {
        return latePenaltyRule;
    }

    public void setLatePenaltyRule(LatePenaltyRule latePenaltyRule) {
        this.latePenaltyRule = latePenaltyRule;
    }

    public double getMaxPoints() {
        return testCases.stream().mapToDouble(TestCase::getPoints).sum();
    }
}
