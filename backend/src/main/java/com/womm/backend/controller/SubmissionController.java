package com.womm.backend.controller;

import com.womm.backend.entity.Submission;
import com.womm.backend.service.SubmissionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path="/submission")
public class SubmissionController {

    SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // ----- CRUD -----
    @PostMapping
    public Submission createSubmissionDetails(@RequestBody Submission submission) {
        return submissionService.createSubmission(submission);
    }

    @GetMapping("/{userCwid}/{assignmentId}")
    public Submission getSubmissionDetails(@PathVariable String userCwid, @PathVariable Long assignmentId) {
        return submissionService.getSubmission(userCwid, assignmentId);
    }

    @GetMapping
    public List<Submission> getAllSubmissionDetails() {
        return submissionService.getAllSubmissions();
    }

    @PutMapping
    public Submission updateSubmissionDetails(@RequestBody Submission submission) {
        return submissionService.updateSubmission(submission);
    }

    @DeleteMapping("/{userCwid}/{assignmentId}")
    public void deleteSubmissionDetails(@PathVariable String userCwid, @PathVariable Long assignmentId) {
        submissionService.deleteSubmission(userCwid, assignmentId);
    }

    @PostMapping("/submit/{assignmentId}/{cwid}")
    public Submission submitAssignment(
        @PathVariable Long assignmentId,
        @PathVariable String cwid,
        @RequestBody Submission submission) {
        return submissionService.submitAssignment(assignmentId, cwid, submission);
    }

    @GetMapping("/assignment/{assignmentId}")
    public List<Submission> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionsByAssignment(assignmentId);
}
}
