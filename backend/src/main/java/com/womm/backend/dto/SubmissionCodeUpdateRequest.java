package com.womm.backend.dto;

public class SubmissionCodeUpdateRequest {
    private String fileName;
    private String fileContent;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }
}

