package com.womm.backend.service;

import com.womm.backend.entity.Rubric;
import com.womm.backend.entity.RubricCriteria;
import com.womm.backend.entity.RubricItem;
import com.womm.backend.entity.RubricScore;
import java.util.List;
import java.util.Map;
import com.womm.backend.entity.AssignmentRubricItemTestCase;

public interface RubricService {
    Rubric createRubric(String name, String description, boolean visible, boolean weighted, String userId);
    List<Rubric> getRubricsByUser(String userId);
    Rubric getRubric(Long id);
    Rubric updateRubric(Long id, String name, String description, boolean visible);
    void deleteRubric(Long id);
    Rubric copyRubric(Long id);

    RubricCriteria addCriteria(Long rubricId, String title, int displayOrder);
    void deleteCriteria(Long criteriaId);

    RubricItem addItem(Long criteriaId, String label, double weight, boolean autoGrade, int displayOrder);
    void saveScoreLabels(Long itemId, Map<Integer, String> labels);

    List<AssignmentRubricItemTestCase> getLinkedTestCases(Long assignmentId, Long rubricItemId);
    void linkTestCasesToItem(Long assignmentId, Long rubricItemId, List<Long> testCaseIds);
    void deleteItem(Long itemId);

    void attachRubricToAssignment(Long rubricId, Long assignmentId);
    void detachRubricFromAssignment(Long assignmentId);
    Rubric getRubricForAssignment(Long assignmentId);

    List<RubricScore> getScoresForSubmission(Long assignmentId, String userId);
    RubricScore saveScore(Long rubricItemId, Long assignmentId, String userId, double awardedPoints);
    void autoGradeSubmission(Long assignmentId, String userId);
    Map<String, Object> calculateTotalScore(Long assignmentId, String userId);
}