package com.womm.backend.service;

import com.womm.backend.dto.CustomTestCaseRequest;
import com.womm.backend.dto.CustomTestRunRequest;
import com.womm.backend.dto.CustomTestRunResult;
import com.womm.backend.dto.PreviewRunRequest;
import com.womm.backend.entity.*;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class TestCaseServiceImpl implements TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final TestResultRepository testResultRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final CodeExecutionService codeExecutionService;
    private final AssignmentRubricRepository assignmentRubricRepository;

    public TestCaseServiceImpl(
            TestCaseRepository testCaseRepository,
            TestResultRepository testResultRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            SubmissionFileRepository submissionFileRepository,
            CodeExecutionService codeExecutionService,
            AssignmentRubricRepository assignmentRubricRepository) {
        this.testCaseRepository = testCaseRepository;
        this.testResultRepository = testResultRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.submissionFileRepository = submissionFileRepository;
        this.codeExecutionService = codeExecutionService;
        this.assignmentRubricRepository = assignmentRubricRepository;
    }

    /** Returns all submission files as [fileName, fileContent] pairs for multi-file execution. */
    private List<String[]> getAdditionalFiles(String userId, Long assignmentId, String primaryFileName) {
        List<SubmissionFile> allFiles = submissionFileRepository
                .findByUserIdAndAssignmentIdOrderByFileOrder(userId, assignmentId);
        return allFiles.stream()
                .filter(f -> !f.getFileName().equals(primaryFileName))
                .map(f -> new String[]{f.getFileName(), f.getFileContent()})
                .collect(Collectors.toList());
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

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        List<TestCase> testCases = testCaseRepository.findByAssignmentId(assignmentId);
        if (testCases.isEmpty()) return new ArrayList<>();

        testResultRepository.deleteBySubmission(assignmentId, userId);

        boolean isFileMode = "FILE".equals(assignment.getInputMode());
        String inputFileBase64 = isFileMode ? assignment.getInputFileContent() : null;
        String inputFileName = isFileMode ? assignment.getInputFileName() : null;
        List<String[]> additionalFiles = getAdditionalFiles(userId, assignmentId, submission.getFileName());

        // Execute code in parallel (CPU-bound, no JPA), then save results on this thread
        List<CodeExecutionService.ExecutionResult> execResults = testCases.parallelStream()
                .map(testCase -> codeExecutionService.execute(
                        submission.getFileContent(),
                        submission.getFileName(),
                        isFileMode ? null : testCase.getInput(),
                        inputFileBase64,
                        inputFileName,
                        additionalFiles
                ))
                .collect(java.util.stream.Collectors.toList());

        List<TestResult> results = new ArrayList<>();
        for (int i = 0; i < testCases.size(); i++) {
            TestCase testCase = testCases.get(i);
            CodeExecutionService.ExecutionResult execResult = execResults.get(i);

            TestResult result = new TestResult();
            result.setSubmission(submission);
            result.setTestCase(testCase);
            String output = execResult.stdout;
            if (output.isEmpty() && !execResult.stderr.isEmpty()) {
                output = execResult.stderr;
            }
            result.setActualOutput(output);

            boolean passed = execResult.exitCode == 0 &&
                    execResult.stdout.trim().replace("\r\n", "\n").replace("\r", "\n")
                            .equals(testCase.getExpectedOutput().trim().replace("\r\n", "\n").replace("\r", "\n"));
            result.setPassed(passed);

            results.add(testResultRepository.save(result));
        }

        // Only update submission.score from the test pass rate when there is no rubric.
        // When a rubric is attached, the rubric calculation is the source of truth for scoring.
        boolean hasRubric = assignmentRubricRepository.findByAssignmentId(assignmentId).isPresent();
        if (!hasRubric) {
            long passed = results.stream().filter(TestResult::isPassed).count();
            int score = testCases.isEmpty() ? 0 : (int) Math.round((double) passed / testCases.size() * 100);
            submission.setScore(score);
            submissionRepository.save(submission);
        }

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

    @Override
    public List<CustomTestRunResult> runCustomTestsForSubmission(
            Long assignmentId,
            String userId,
            CustomTestRunRequest request
    ) {
        if (request == null || request.getTestCases() == null) return new ArrayList<>();

        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        boolean isFileMode = "FILE".equals(assignment.getInputMode());

        String inputFileBase64 = isFileMode ? request.getInputFileContentBase64() : null;
        String inputFileName = isFileMode ? request.getInputFileName() : null;
        if (isFileMode) {
            if (inputFileBase64 == null || inputFileBase64.isEmpty()) inputFileBase64 = assignment.getInputFileContent();
            if (inputFileName == null || inputFileName.isEmpty()) inputFileName = assignment.getInputFileName();
        }

        final String finalInputFileBase64 = inputFileBase64;
        final String finalInputFileName = inputFileName;
        final List<String[]> additionalFiles = getAdditionalFiles(userId, assignmentId, submission.getFileName());

        return request.getTestCases().stream().map(tc -> {
            String input = isFileMode ? null : tc.getInput();

            CodeExecutionService.ExecutionResult execResult = codeExecutionService.execute(
                    submission.getFileContent(),
                    submission.getFileName(),
                    input,
                    finalInputFileBase64,
                    finalInputFileName,
                    additionalFiles
            );

            String expected = tc.getExpectedOutput() == null ? "" : tc.getExpectedOutput();
            String actual = execResult.stdout == null ? "" : execResult.stdout;

            boolean passed = execResult.exitCode == 0 &&
                    actual.trim().replace("\r\n", "\n").replace("\r", "\n")
                            .equals(expected.trim().replace("\r\n", "\n").replace("\r", "\n"));

            CustomTestRunResult result = new CustomTestRunResult();
            result.setLabel(tc.getLabel());
            result.setPassed(passed);
            result.setExpectedOutput(expected);
            result.setActualOutput(actual);
            return result;
        }).collect(Collectors.toList());
    }

    @Override
    public List<CustomTestRunResult> runPreviewTests(Long assignmentId, PreviewRunRequest request) {
        if (request == null || request.getFiles() == null || request.getFiles().isEmpty()) return new ArrayList<>();

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        boolean isFileMode = "FILE".equals(assignment.getInputMode());

        // Determine test cases: use provided ones, or fall back to visible professor tests
        List<CustomTestCaseRequest> casesToRun;
        if (request.getTestCases() != null && !request.getTestCases().isEmpty()) {
            casesToRun = request.getTestCases();
        } else {
            casesToRun = testCaseRepository.findVisibleByAssignmentId(assignmentId)
                    .stream()
                    .map(tc -> {
                        CustomTestCaseRequest req = new CustomTestCaseRequest();
                        req.setLabel(tc.getLabel() != null ? tc.getLabel() : "Test Case " + tc.getId());
                        req.setInput(tc.getInput());
                        req.setExpectedOutput(tc.getExpectedOutput());
                        return req;
                    })
                    .collect(Collectors.toList());
        }

        if (casesToRun.isEmpty()) return new ArrayList<>();

        // First file is the entry point; remaining files are additional
        PreviewRunRequest.FileEntry primaryFile = request.getFiles().get(0);
        List<String[]> additionalFiles = IntStream.range(1, request.getFiles().size())
                .mapToObj(i -> new String[]{
                        request.getFiles().get(i).getFileName(),
                        request.getFiles().get(i).getFileContent()
                })
                .collect(Collectors.toList());

        String inputFileBase64 = isFileMode
                ? (request.getInputFileContentBase64() != null ? request.getInputFileContentBase64() : assignment.getInputFileContent())
                : null;
        String inputFileName = isFileMode
                ? (request.getInputFileName() != null ? request.getInputFileName() : assignment.getInputFileName())
                : null;

        final String finalInputFileBase64 = inputFileBase64;
        final String finalInputFileName = inputFileName;

        return casesToRun.stream().map(tc -> {
            String input = isFileMode ? null : tc.getInput();
            CodeExecutionService.ExecutionResult execResult = codeExecutionService.execute(
                    primaryFile.getFileContent(),
                    primaryFile.getFileName(),
                    input,
                    finalInputFileBase64,
                    finalInputFileName,
                    additionalFiles
            );

            String expected = tc.getExpectedOutput() == null ? "" : tc.getExpectedOutput();
            String actual = execResult.stdout == null ? "" : execResult.stdout;
            boolean passed = execResult.exitCode == 0 &&
                    actual.trim().replace("\r\n", "\n").replace("\r", "\n")
                            .equals(expected.trim().replace("\r\n", "\n").replace("\r", "\n"));

            CustomTestRunResult result = new CustomTestRunResult();
            result.setLabel(tc.getLabel());
            result.setPassed(passed);
            result.setExpectedOutput(expected);
            result.setActualOutput(actual);
            return result;
        }).collect(Collectors.toList());
    }
}