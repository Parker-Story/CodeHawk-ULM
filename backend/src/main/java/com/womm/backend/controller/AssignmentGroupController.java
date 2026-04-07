package com.womm.backend.controller;

import com.womm.backend.entity.AssignmentGroup;
import com.womm.backend.service.AssignmentGroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/assignment/{assignmentId}/groups")
public class AssignmentGroupController {

    private final AssignmentGroupService groupService;

    public AssignmentGroupController(AssignmentGroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public AssignmentGroup createGroup(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, String> body) {
        return groupService.createGroup(assignmentId, body.get("name"));
    }

    @GetMapping
    public List<AssignmentGroup> getGroups(@PathVariable Long assignmentId) {
        return groupService.getGroupsForAssignment(assignmentId);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(
            @PathVariable Long assignmentId,
            @PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{groupId}")
    public AssignmentGroup renameGroup(
            @PathVariable Long assignmentId,
            @PathVariable Long groupId,
            @RequestBody Map<String, String> body) {
        return groupService.renameGroup(groupId, body.get("name"));
    }

    @PostMapping("/{groupId}/members/{userId}")
    public AssignmentGroup addMember(
            @PathVariable Long assignmentId,
            @PathVariable Long groupId,
            @PathVariable String userId) {
        return groupService.addMember(groupId, userId);
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long assignmentId,
            @PathVariable Long groupId,
            @PathVariable String userId) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auto-generate")
    public List<AssignmentGroup> autoGenerate(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> body) {
        int groupSize = (Integer) body.getOrDefault("groupSize", 2);
        boolean overwrite = Boolean.TRUE.equals(body.get("overwriteExisting"));
        return groupService.autoGenerateGroups(assignmentId, groupSize, overwrite);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<AssignmentGroup> getGroupForUser(
            @PathVariable Long assignmentId,
            @PathVariable String userId) {
        Optional<AssignmentGroup> group = groupService.getGroupForUser(assignmentId, userId);
        return group.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{groupId}/distribute-grade")
    public ResponseEntity<Void> distributeGrade(
            @PathVariable Long assignmentId,
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> body) {
        Integer score = body.get("score") != null ? (Integer) body.get("score") : null;
        String feedback = body.get("feedback") != null ? (String) body.get("feedback") : null;
        String submitterId = body.get("submitterId") != null ? (String) body.get("submitterId") : null;
        groupService.distributeGrade(assignmentId, groupId, score, feedback, submitterId);
        return ResponseEntity.ok().build();
    }
}
