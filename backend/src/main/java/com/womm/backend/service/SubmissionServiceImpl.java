package com.womm.backend.service;
import com.womm.backend.dto.DetectionResponse;
import com.womm.backend.entity.Assignment;
import com.womm.backend.entity.Submission;
import com.womm.backend.entity.SubmissionFile;
import com.womm.backend.entity.User;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.dto.SubmissionCodeUpdateRequest;
import com.womm.backend.dto.MultiFileSubmissionRequest;
import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.SubmissionRepository;
import com.womm.backend.repository.SubmissionFileRepository;
import com.womm.backend.repository.TestCaseRepository;
import com.womm.backend.repository.TestResultRepository;
import com.womm.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import com.womm.backend.repository.RubricScoreRepository;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    private static final Logger log = LoggerFactory.getLogger(SubmissionServiceImpl.class);
    SubmissionRepository submissionRepository;
    SubmissionFileRepository submissionFileRepository;
    UserRepository userRepository;
    AssignmentRepository assignmentRepository;
    TestCaseRepository testCaseRepository;
    TestResultRepository testResultRepository;
    TestCaseService testCaseService;
    RubricService rubricService;
    RubricScoreRepository rubricScoreRepository;
    AiDetectionService aiDetectionService;

    public SubmissionServiceImpl(
            SubmissionRepository submissionRepository,
            SubmissionFileRepository submissionFileRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            TestCaseRepository testCaseRepository,
            TestResultRepository testResultRepository,
            RubricScoreRepository rubricScoreRepository,
            @Lazy TestCaseService testCaseService,
            @Lazy RubricService rubricService,
            AiDetectionService aiDetectionService) {
        this.submissionRepository = submissionRepository;
        this.submissionFileRepository = submissionFileRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.testResultRepository = testResultRepository;
        this.testCaseService = testCaseService;
        this.rubricService = rubricService;
        this.rubricScoreRepository = rubricScoreRepository;
        this.aiDetectionService = aiDetectionService;
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
        submissionFileRepository.deleteByUserIdAndAssignmentId(userId, assignmentId);
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

        try {
            DetectionResponse aiResult = aiDetectionService.detectAI(submission.getFileContent());

            submission.setAiProbability(aiResult.getAi_probability());
            submission.setAiPercentage(aiResult.getAi_percentage());
            submission.setAiLabel(aiResult.getLabel());
            submission.setAiConfidence(aiResult.getConfidence());

        } catch (Exception e) {
            log.error("[AI Detection] submitAssignment fallback triggered: {}", e.getMessage());
            submission.setAiProbability(0.0);
            submission.setAiPercentage(0.0);
            submission.setAiLabel("Unavailable");
            submission.setAiConfidence("Low");
        }

        submission.setSubmittedAt(LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);

        if (!testCaseRepository.findByAssignmentId(assignmentId).isEmpty()) {
            testCaseService.runTestsForSubmission(assignmentId, userId);
            rubricService.autoGradeSubmission(assignmentId, userId);
        }

        return saved;
    }

    @Override
    @Transactional
    public Submission submitFiles(Long assignmentId, String userId, MultiFileSubmissionRequest request) {
        if (request == null || request.getFiles() == null || request.getFiles().isEmpty())
            throw new RuntimeException("At least one file is required");
        if (request.getFiles().size() > 10)
            throw new RuntimeException("Maximum of 10 files allowed");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        List<MultiFileSubmissionRequest.FileEntry> files = request.getFiles();

        // Save Submission record first (submission_files FK requires it to exist)
        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseGet(() -> {
                    Submission s = new Submission();
                    s.setSubmissionId(new SubmissionId(userId, assignmentId));
                    return s;
                });
        submission.setUser(user);
        submission.setAssignment(assignment);
        submission.setFileName(files.get(0).getFileName());
        submission.setFileContent(files.get(0).getFileContent());
        submission.setSubmittedAt(LocalDateTime.now());

        // AI Detection
        try {
            DetectionResponse aiResult = aiDetectionService.detectAI(submission.getFileContent());

            submission.setAiProbability(aiResult.getAi_probability());
            submission.setAiPercentage(aiResult.getAi_percentage());
            submission.setAiLabel(aiResult.getLabel());
            submission.setAiConfidence(aiResult.getConfidence());

        } catch (Exception e) {
            log.error("[AI Detection] submitFiles fallback triggered: {}", e.getMessage());
            submission.setAiProbability(0.0);
            submission.setAiPercentage(0.0);
            submission.setAiLabel("Unavailable");
            submission.setAiConfidence("Low");
        }

        // saveAndFlush ensures the submission row is committed to DB immediately
        // so the FK on submission_files is satisfied before we insert child rows.
        Submission saved = submissionRepository.saveAndFlush(submission);

        // Replace submission files now that the parent row exists
        submissionFileRepository.deleteByUserIdAndAssignmentId(userId, assignmentId);
        for (int i = 0; i < files.size(); i++) {
            SubmissionFile sf = new SubmissionFile();
            sf.setUserId(userId);
            sf.setAssignmentId(assignmentId);
            sf.setFileName(files.get(i).getFileName());
            sf.setFileContent(files.get(i).getFileContent());
            sf.setFileOrder(i);
            submissionFileRepository.save(sf);
        }

        if (!testCaseRepository.findByAssignmentId(assignmentId).isEmpty()) {
            testCaseService.runTestsForSubmission(assignmentId, userId);
            rubricService.autoGradeSubmission(assignmentId, userId);
        }

        return saved;
    }

    @Override
    public List<SubmissionFile> getSubmissionFiles(Long assignmentId, String userId) {
        return submissionFileRepository.findByUserIdAndAssignmentIdOrderByFileOrder(userId, assignmentId);
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