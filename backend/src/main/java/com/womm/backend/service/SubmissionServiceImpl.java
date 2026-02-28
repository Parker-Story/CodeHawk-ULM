package com.womm.backend.service;
import com.womm.backend.entity.Assignment;
import com.womm.backend.entity.Submission;
import com.womm.backend.entity.User;
import com.womm.backend.id.SubmissionId;
import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.SubmissionRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService {
    SubmissionRepository submissionRepository;
    UserRepository userRepository;
    AssignmentRepository assignmentRepository;

    public SubmissionServiceImpl(SubmissionRepository submissionRepository, AssignmentRepository assignmentRepository, UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    @Override
    public Submission getSubmission(String userCwid, Long assignmentId) {
        return submissionRepository.findById(new SubmissionId(userCwid, assignmentId)).get();
    }

    @Override
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @Override
    public Submission updateSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    @Override
    public void deleteSubmission(String userCwid, Long assignmentId) {
        submissionRepository.deleteById(new SubmissionId(userCwid, assignmentId));
    }

    @Override
    public Submission submitAssignment(Long assignmentId, String cwid, Submission submission) {
        User user = userRepository.findById(cwid).get();
        Assignment assignment = assignmentRepository.findById(assignmentId).get();
        submission.setUser(user);
        submission.setAssignment(assignment);
        submission.setSubmissionId(new SubmissionId(cwid, assignmentId));
        return submissionRepository.save(submission);
    }

    @Override
    public List<Submission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    @Override
    public Submission scoreSubmission(Long assignmentId, String cwid, Integer score) {
    Submission submission = submissionRepository.findById(new SubmissionId(cwid, assignmentId)).get();
    submission.setScore(score);
    return submissionRepository.save(submission);
    }
}