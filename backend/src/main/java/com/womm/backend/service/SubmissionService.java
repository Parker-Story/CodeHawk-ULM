package com.womm.backend.service;
import com.womm.backend.entity.Submission;
import java.util.List;

public interface SubmissionService {
    Submission createSubmission(Submission submission);
    Submission getSubmission(String userId, Long assignmentId);
    List<Submission> getAllSubmissions();
    Submission updateSubmission(Submission submission);
    void deleteSubmission(String userId, Long assignmentId);
    Submission submitAssignment(Long assignmentId, String userId, Submission submission);
    List<Submission> getSubmissionsByAssignment(Long assignmentId);
    Submission scoreSubmission(Long assignmentId, String userId, Integer score);
}