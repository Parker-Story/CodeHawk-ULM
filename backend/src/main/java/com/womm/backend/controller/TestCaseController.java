package com.womm.backend.controller;

import com.womm.backend.dto.CustomTestRunRequest;
import com.womm.backend.dto.CustomTestRunResult;
import com.womm.backend.dto.PreviewRunRequest;
import com.womm.backend.entity.TestCase;
import com.womm.backend.entity.TestResult;
import com.womm.backend.service.TestCaseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/testcase")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @PostMapping("/assignment/{assignmentId}")
    public TestCase createTestCase(@RequestBody TestCase testCase, @PathVariable Long assignmentId) {
        return testCaseService.createTestCase(testCase, assignmentId);
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<TestCase> getTestCasesByAssignment(@PathVariable Long assignmentId) {
        return testCaseService.getTestCasesByAssignment(assignmentId);
    }

    @GetMapping("/assignment/{assignmentId}/visible")
    public List<TestCase> getVisibleTestCases(@PathVariable Long assignmentId) {
        return testCaseService.getVisibleTestCasesByAssignment(assignmentId);
    }

    @DeleteMapping("/{id}")
    public void deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
    }

    @PostMapping("/run/{assignmentId}/{userId}")
    public List<TestResult> runTests(@PathVariable Long assignmentId, @PathVariable String userId) {
        return testCaseService.runTestsForSubmission(assignmentId, userId);
    }

    @PostMapping("/run/custom/{assignmentId}/{userId}")
    public List<CustomTestRunResult> runCustomTests(
            @PathVariable Long assignmentId,
            @PathVariable String userId,
            @RequestBody CustomTestRunRequest request
    ) {
        return testCaseService.runCustomTestsForSubmission(assignmentId, userId, request);
    }

    @PostMapping("/run/preview/{assignmentId}")
    public List<CustomTestRunResult> runPreview(
            @PathVariable Long assignmentId,
            @RequestBody PreviewRunRequest request
    ) {
        return testCaseService.runPreviewTests(assignmentId, request);
    }

    @GetMapping("/results/{assignmentId}/{userId}")
    public List<TestResult> getResultsForSubmission(@PathVariable Long assignmentId, @PathVariable String userId) {
        return testCaseService.getTestResultsForSubmission(assignmentId, userId);
    }

    @GetMapping("/results/assignment/{assignmentId}")
    public List<TestResult> getResultsForAssignment(@PathVariable Long assignmentId) {
        return testCaseService.getTestResultsForAssignment(assignmentId);
    }
}