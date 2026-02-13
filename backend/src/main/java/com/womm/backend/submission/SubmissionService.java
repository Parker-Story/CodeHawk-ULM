package com.womm.backend.submission;

import java.util.List;

public interface SubmissionService {
    public Submission createSubmission(Submission submission);
    public Submission getSubmission(String userCwid, Long assignmentId);
    public List<Submission> getAllSubmissions();
    public Submission updateSubmission(Submission submission);
    public void deleteSubmission(String userCwid, Long assignmentId);
}
