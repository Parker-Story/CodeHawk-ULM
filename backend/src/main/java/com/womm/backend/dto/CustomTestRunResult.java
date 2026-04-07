package com.womm.backend.dto;

public class CustomTestRunResult {
    private String label;
    private boolean passed;
    private String expectedOutput;
    private String actualOutput;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public String getActualOutput() { return actualOutput; }
    public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }
}

