package com.womm.backend.service;

import com.womm.backend.entity.*;
import com.womm.backend.enums.CourseRole;
import com.womm.backend.id.AssignmentGroupMemberId;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssignmentGroupServiceImpl implements AssignmentGroupService {

    private final AssignmentGroupRepository groupRepository;
    private final AssignmentGroupMemberRepository memberRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CourseUserRepository courseUserRepository;
    private final SubmissionRepository submissionRepository;
    private final RubricScoreRepository rubricScoreRepository;

    public AssignmentGroupServiceImpl(
            AssignmentGroupRepository groupRepository,
            AssignmentGroupMemberRepository memberRepository,
            AssignmentRepository assignmentRepository,
            UserRepository userRepository,
            CourseUserRepository courseUserRepository,
            SubmissionRepository submissionRepository,
            RubricScoreRepository rubricScoreRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.courseUserRepository = courseUserRepository;
        this.submissionRepository = submissionRepository;
        this.rubricScoreRepository = rubricScoreRepository;
    }

    @Override
    public AssignmentGroup createGroup(Long assignmentId, String name) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        AssignmentGroup group = new AssignmentGroup();
        group.setAssignment(assignment);
        group.setName(name);
        return groupRepository.save(group);
    }

    @Override
    public List<AssignmentGroup> getGroupsForAssignment(Long assignmentId) {
        return groupRepository.findByAssignmentId(assignmentId);
    }

    @Override
    @Transactional
    public void deleteGroup(Long groupId) {
        memberRepository.deleteByGroupId(groupId);
        groupRepository.deleteById(groupId);
    }

    @Override
    public AssignmentGroup renameGroup(Long groupId, String name) {
        AssignmentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        group.setName(name);
        return groupRepository.save(group);
    }

    @Override
    public AssignmentGroup addMember(Long groupId, String userId) {
        AssignmentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Long assignmentId = group.getAssignment().getId();
        if (memberRepository.findByUserIdAndAssignmentId(userId, assignmentId).isPresent()) {
            throw new RuntimeException("User is already in a group for this assignment.");
        }

        AssignmentGroupMember member = new AssignmentGroupMember();
        member.setId(new AssignmentGroupMemberId(groupId, userId));
        member.setGroup(group);
        member.setUser(user);
        memberRepository.save(member);

        return groupRepository.findById(groupId).get();
    }

    @Override
    @Transactional
    public void removeMember(Long groupId, String userId) {
        AssignmentGroupMemberId id = new AssignmentGroupMemberId(groupId, userId);
        memberRepository.deleteById(id);
    }

    @Override
    @Transactional
    public List<AssignmentGroup> autoGenerateGroups(Long assignmentId, int groupSize, boolean overwriteExisting) {
        if (groupSize < 2) throw new RuntimeException("Group size must be at least 2.");

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
        String crn = assignment.getCourse().getCrn();

        if (overwriteExisting) {
            List<AssignmentGroup> existing = groupRepository.findByAssignmentId(assignmentId);
            for (AssignmentGroup g : existing) {
                memberRepository.deleteByGroupId(g.getId());
            }
            groupRepository.deleteByAssignmentId(assignmentId);
        }

        // Get all students enrolled in the course
        List<CourseUser> courseUsers = courseUserRepository.findUsersByCourseCrn(crn);
        List<String> studentIds = courseUsers.stream()
                .filter(cu -> cu.getCourseRole() == CourseRole.STUDENT)
                .map(cu -> cu.getUser().getId())
                .collect(Collectors.toList());

        // Remove already-assigned students
        Set<String> alreadyAssigned = groupRepository.findByAssignmentId(assignmentId).stream()
                .flatMap(g -> g.getMembers().stream())
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());
        List<String> unassigned = studentIds.stream()
                .filter(id -> !alreadyAssigned.contains(id))
                .collect(Collectors.toList());

        Collections.shuffle(unassigned);

        List<AssignmentGroup> created = new ArrayList<>();
        int existingCount = groupRepository.findByAssignmentId(assignmentId).size();
        int groupNum = existingCount + 1;

        for (int i = 0; i < unassigned.size(); i += groupSize) {
            List<String> chunk = unassigned.subList(i, Math.min(i + groupSize, unassigned.size()));
            AssignmentGroup group = new AssignmentGroup();
            group.setAssignment(assignment);
            group.setName("Group " + groupNum++);
            AssignmentGroup saved = groupRepository.save(group);

            for (String uid : chunk) {
                User user = userRepository.findById(uid)
                        .orElseThrow(() -> new RuntimeException("User not found: " + uid));
                AssignmentGroupMember member = new AssignmentGroupMember();
                member.setId(new AssignmentGroupMemberId(saved.getId(), uid));
                member.setGroup(saved);
                member.setUser(user);
                memberRepository.save(member);
            }
            created.add(groupRepository.findById(saved.getId()).get());
        }
        return created;
    }

    @Override
    public Optional<AssignmentGroup> getGroupForUser(Long assignmentId, String userId) {
        return memberRepository.findByUserIdAndAssignmentId(userId, assignmentId)
                .map(AssignmentGroupMember::getGroup);
    }

    @Override
    @Transactional
    public void distributeGrade(Long assignmentId, Long groupId, Integer score, String feedback, String submitterId) {
        AssignmentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found: " + groupId));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));

        // Load the submitter's rubric scores once so we can copy them to each member
        List<RubricScore> sourceScores = submitterId != null
                ? rubricScoreRepository.findBySubmission(assignmentId, submitterId)
                : Collections.emptyList();

        for (AssignmentGroupMember member : group.getMembers()) {
            String userId = member.getUser().getId();
            SubmissionId sid = new SubmissionId(userId, assignmentId);
            Submission submission = submissionRepository.findById(sid).orElseGet(() -> {
                Submission s = new Submission();
                s.setSubmissionId(sid);
                s.setUser(member.getUser());
                s.setAssignment(assignment);
                return s;
            });
            if (score != null) submission.setScore(score);
            if (feedback != null) submission.setFeedback(feedback);
            Submission saved = submissionRepository.save(submission);

            // Copy rubric scores from the submitter to this member
            if (!sourceScores.isEmpty() && !userId.equals(submitterId)) {
                rubricScoreRepository.deleteBySubmission(assignmentId, userId);
                for (RubricScore src : sourceScores) {
                    RubricScore copy = new RubricScore();
                    copy.setRubricItem(src.getRubricItem());
                    copy.setSubmission(saved);
                    copy.setAwardedPoints(src.getAwardedPoints());
                    rubricScoreRepository.save(copy);
                }
            }
        }
    }
}
