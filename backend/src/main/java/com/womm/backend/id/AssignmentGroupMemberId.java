package com.womm.backend.id;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class AssignmentGroupMemberId implements Serializable {
    private Long groupId;
    private String userId;

    public AssignmentGroupMemberId() {}
    public AssignmentGroupMemberId(Long groupId, String userId) {
        this.groupId = groupId;
        this.userId = userId;
    }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        AssignmentGroupMemberId that = (AssignmentGroupMemberId) o;
        return Objects.equals(groupId, that.groupId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() { return Objects.hash(groupId, userId); }
}
