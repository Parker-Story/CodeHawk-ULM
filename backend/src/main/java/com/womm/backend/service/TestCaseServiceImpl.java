package com.womm.backend.service;

import com.womm.backend.entity.*;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class TestCaseServiceImpl implements TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final TestResultRepository testResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CodeExecutionService codeExecutionService;

    public TestCaseServiceImpl(
            TestCaseRepository testCaseRepository,
            TestResultRepository testResultRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            CodeExecutionService codeExecutionService) {
        this.testCaseRepository = testCaseRepository;
        this.testResultRepository = testResultRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.codeExecutionService = codeExecutionService;
    }

    @Override
    public TestCase createTestCase(TestCase testCase, Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        testCase.setAssignment(assignment);
        return testCaseRepository.save(testCase);
    }

    @Override
    public List<TestCase> getTestCasesByAssignment(Long assignmentId) {
        return testCaseRepository.findByAssignmentId(assignmentId);
    }

    @Override
    public List<TestCase> getVisibleTestCasesByAssignment(Long assignmentId) {
        return testCaseRepository.findVisibleByAssignmentId(assignmentId);
    }

    @Override
    public void deleteTestCase(Long id) {
        testCaseRepository.deleteById(id);
    }

    @Override
    public List<TestResult> runTestsForSubmission(Long assignmentId, String userId) {
        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<TestCase> testCases = testCaseRepository.findByAssignmentId(assignmentId);
        if (testCases.isEmpty()) return new ArrayList<>();

        // Delete old results first
        testResultRepository.deleteBySubmission(assignmentId, userId);

        List<TestResult> results = new ArrayList<>();
        for (TestCase testCase : testCases) {
            CodeExecutionService.ExecutionResult execResult = codeExecutionService.execute(
                    submission.getFileContent(),
                    submission.getFileName(),
                    testCase.getInput()
            );

            TestResult result = new TestResult();
            result.setSubmission(submission);
            result.setTestCase(testCase);
            result.setActualOutput(execResult.stdout);

            boolean passed = execResult.exitCode == 0 &&
                    execResult.stdout.trim().equals(testCase.getExpectedOutput().trim());
            result.setPassed(passed);

            results.add(testResultRepository.save(result));
        }

        // Auto-score based on passed test cases
        long passed = results.stream().filter(TestResult::isPassed).count();
        int score = testCases.isEmpty() ? 0 : (int) Math.round((double) passed / testCases.size() * 100);
        submission.setScore(score);
        submissionRepository.save(submission);

        return results;
    }

    @Override
    public List<TestResult> getTestResultsForSubmission(Long assignmentId, String userId) {
        return testResultRepository.findBySubmission(assignmentId, userId);
    }

    @Override
    public List<TestResult> getTestResultsForAssignment(Long assignmentId) {
        return testResultRepository.findByAssignmentId(assignmentId);
    }
}