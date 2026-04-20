package com.womm.backend.repository;

import com.womm.backend.entity.AssignmentGroupMember;
import com.womm.backend.id.AssignmentGroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface AssignmentGroupMemberRepository extends JpaRepository<AssignmentGroupMember, AssignmentGroupMemberId> {

    List<AssignmentGroupMember> findByGroupId(Long groupId);

    @Query("SELECT m FROM AssignmentGroupMember m WHERE m.id.userId = :userId AND m.group.assignment.id = :assignmentId")
    Optional<AssignmentGroupMember> findByUserIdAndAssignmentId(@Param("userId") String userId, @Param("assignmentId") Long assignmentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentGroupMember m WHERE m.group.id = :groupId")
    void deleteByGroupId(@Param("groupId") Long groupId);

    @Modifying
    @Transactional
    @Query("DELETE FROM AssignmentGroupMember m WHERE m.id.userId = :userId")
    void deleteByUserId(@Param("userId") String userId);
}
