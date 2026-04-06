package com.womm.backend.dto;

import java.util.List;

public class PreviewRunRequest {
    private String fileName;
    private String fileContent;
    private List<CustomTestCaseRequest> testCases;
    private String inputFileName;
    private String inputFileContentBase64;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }

    public List<CustomTestCaseRequest> getTestCases() { return testCases; }
    public void setTestCases(List<CustomTestCaseRequest> testCases) { this.testCases = testCases; }

    public String getInputFileName() { return inputFileName; }
    public void setInputFileName(String inputFileName) { this.inputFileName = inputFileName; }

    public String getInputFileContentBase64() { return inputFileContentBase64; }
    public void setInputFileContentBase64(String inputFileContentBase64) { this.inputFileContentBase64 = inputFileContentBase64; }
}
