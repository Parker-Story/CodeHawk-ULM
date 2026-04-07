package com.womm.backend.service;
import com.womm.backend.entity.Submission;
import com.womm.backend.entity.SubmissionFile;
import com.womm.backend.dto.SubmissionCodeUpdateRequest;
import com.womm.backend.dto.MultiFileSubmissionRequest;
import java.util.List;

public interface SubmissionService {
    Submission createSubmission(Submission submission);
    Submission getSubmission(String userId, Long assignmentId);
    List<Submission> getAllSubmissions();
    Submission updateSubmission(Submission submission);
    void deleteSubmission(String userId, Long assignmentId);
    Submission submitAssignment(Long assignmentId, String userId, Submission submission);
    Submission submitFiles(Long assignmentId, String userId, MultiFileSubmissionRequest request);
    List<SubmissionFile> getSubmissionFiles(Long assignmentId, String userId);
    Submission saveSubmissionCode(Long assignmentId, String userId, SubmissionCodeUpdateRequest request);
    List<Submission> getSubmissionsByAssignment(Long assignmentId);
    Submission scoreSubmission(Long assignmentId, String userId, Integer score);
    Submission saveFeedback(Long assignmentId, String userId, String feedback);
}