package com.womm.backend.service;

import com.womm.backend.entity.AssignmentGroup;
import java.util.List;
import java.util.Optional;

public interface AssignmentGroupService {
    AssignmentGroup createGroup(Long assignmentId, String name);
    List<AssignmentGroup> getGroupsForAssignment(Long assignmentId);
    void deleteGroup(Long groupId);
    AssignmentGroup renameGroup(Long groupId, String name);
    AssignmentGroup addMember(Long groupId, String userId);
    void removeMember(Long groupId, String userId);
    List<AssignmentGroup> autoGenerateGroups(Long assignmentId, int groupSize, boolean overwriteExisting);
    Optional<AssignmentGroup> getGroupForUser(Long assignmentId, String userId);
    void distributeGrade(Long assignmentId, Long groupId, Integer score, String feedback, String submitterId);
}
