package com.codehawk.service;

import com.codehawk.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GradingService {

    @Autowired
    private SubmissionService submissionService;

    @Autowired
    private AssignmentCriteriaService assignmentCriteriaService;

    @Autowired
    private PythonExecutionService pythonExecutionService;

    @Autowired
    private JavaExecutionService javaExecutionService;

    private final RestTemplate restTemplate = new RestTemplate();

    public GradeResult gradeSubmission(String submissionId) {
        GradeResult result = new GradeResult();
        result.setSubmissionId(submissionId);

        Optional<Submission> subOpt = submissionService.getSubmission(submissionId);
        if (subOpt.isEmpty()) {
            result.setErrorMessage("Submission not found: " + submissionId);
            return result;
        }

        Submission submission = subOpt.get();
        result.setUserId(submission.getUserId());
        result.setAssignmentId(submission.getAssignmentId());

        Optional<GradingCriteria> criteriaOpt = assignmentCriteriaService.getCriteria(submission.getAssignmentId());
        if (criteriaOpt.isEmpty()) {
            result.setErrorMessage("Grading criteria not found for assignment: " + submission.getAssignmentId());
            return result;
        }

        GradingCriteria criteria = criteriaOpt.get();
        return grade(submission, criteria);
    }

    public GradeResult grade(Submission submission, GradingCriteria criteria) {
        GradeResult result = new GradeResult();
        result.setSubmissionId(submission.getId());
        result.setAssignmentId(submission.getAssignmentId());
        result.setUserId(submission.getUserId());
        result.setMaxScore(criteria.getMaxPoints());

        String code = submission.getCode();
        List<SubmissionFile> files = submission.getFiles();
        boolean multiFile = files != null && !files.isEmpty();
        String lang = submission.getLanguage() != null ? submission.getLanguage().toLowerCase() : "python";
        boolean isJava = "java".equals(lang);

        List<GradeResult.TestCaseResult> testResults = new ArrayList<>();
        double score = 0;

        for (TestCase tc : criteria.getTestCases()) {
            GradeResult.TestCaseResult tr = new GradeResult.TestCaseResult();
            tr.setTestCaseId(tc.getId());
            tr.setLabel(tc.getLabel());

            String input = resolveInput(tc);
            String expectedOutput = resolveExpectedOutput(tc);
            tr.setExpectedOutput(normalizeOutput(expectedOutput));

            ExecutionResult exec;
            if (multiFile) {
                if (isJava) {
                    exec = javaExecutionService.executeJavaCode(files, submission.getMainClass(), input);
                } else {
                    exec = pythonExecutionService.executePythonCode(files, submission.getEntryPoint(), input);
                }
            } else {
                if (isJava) {
                    exec = javaExecutionService.executeJavaCode(code, input);
                } else {
                    exec = pythonExecutionService.executePythonCode(code, input);
                }
            }

            String actual = exec.isStatus() ? normalizeOutput(exec.getOutput()) : (exec.getError() != null ? exec.getError() : "");
            tr.setActualOutput(actual);

            String expectedNorm = normalizeOutput(expectedOutput);
            boolean passed = exec.isStatus() && expectedNorm.equals(actual);
            tr.setPassed(passed);
            tr.setPointsAwarded(passed ? tc.getPoints() : 0);
            score += tr.getPointsAwarded();
            testResults.add(tr);
        }

        result.setTestResults(testResults);
        result.setScore(score);
        result.setPassed(score >= result.getMaxScore() && result.getMaxScore() > 0);

        double penaltyPercent = computeLatePenaltyPercent(
            submission.getSubmittedAt(),
            criteria.getDueAt(),
            criteria.getLatePenaltyRule()
        );
        result.setLatePenaltyPercent(penaltyPercent);
        double finalScore = Math.max(0, score * (1 - penaltyPercent / 100));
        result.setFinalScore(finalScore);

        return result;
    }

    private String resolveInput(TestCase tc) {
        if (tc.getInputFileUrl() != null && !tc.getInputFileUrl().isBlank()) {
            String fetched = fetchUrl(tc.getInputFileUrl());
            if (fetched != null) return fetched;
        }
        return tc.getInput() != null ? tc.getInput() : "";
    }

    private String resolveExpectedOutput(TestCase tc) {
        if (tc.getExpectedOutputFileUrl() != null && !tc.getExpectedOutputFileUrl().isBlank()) {
            String fetched = fetchUrl(tc.getExpectedOutputFileUrl());
            if (fetched != null) return fetched;
        }
        return tc.getExpectedOutput() != null ? tc.getExpectedOutput() : "";
    }

    // load test input or expected output from url if criteria has file urls
    private String fetchUrl(String url) {
        try {
            return restTemplate.getForObject(url, String.class);
        } catch (Exception e) {
            return null;
        }
    }

    private static String normalizeOutput(String s) {
        if (s == null) return "";
        return s.replace("\r\n", "\n").replace("\r", "\n").trim();
    }

    private double computeLatePenaltyPercent(Instant submittedAt, Instant dueAt, LatePenaltyRule rule) {
        if (submittedAt == null || dueAt == null || rule == null) return 0;
        if (!submittedAt.isAfter(dueAt)) return 0;

        Duration grace = rule.getGracePeriod() != null ? rule.getGracePeriod() : Duration.ZERO;
        Instant effectiveDue = dueAt.plus(grace);
        if (!submittedAt.isAfter(effectiveDue)) return 0;

        String type = rule.getPenaltyType();
        double percent = rule.getPenaltyPercent();
        double maxPercent = rule.getMaxPenaltyPercent();

        if (LatePenaltyRule.TYPE_FIXED_PERCENT.equals(type)) {
            return Math.min(percent, maxPercent);
        }

        if (LatePenaltyRule.TYPE_PERCENT_PER_DAY.equals(type)) {
            long daysLate = Duration.between(effectiveDue, submittedAt).toDays();
            if (daysLate <= 0) return 0;
            double totalPercent = daysLate * percent;
            return Math.min(totalPercent, maxPercent);
        }

        return 0;
    }
}
