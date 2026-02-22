package com.codehawk.service;

import com.codehawk.dto.Submission;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Service
public class SubmissionService {

    @Value("${submission.service.url:http://localhost:8081}")
    private String submissionServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Optional<Submission> getSubmission(String submissionId) {
        if (submissionId == null || submissionId.isBlank()) {
            return Optional.empty();
        }
        try {
            String url = submissionServiceUrl.replaceAll("/$", "") + "/api/submissions/" + submissionId;
            Submission s = restTemplate.getForObject(url, Submission.class);
            return Optional.ofNullable(s);
        } catch (Exception e) {
            // TODO: connect real db - using dummy for now
            return Optional.of(dummySubmission(submissionId));
        }
    }

    private static Submission dummySubmission(String id) {
        Submission s = new Submission();
        s.setId(id);
        s.setAssignmentId("assign-1");
        s.setUserId("user-1");
        s.setLanguage("python");
        s.setCode("name = input()\nprint('Hello,', name)");
        s.setSubmittedAt(java.time.Instant.now());
        return s;
    }
}
