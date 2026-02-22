package com.codehawk.service;

import com.codehawk.dto.ExecutionResult;
import com.codehawk.dto.GradeResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BackendService {

    @Value("${backend.url:http://localhost:8081/api/execution/result}")
    private String backendUrl;

    @Value("${grading.result.url:}")  // optional - set when we have backend for grades
    private String gradingResultUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendResultToBackend(ExecutionResult result) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<ExecutionResult> request = new HttpEntity<>(result, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(
                backendUrl,
                request,
                String.class
            );
            
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("Failed to send result to backend: " + e.getMessage());
            return false;
        }
    }

    public boolean sendGradeToBackend(GradeResult result) {
        if (gradingResultUrl == null || gradingResultUrl.isBlank()) {
            return false;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<GradeResult> request = new HttpEntity<>(result, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(gradingResultUrl, request, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            System.err.println("Failed to send grade to backend: " + e.getMessage());
            return false;
        }
    }
}
