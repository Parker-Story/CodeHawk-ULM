package com.womm.backend.submission;

import com.womm.backend.assignment.AssignmentRepository;
import com.womm.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubmissionServiceImpl implements SubmissionService{

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

}
