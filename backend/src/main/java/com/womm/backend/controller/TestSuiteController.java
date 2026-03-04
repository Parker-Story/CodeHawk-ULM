package com.womm.backend.controller;

import com.womm.backend.entity.TestSuite;
import com.womm.backend.entity.TestSuiteCase;
import com.womm.backend.service.TestSuiteService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/testsuite")
public class TestSuiteController {

    private final TestSuiteService testSuiteService;

    public TestSuiteController(TestSuiteService testSuiteService) {
        this.testSuiteService = testSuiteService;
    }

    @PostMapping("/user/{userId}")
    public TestSuite createSuite(@PathVariable String userId, @RequestBody Map<String, String> body) {
        return testSuiteService.createSuite(body.get("name"), body.get("description"), userId);
    }

    @GetMapping("/user/{userId}")
    public List<TestSuite> getSuitesByUser(@PathVariable String userId) {
        return testSuiteService.getSuitesByUser(userId);
    }

    @GetMapping("/{id}")
    public TestSuite getSuite(@PathVariable Long id) {
        return testSuiteService.getSuite(id);
    }

    @DeleteMapping("/{id}")
    public void deleteSuite(@PathVariable Long id) {
        testSuiteService.deleteSuite(id);
    }

    @PostMapping("/{suiteId}/case")
    public TestSuiteCase addCase(@PathVariable Long suiteId, @RequestBody TestSuiteCase testSuiteCase) {
        return testSuiteService.addCaseToSuite(suiteId, testSuiteCase);
    }

    @DeleteMapping("/case/{caseId}")
    public void deleteCase(@PathVariable Long caseId) {
        testSuiteService.deleteCaseFromSuite(caseId);
    }

    @GetMapping("/{suiteId}/cases")
    public List<TestSuiteCase> getCases(@PathVariable Long suiteId) {
        return testSuiteService.getCasesBySuite(suiteId);
    }

    @PostMapping("/{suiteId}/import/{assignmentId}")
    public void importToAssignment(@PathVariable Long suiteId, @PathVariable Long assignmentId) {
        testSuiteService.importSuiteToAssignment(suiteId, assignmentId);
    }
}