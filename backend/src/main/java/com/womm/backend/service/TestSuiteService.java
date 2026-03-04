package com.womm.backend.service;

import com.womm.backend.entity.TestSuite;
import com.womm.backend.entity.TestSuiteCase;
import java.util.List;

public interface TestSuiteService {
    TestSuite createSuite(String name, String description, String userId);
    List<TestSuite> getSuitesByUser(String userId);
    TestSuite getSuite(Long id);
    void deleteSuite(Long id);
    TestSuiteCase addCaseToSuite(Long suiteId, TestSuiteCase testSuiteCase);
    void deleteCaseFromSuite(Long caseId);
    List<TestSuiteCase> getCasesBySuite(Long suiteId);
    void importSuiteToAssignment(Long suiteId, Long assignmentId);
}