package com.codehawk.dto;

import java.util.ArrayList;
import java.util.List;

public class GradeResult {
    private String submissionId;
    private String assignmentId;
    private String userId;
    private double score;
    private double maxScore;
    private double latePenaltyPercent;
    private double finalScore;
    private boolean passed;
    private List<TestCaseResult> testResults = new ArrayList<>();
    private String errorMessage;

    public String getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(String submissionId) {
        this.submissionId = submissionId;
    }

    public String getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(String assignmentId) {
        this.assignmentId = assignmentId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(double maxScore) {
        this.maxScore = maxScore;
    }

    public double getLatePenaltyPercent() {
        return latePenaltyPercent;
    }

    public void setLatePenaltyPercent(double latePenaltyPercent) {
        this.latePenaltyPercent = latePenaltyPercent;
    }

    public double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(double finalScore) {
        this.finalScore = finalScore;
    }

    public boolean isPassed() {
        return passed;
    }

    public void setPassed(boolean passed) {
        this.passed = passed;
    }

    public List<TestCaseResult> getTestResults() {
        return testResults;
    }

    public void setTestResults(List<TestCaseResult> testResults) {
        this.testResults = testResults != null ? testResults : new ArrayList<>();
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public static class TestCaseResult {
        private String testCaseId;
        private String label;
        private boolean passed;
        private double pointsAwarded;
        private String expectedOutput;
        private String actualOutput;

        public String getTestCaseId() {
            return testCaseId;
        }

        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public void setTestCaseId(String testCaseId) {
            this.testCaseId = testCaseId;
        }

        public boolean isPassed() {
            return passed;
        }

        public void setPassed(boolean passed) {
            this.passed = passed;
        }

        public double getPointsAwarded() {
            return pointsAwarded;
        }

        public void setPointsAwarded(double pointsAwarded) {
            this.pointsAwarded = pointsAwarded;
        }

        public String getExpectedOutput() {
            return expectedOutput;
        }

        public void setExpectedOutput(String expectedOutput) {
            this.expectedOutput = expectedOutput;
        }

        public String getActualOutput() {
            return actualOutput;
        }

        public void setActualOutput(String actualOutput) {
            this.actualOutput = actualOutput;
        }
    }
}
