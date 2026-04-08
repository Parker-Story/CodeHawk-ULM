package com.womm.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assignment_groups")
public class AssignmentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    @JsonIgnoreProperties({"submissions", "course"})
    private Assignment assignment;

    @Column(name = "name", nullable = false)
    private String name;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssignmentGroupMember> members = new ArrayList<>();

    public AssignmentGroup() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Assignment getAssignment() { return assignment; }
    public void setAssignment(Assignment assignment) { this.assignment = assignment; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<AssignmentGroupMember> getMembers() { return members; }
    public void setMembers(List<AssignmentGroupMember> members) { this.members = members; }
}
