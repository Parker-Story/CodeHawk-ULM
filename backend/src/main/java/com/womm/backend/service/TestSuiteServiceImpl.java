package com.womm.backend.service;

import com.womm.backend.entity.*;
import com.womm.backend.repository.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TestSuiteServiceImpl implements TestSuiteService {

    private final TestSuiteRepository testSuiteRepository;
    private final TestSuiteCaseRepository testSuiteCaseRepository;
    private final TestCaseRepository testCaseRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public TestSuiteServiceImpl(
            TestSuiteRepository testSuiteRepository,
            TestSuiteCaseRepository testSuiteCaseRepository,
            TestCaseRepository testCaseRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository) {
        this.testSuiteRepository = testSuiteRepository;
        this.testSuiteCaseRepository = testSuiteCaseRepository;
        this.testCaseRepository = testCaseRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TestSuite createSuite(String name, String description, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        TestSuite suite = new TestSuite();
        suite.setName(name);
        suite.setDescription(description);
        suite.setCreatedBy(user);
        return testSuiteRepository.save(suite);
    }

    @Override
    public List<TestSuite> getSuitesByUser(String userId) {
        return testSuiteRepository.findByCreatedById(userId);
    }

    @Override
    public TestSuite getSuite(Long id) {
        return testSuiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Suite not found: " + id));
    }

    @Override
    public void deleteSuite(Long id) {
        testSuiteRepository.deleteById(id);
    }

    @Override
    public TestSuiteCase addCaseToSuite(Long suiteId, TestSuiteCase testSuiteCase) {
        TestSuite suite = testSuiteRepository.findById(suiteId)
                .orElseThrow(() -> new RuntimeException("Suite not found: " + suiteId));
        testSuiteCase.setSuite(suite);
        return testSuiteCaseRepository.save(testSuiteCase);
    }

    @Override
    public void deleteCaseFromSuite(Long caseId) {
        testSuiteCaseRepository.deleteById(caseId);
    }

    @Override
    public List<TestSuiteCase> getCasesBySuite(Long suiteId) {
        return testSuiteCaseRepository.findBySuiteId(suiteId);
    }

    @Override
    public void importSuiteToAssignment(Long suiteId, Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        List<TestSuiteCase> suiteCases = testSuiteCaseRepository.findBySuiteId(suiteId);
        for (TestSuiteCase sc : suiteCases) {
            TestCase tc = new TestCase();
            tc.setAssignment(assignment);
            tc.setInput(sc.getInput());
            tc.setExpectedOutput(sc.getExpectedOutput());
            tc.setHidden(sc.isHidden());
            tc.setLabel(sc.getLabel());
            testCaseRepository.save(tc);
        }
    }
}