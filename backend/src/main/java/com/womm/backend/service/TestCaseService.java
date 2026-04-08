package com.womm.backend.service;

import com.womm.backend.dto.CustomTestRunRequest;
import com.womm.backend.dto.CustomTestRunResult;
import com.womm.backend.dto.PreviewRunRequest;
import com.womm.backend.entity.TestCase;
import com.womm.backend.entity.TestResult;
import java.util.List;

public interface TestCaseService {
    TestCase createTestCase(TestCase testCase, Long assignmentId);
    List<TestCase> getTestCasesByAssignment(Long assignmentId);
    List<TestCase> getVisibleTestCasesByAssignment(Long assignmentId);
    void deleteTestCase(Long id);
    List<TestResult> runTestsForSubmission(Long assignmentId, String userId);
    List<TestResult> getTestResultsForSubmission(Long assignmentId, String userId);
    List<TestResult> getTestResultsForAssignment(Long assignmentId);

    List<CustomTestRunResult> runCustomTestsForSubmission(
            Long assignmentId,
            String userId,
            CustomTestRunRequest request
    );

    List<CustomTestRunResult> runPreviewTests(Long assignmentId, PreviewRunRequest request);
}