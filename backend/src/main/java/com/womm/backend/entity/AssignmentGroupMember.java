package com.womm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.womm.backend.id.AssignmentGroupMemberId;
import jakarta.persistence.*;

@Entity
@Table(name = "assignment_group_members")
public class AssignmentGroupMember {

    @EmbeddedId
    private AssignmentGroupMemberId id;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id", nullable = false)
    @JsonIgnoreProperties("members")
    private AssignmentGroup group;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"courses", "submissions"})
    private User user;

    public AssignmentGroupMember() {}
    public AssignmentGroupMember(AssignmentGroup group, User user) {
        this.group = group;
        this.user = user;
        this.id = new AssignmentGroupMemberId(group.getId(), user.getId());
    }

    public AssignmentGroupMemberId getId() { return id; }
    public void setId(AssignmentGroupMemberId id) { this.id = id; }
    public AssignmentGroup getGroup() { return group; }
    public void setGroup(AssignmentGroup group) { this.group = group; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
