package com.womm.backend.service;

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
}