package com.womm.backend.dto;

import java.util.List;

public class CustomTestRunRequest {
    private String inputFileName;
    private String inputFileContentBase64;

    private List<CustomTestCaseRequest> testCases;

    public String getInputFileName() { return inputFileName; }
    public void setInputFileName(String inputFileName) { this.inputFileName = inputFileName; }

    public String getInputFileContentBase64() { return inputFileContentBase64; }
    public void setInputFileContentBase64(String inputFileContentBase64) { this.inputFileContentBase64 = inputFileContentBase64; }

    public List<CustomTestCaseRequest> getTestCases() { return testCases; }
    public void setTestCases(List<CustomTestCaseRequest> testCases) { this.testCases = testCases; }
}

