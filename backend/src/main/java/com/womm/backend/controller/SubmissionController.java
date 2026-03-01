package com.womm.backend.controller;
import com.womm.backend.entity.Submission;
import com.womm.backend.service.SubmissionService;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping(path="/submission")
public class SubmissionController {
    SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public Submission createSubmissionDetails(@RequestBody Submission submission) {
        return submissionService.createSubmission(submission);
    }

    @GetMapping("/{userId}/{assignmentId}")
    public Submission getSubmissionDetails(@PathVariable String userId, @PathVariable Long assignmentId) {
        return submissionService.getSubmission(userId, assignmentId);
    }

    @GetMapping
    public List<Submission> getAllSubmissionDetails() {
        return submissionService.getAllSubmissions();
    }

    @PutMapping
    public Submission updateSubmissionDetails(@RequestBody Submission submission) {
        return submissionService.updateSubmission(submission);
    }

    @DeleteMapping("/{userId}/{assignmentId}")
    public void deleteSubmissionDetails(@PathVariable String userId, @PathVariable Long assignmentId) {
        submissionService.deleteSubmission(userId, assignmentId);
    }

    @PostMapping("/submit/{assignmentId}/{userId}")
    public Submission submitAssignment(
        @PathVariable Long assignmentId,
        @PathVariable String userId,
        @RequestBody Submission submission) {
        return submissionService.submitAssignment(assignmentId, userId, submission);
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<Submission> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionsByAssignment(assignmentId);
    }

    @PutMapping("/score/{assignmentId}/{userId}")
    public Submission scoreSubmission(
        @PathVariable Long assignmentId,
        @PathVariable String userId,
        @RequestBody Map<String, Integer> body) {
        return submissionService.scoreSubmission(assignmentId, userId, body.get("score"));
    }
}