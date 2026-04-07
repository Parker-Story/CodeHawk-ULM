package com.womm.backend.dto;

import java.util.List;

public class MultiFileSubmissionRequest {
    private List<FileEntry> files;

    public List<FileEntry> getFiles() { return files; }
    public void setFiles(List<FileEntry> files) { this.files = files; }

    public static class FileEntry {
        private String fileName;
        private String fileContent;

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getFileContent() { return fileContent; }
        public void setFileContent(String fileContent) { this.fileContent = fileContent; }
    }
}
