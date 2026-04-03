package com.womm.backend.service;
import com.womm.backend.entity.Assignment;
import com.womm.backend.entity.Submission;
import com.womm.backend.entity.User;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.dto.SubmissionCodeUpdateRequest;
import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.SubmissionRepository;
import com.womm.backend.repository.TestCaseRepository;
import com.womm.backend.repository.TestResultRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import com.womm.backend.repository.RubricScoreRepository;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    SubmissionRepository submissionRepository;
    UserRepository userRepository;
    AssignmentRepository assignmentRepository;
    TestCaseRepository testCaseRepository;
    TestResultRepository testResultRepository;
    TestCaseService testCaseService;
    RubricService rubricService;
    RubricScoreRepository rubricScoreRepository;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            TestCaseRepository testCaseRepository,
            TestResultRepository testResultRepository,
            RubricScoreRepository rubricScoreRepository,
            @Lazy TestCaseService testCaseService,
            @Lazy RubricService rubricService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.testResultRepository = testResultRepository;
        this.testCaseService = testCaseService;
        this.rubricService = rubricService;
        this.rubricScoreRepository = rubricScoreRepository;
    }

    @Override
    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    @Override
    public Submission getSubmission(String userId, Long assignmentId) {
        return submissionRepository.findById(new SubmissionId(userId, assignmentId)).orElse(null);
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
    @Transactional
    public void deleteSubmission(String userId, Long assignmentId) {
        rubricScoreRepository.deleteBySubmission(assignmentId, userId);
        testResultRepository.deleteBySubmission(assignmentId, userId);
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

        if (!testCaseRepository.findByAssignmentId(assignmentId).isEmpty()) {
            testCaseService.runTestsForSubmission(assignmentId, userId);
            rubricService.autoGradeSubmission(assignmentId, userId);
        }

        return saved;
    }

    @Override
    public Submission saveSubmissionCode(Long assignmentId, String userId, SubmissionCodeUpdateRequest request) {
        if (request == null) throw new RuntimeException("Request body is required");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseGet(() -> {
                    Submission s = new Submission();
                    s.setSubmissionId(new SubmissionId(userId, assignmentId));
                    return s;
                });

        submission.setUser(user);
        submission.setAssignment(assignment);
        submission.setFileName(request.getFileName());
        submission.setFileContent(request.getFileContent());

        return submissionRepository.save(submission);
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

    @Override
    public Submission saveFeedback(Long assignmentId, String userId, String feedback) {
        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setFeedback(feedback);
        return submissionRepository.save(submission);
    }
}