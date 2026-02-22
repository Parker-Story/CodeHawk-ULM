package com.codehawk.service;

import com.codehawk.dto.GradingCriteria;
import com.codehawk.dto.LatePenaltyRule;
import com.codehawk.dto.TestCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentCriteriaService {

    @Value("${assignment.service.url:http://localhost:8081}")
    private String assignmentServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public Optional<GradingCriteria> getCriteria(String assignmentId) {
        if (assignmentId == null || assignmentId.isBlank()) {
            return Optional.empty();
        }
        try {
            String url = assignmentServiceUrl.replaceAll("/$", "") + "/api/assignments/" + assignmentId + "/criteria";
            GradingCriteria c = restTemplate.getForObject(url, GradingCriteria.class);
            return Optional.ofNullable(c);
        } catch (Exception e) {
            return Optional.of(dummyCriteria(assignmentId));
        }
    }

    // fallback when backend not set up yet
    private static GradingCriteria dummyCriteria(String assignmentId) {
        GradingCriteria c = new GradingCriteria();
        c.setAssignmentId(assignmentId);
        c.setDueAt(Instant.now().plusSeconds(3600)); // 1 hour from now for testing

        TestCase t1 = new TestCase();
        t1.setId("tc1");
        t1.setInput("Alice");
        t1.setExpectedOutput("Hello, Alice");
        t1.setPoints(50);
        TestCase t2 = new TestCase();
        t2.setId("tc2");
        t2.setInput("Bob");
        t2.setExpectedOutput("Hello, Bob");
        t2.setPoints(50);
        c.setTestCases(List.of(t1, t2));

        LatePenaltyRule late = new LatePenaltyRule();
        late.setGracePeriod(Duration.ofMinutes(15));
        late.setPenaltyType(LatePenaltyRule.TYPE_PERCENT_PER_DAY);
        late.setPenaltyPercent(10);
        late.setMaxPenaltyPercent(50);
        c.setLatePenaltyRule(late);

        return c;
    }
}
