package com.womm.backend.service;
import com.womm.backend.entity.Assignment;
import com.womm.backend.entity.Submission;
import com.womm.backend.entity.User;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.SubmissionRepository;
import com.womm.backend.repository.TestCaseRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    SubmissionRepository submissionRepository;
    UserRepository userRepository;
    AssignmentRepository assignmentRepository;
    TestCaseRepository testCaseRepository;
    TestCaseService testCaseService;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            TestCaseRepository testCaseRepository,
            @Lazy TestCaseService testCaseService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.testCaseService = testCaseService;
    }

    @Override
    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    @Override
    public Submission getSubmission(String userId, Long assignmentId) {
        return submissionRepository.findById(new SubmissionId(userId, assignmentId)).get();
    }

    @Override
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @Override
    public Submission updateSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    @Override
    public void deleteSubmission(String userId, Long assignmentId) {
        submissionRepository.deleteById(new SubmissionId(userId, assignmentId));
    }

    @Override
    public Submission submitAssignment(Long assignmentId, String userId, Submission submission) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        submission.setUser(user);
        submission.setAssignment(assignment);
        submission.setSubmissionId(new SubmissionId(userId, assignmentId));
        Submission saved = submissionRepository.save(submission);

        // Auto-run tests if test cases exist for this assignment
        if (!testCaseRepository.findByAssignmentId(assignmentId).isEmpty()) {
            testCaseService.runTestsForSubmission(assignmentId, userId);
        }

        return saved;
    }

    @Override
    public List<Submission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    @Override
    public Submission scoreSubmission(Long assignmentId, String userId, Integer score) {
        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setScore(score);
        return submissionRepository.save(submission);
    }
}