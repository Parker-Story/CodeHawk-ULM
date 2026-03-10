package com.womm.backend.controller;

import com.womm.backend.entity.*;
import com.womm.backend.service.RubricService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import com.womm.backend.entity.AssignmentRubricItemTestCase;

@RestController
@RequestMapping("/rubric")
public class RubricController {

    private final RubricService rubricService;

    public RubricController(RubricService rubricService) {
        this.rubricService = rubricService;
    }

    @PostMapping("/user/{userId}")
    public Rubric createRubric(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        return rubricService.createRubric(
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("visible") != null && (Boolean) body.get("visible"),
                body.get("weighted") != null && (Boolean) body.get("weighted"),
                userId
        );
    }

    @GetMapping("/user/{userId}")
    public List<Rubric> getRubricsByUser(@PathVariable String userId) {
        return rubricService.getRubricsByUser(userId);
    }

    @GetMapping("/{id}")
    public Rubric getRubric(@PathVariable Long id) {
        return rubricService.getRubric(id);
    }

    @PutMapping("/{id}")
    public Rubric updateRubric(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return rubricService.updateRubric(
                id,
                (String) body.get("name"),
                (String) body.get("description"),
                body.get("visible") != null && (Boolean) body.get("visible")
        );
    }

    @DeleteMapping("/{id}")
    public void deleteRubric(@PathVariable Long id) {
        rubricService.deleteRubric(id);
    }

    @PostMapping("/{id}/copy")
    public Rubric copyRubric(@PathVariable Long id) {
        return rubricService.copyRubric(id);
    }

    @PostMapping("/{rubricId}/criteria")
    public RubricCriteria addCriteria(@PathVariable Long rubricId, @RequestBody Map<String, Object> body) {
        return rubricService.addCriteria(
                rubricId,
                (String) body.get("title"),
                body.get("weight") != null ? ((Number) body.get("weight")).doubleValue() : 0,
                body.get("displayOrder") != null ? (Integer) body.get("displayOrder") : 0
        );
    }

    @DeleteMapping("/criteria/{criteriaId}")
    public void deleteCriteria(@PathVariable Long criteriaId) {
        rubricService.deleteCriteria(criteriaId);
    }

    @PostMapping("/criteria/{criteriaId}/item")
    public RubricItem addItem(@PathVariable Long criteriaId, @RequestBody Map<String, Object> body) {
        return rubricService.addItem(
                criteriaId,
                (String) body.get("label"),
                body.get("maxPoints") != null ? ((Number) body.get("maxPoints")).doubleValue() : 0,
                body.get("autoGrade") != null && (Boolean) body.get("autoGrade"),
                body.get("displayOrder") != null ? (Integer) body.get("displayOrder") : 0
        );
    }

    @GetMapping("/item-testcases/{itemId}/{assignmentId}")
    public List<AssignmentRubricItemTestCase> getLinkedTestCases(
            @PathVariable Long itemId,
            @PathVariable Long assignmentId) {
        return rubricService.getLinkedTestCases(assignmentId, itemId);
    }

    @PutMapping("/item-testcases/{itemId}/{assignmentId}")
    public void linkTestCases(
            @PathVariable Long itemId,
            @PathVariable Long assignmentId,
            @RequestBody List<Long> testCaseIds) {
        rubricService.linkTestCasesToItem(assignmentId, itemId, testCaseIds);
    }

    @DeleteMapping("/item/{itemId}")
    public void deleteItem(@PathVariable Long itemId) {
        rubricService.deleteItem(itemId);
    }

    @PostMapping("/assign/{rubricId}/assignment/{assignmentId}")
    public void attachRubric(@PathVariable Long rubricId, @PathVariable Long assignmentId) {
        rubricService.attachRubricToAssignment(rubricId, assignmentId);
    }

    @DeleteMapping("/assign/assignment/{assignmentId}")
    public void detachRubric(@PathVariable Long assignmentId) {
        rubricService.detachRubricFromAssignment(assignmentId);
    }

    @GetMapping("/assignment/{assignmentId}")
    public Rubric getRubricForAssignment(@PathVariable Long assignmentId) {
        return rubricService.getRubricForAssignment(assignmentId);
    }

    @GetMapping("/scores/{assignmentId}/{userId}")
    public List<RubricScore> getScores(@PathVariable Long assignmentId, @PathVariable String userId) {
        return rubricService.getScoresForSubmission(assignmentId, userId);
    }

    @PostMapping("/scores/{assignmentId}/{userId}")
    public RubricScore saveScore(
            @PathVariable Long assignmentId,
            @PathVariable String userId,
            @RequestBody Map<String, Object> body) {
        return rubricService.saveScore(
                ((Number) body.get("rubricItemId")).longValue(),
                assignmentId,
                userId,
                ((Number) body.get("awardedPoints")).doubleValue()
        );
    }

    @PostMapping("/autograde/{assignmentId}/{userId}")
    public void autoGrade(@PathVariable Long assignmentId, @PathVariable String userId) {
        rubricService.autoGradeSubmission(assignmentId, userId);
    }

    @GetMapping("/totalscore/{assignmentId}/{userId}")
    public Map<String, Object> getTotalScore(@PathVariable Long assignmentId, @PathVariable String userId) {
        return rubricService.calculateTotalScore(assignmentId, userId);
    }
}