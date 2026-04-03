package com.womm.backend.service;

import com.womm.backend.entity.*;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class RubricServiceImpl implements RubricService {

    private final RubricRepository rubricRepository;
    private final RubricCriteriaRepository rubricCriteriaRepository;
    private final RubricItemRepository rubricItemRepository;
    private final RubricScoreRepository rubricScoreRepository;
    private final RubricScoreLabelRepository rubricScoreLabelRepository;
    private final AssignmentRubricRepository assignmentRubricRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final TestResultRepository testResultRepository;
    private final SubmissionRepository submissionRepository;
    private final AssignmentRubricItemTestCaseRepository articRepository;

    public RubricServiceImpl(
            RubricRepository rubricRepository,
            RubricCriteriaRepository rubricCriteriaRepository,
            RubricItemRepository rubricItemRepository,
            RubricScoreRepository rubricScoreRepository,
            RubricScoreLabelRepository rubricScoreLabelRepository,
            AssignmentRubricRepository assignmentRubricRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            AssignmentRubricItemTestCaseRepository articRepository,
            TestResultRepository testResultRepository,
            SubmissionRepository submissionRepository) {
        this.rubricRepository = rubricRepository;
        this.rubricCriteriaRepository = rubricCriteriaRepository;
        this.rubricItemRepository = rubricItemRepository;
        this.rubricScoreRepository = rubricScoreRepository;
        this.rubricScoreLabelRepository = rubricScoreLabelRepository;
        this.assignmentRubricRepository = assignmentRubricRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.articRepository = articRepository;
        this.testResultRepository = testResultRepository;
        this.submissionRepository = submissionRepository;
    }

    @Override
    public Rubric createRubric(String name, String description, boolean visible, boolean weighted, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Rubric rubric = new Rubric();
        rubric.setName(name);
        rubric.setDescription(description);
        rubric.setVisible(visible);
        rubric.setWeighted(weighted);
        rubric.setCreatedBy(user);
        rubric.setTotalPoints(0);
        return rubricRepository.save(rubric);
    }

    @Override
    public List<Rubric> getRubricsByUser(String userId) {
        return rubricRepository.findByCreatedById(userId);
    }

    @Override
    public Rubric getRubric(Long id) {
        return rubricRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rubric not found: " + id));
    }

    @Override
    public Rubric updateRubric(Long id, String name, String description, boolean visible) {
        Rubric rubric = getRubric(id);
        rubric.setName(name);
        rubric.setDescription(description);
        rubric.setVisible(visible);
        return rubricRepository.save(rubric);
    }

    @Override
    @Transactional
    public void deleteRubric(Long id) {
        rubricScoreRepository.deleteByRubricId(id);
        articRepository.deleteByRubricId(id);
        assignmentRubricRepository.deleteByRubricId(id);
        rubricRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Rubric copyRubric(Long id) {
        Rubric original = getRubric(id);
        Rubric copy = new Rubric();
        copy.setName("(Copy) " + original.getName());
        copy.setDescription(original.getDescription());
        copy.setVisible(original.isVisible());
        copy.setCreatedBy(original.getCreatedBy());
        copy.setWeighted(original.isWeighted());
        copy.setTotalPoints(original.getTotalPoints());
        Rubric savedCopy = rubricRepository.save(copy);

        List<RubricCriteria> originalCriteria = rubricCriteriaRepository.findByRubricId(id);
        for (RubricCriteria origCrit : originalCriteria) {
            RubricCriteria newCrit = new RubricCriteria();
            newCrit.setRubric(savedCopy);
            newCrit.setTitle(origCrit.getTitle());
            newCrit.setDisplayOrder(origCrit.getDisplayOrder());
            RubricCriteria savedCrit = rubricCriteriaRepository.save(newCrit);

            List<RubricItem> originalItems = rubricItemRepository.findByCriteriaId(origCrit.getId());
            for (RubricItem origItem : originalItems) {
                RubricItem newItem = new RubricItem();
                newItem.setCriteria(savedCrit);
                newItem.setLabel(origItem.getLabel());
                newItem.setMaxPoints(origItem.getMaxPoints());
                newItem.setWeight(origItem.getWeight());
                newItem.setAutoGrade(origItem.isAutoGrade());
                newItem.setDisplayOrder(origItem.getDisplayOrder());
                RubricItem savedItem = rubricItemRepository.save(newItem);

                List<RubricScoreLabel> origLabels = rubricScoreLabelRepository.findByRubricItemId(origItem.getId());
                for (RubricScoreLabel origLabel : origLabels) {
                    RubricScoreLabel newLabel = new RubricScoreLabel();
                    newLabel.setRubricItem(savedItem);
                    newLabel.setScore(origLabel.getScore());
                    newLabel.setLabel(origLabel.getLabel());
                    rubricScoreLabelRepository.save(newLabel);
                }
            }
        }
        return savedCopy;
    }

    @Override
    public RubricCriteria addCriteria(Long rubricId, String title, int displayOrder) {
        Rubric rubric = getRubric(rubricId);
        RubricCriteria criteria = new RubricCriteria();
        criteria.setRubric(rubric);
        criteria.setTitle(title);
        criteria.setDisplayOrder(displayOrder);
        return rubricCriteriaRepository.save(criteria);
    }

    @Override
    @Transactional
    public void deleteCriteria(Long criteriaId) {
        RubricCriteria criteria = rubricCriteriaRepository.findById(criteriaId)
                .orElseThrow(() -> new RuntimeException("Criteria not found: " + criteriaId));
        Rubric rubric = criteria.getRubric();
        List<RubricItem> items = rubricItemRepository.findByCriteriaId(criteriaId);
        double pointsToRemove = items.stream().mapToDouble(RubricItem::getMaxPoints).sum();
        rubricCriteriaRepository.deleteById(criteriaId);
        rubric.setTotalPoints(Math.max(0, rubric.getTotalPoints() - pointsToRemove));
        rubricRepository.save(rubric);
    }

    @Override
    public RubricItem addItem(Long criteriaId, String label, double weight, boolean autoGrade, int displayOrder) {
        RubricCriteria criteria = rubricCriteriaRepository.findById(criteriaId)
                .orElseThrow(() -> new RuntimeException("Criteria not found: " + criteriaId));
        Rubric rubric = criteria.getRubric();
        RubricItem item = new RubricItem();
        item.setCriteria(criteria);
        item.setLabel(label);
        item.setWeight(weight);
        item.setAutoGrade(autoGrade);
        item.setDisplayOrder(displayOrder);
        item.setMaxPoints(weight);
        return rubricItemRepository.save(item);
    }

    @Override
    @Transactional
    public void saveScoreLabels(Long itemId, Map<Integer, String> labels) {
        RubricItem item = rubricItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        rubricScoreLabelRepository.deleteByRubricItemId(itemId);
        for (Map.Entry<Integer, String> entry : labels.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isBlank()) {
                RubricScoreLabel scoreLabel = new RubricScoreLabel();
                scoreLabel.setRubricItem(item);
                scoreLabel.setScore(entry.getKey());
                scoreLabel.setLabel(entry.getValue());
                rubricScoreLabelRepository.save(scoreLabel);
            }
        }
    }

    @Override
    public List<AssignmentRubricItemTestCase> getLinkedTestCases(Long assignmentId, Long rubricItemId) {
        return articRepository.findByAssignmentAndRubricItem(assignmentId, rubricItemId);
    }

    @Override
    @Transactional
    public void linkTestCasesToItem(Long assignmentId, Long rubricItemId, List<Long> testCaseIds) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        RubricItem item = rubricItemRepository.findById(rubricItemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + rubricItemId));
        articRepository.deleteByAssignmentAndRubricItem(assignmentId, rubricItemId);
        for (Long testCaseId : testCaseIds) {
            TestCase tc = new TestCase();
            tc.setId(testCaseId);
            AssignmentRubricItemTestCase link = new AssignmentRubricItemTestCase();
            link.setAssignment(assignment);
            link.setRubricItem(item);
            link.setTestCase(tc);
            articRepository.save(link);
        }
    }

    @Override
    @Transactional
    public void deleteItem(Long itemId) {
        RubricItem item = rubricItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
        Rubric rubric = item.getCriteria().getRubric();
        rubric.setTotalPoints(Math.max(0, rubric.getTotalPoints() - item.getMaxPoints()));
        rubricRepository.save(rubric);
        rubricItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public void attachRubricToAssignment(Long rubricId, Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        Rubric rubric = getRubric(rubricId);
        assignmentRubricRepository.deleteByAssignmentId(assignmentId);
        AssignmentRubric ar = new AssignmentRubric();
        ar.setAssignment(assignment);
        ar.setRubric(rubric);
        assignmentRubricRepository.save(ar);
    }

    @Override
    @Transactional
    public void detachRubricFromAssignment(Long assignmentId) {
        assignmentRubricRepository.deleteByAssignmentId(assignmentId);
    }

    @Override
    public Rubric getRubricForAssignment(Long assignmentId) {
        return assignmentRubricRepository.findByAssignmentId(assignmentId)
                .map(AssignmentRubric::getRubric)
                .orElse(null);
    }

    @Override
    public List<RubricScore> getScoresForSubmission(Long assignmentId, String userId) {
        return rubricScoreRepository.findBySubmission(assignmentId, userId);
    }

    @Override
    @Transactional
    public RubricScore saveScore(Long rubricItemId, Long assignmentId, String userId, double awardedPoints) {
        RubricItem item = rubricItemRepository.findById(rubricItemId)
                .orElseThrow(() -> new RuntimeException("Item not found: " + rubricItemId));
        Submission submission = submissionRepository.findById(new SubmissionId(userId, assignmentId))
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        List<RubricScore> existing = rubricScoreRepository.findBySubmission(assignmentId, userId);
        RubricScore score = existing.stream()
                .filter(s -> s.getRubricItem().getId().equals(rubricItemId))
                .findFirst()
                .orElse(new RubricScore());
        score.setRubricItem(item);
        score.setSubmission(submission);
        score.setAwardedPoints(awardedPoints);
        return rubricScoreRepository.save(score);
    }

    @Override
    @Transactional
    public void autoGradeSubmission(Long assignmentId, String userId) {
        Rubric rubric = getRubricForAssignment(assignmentId);
        if (rubric == null) return;
        List<TestResult> testResults = testResultRepository.findByAssignmentId(assignmentId);
        List<TestResult> studentResults = testResults.stream()
                .filter(r -> r.getSubmission().getSubmissionId().getUserId().equals(userId))
                .toList();

        for (RubricCriteria criteria : rubric.getCriteria()) {
            for (RubricItem item : criteria.getItems()) {
                if (!item.isAutoGrade()) continue;
                List<AssignmentRubricItemTestCase> links = articRepository.findByAssignmentAndRubricItem(assignmentId, item.getId());
                if (links.isEmpty()) continue;
                List<Long> linkedTestCaseIds = links.stream().map(l -> l.getTestCase().getId()).toList();
                long total = linkedTestCaseIds.size();
                long passed = studentResults.stream()
                        .filter(r -> linkedTestCaseIds.contains(r.getTestCase().getId()) && r.isPassed())
                        .count();
                double awarded = rubric.isWeighted()
                        ? Math.round((double) passed / total * 5)
                        : (double) passed / total * item.getMaxPoints();
                saveScore(item.getId(), assignmentId, userId, awarded);
            }
        }
    }

    @Override
    public Map<String, Object> calculateTotalScore(Long assignmentId, String userId) {
        Rubric rubric = getRubricForAssignment(assignmentId);
        if (rubric == null) return Map.of("awarded", 0, "possible", 0, "percentage", 0);
        List<RubricScore> scores = rubricScoreRepository.findBySubmission(assignmentId, userId);

        if (rubric.isWeighted()) {
            double totalPercentage = 0;
            for (RubricCriteria criteria : rubric.getCriteria()) {
                for (RubricItem item : criteria.getItems()) {
                    if (item.getWeight() == 0) continue;
                    double itemScore = scores.stream()
                            .filter(s -> s.getRubricItem().getId().equals(item.getId()))
                            .mapToDouble(RubricScore::getAwardedPoints)
                            .findFirst().orElse(0);
                    totalPercentage += (itemScore / 5.0) * item.getWeight();
                }
            }
            return Map.of("awarded", Math.round(totalPercentage), "possible", 100, "percentage", Math.round(totalPercentage));
        }

        double awarded = scores.stream().mapToDouble(RubricScore::getAwardedPoints).sum();
        double possible = rubric.getTotalPoints();
        double percentage = possible > 0 ? (awarded / possible) * 100 : 0;
        return Map.of("awarded", awarded, "possible", possible, "percentage", Math.round(percentage));
    }
}
