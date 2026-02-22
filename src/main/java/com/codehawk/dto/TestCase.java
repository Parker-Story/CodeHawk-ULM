package com.codehawk.dto;

// one test: input + expected output (or urls to fetch them)
public class TestCase {
    private String id;
    private String label;
    private String input;
    private String expectedOutput;
    private String inputFileUrl;
    private String expectedOutputFileUrl;
    private double points;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public double getPoints() {
        return points;
    }

    public void setPoints(double points) {
        this.points = points;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getInputFileUrl() {
        return inputFileUrl;
    }

    public void setInputFileUrl(String inputFileUrl) {
        this.inputFileUrl = inputFileUrl;
    }

    public String getExpectedOutputFileUrl() {
        return expectedOutputFileUrl;
    }

    public void setExpectedOutputFileUrl(String expectedOutputFileUrl) {
        this.expectedOutputFileUrl = expectedOutputFileUrl;
    }
}
