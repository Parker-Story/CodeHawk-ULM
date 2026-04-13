package com.womm.backend.service;

import com.womm.backend.dto.DetectionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiDetectionServiceImpl implements AiDetectionService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiDetectionServiceImpl(@Value("${ai.service.url}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    @Override
    public DetectionResponse detectAI(String code) throws Exception {
        if (code == null || code.isBlank()) {
            throw new IllegalArgumentException("Code must not be empty");
        }

        // Prepare request body
        Map<String, String> request = Map.of("code", code);

        try {
            ResponseEntity<DetectionResponse> response = restTemplate.postForEntity(
                    aiServiceUrl, request, DetectionResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            } else {
                throw new RuntimeException("AI detection service returned error: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("AI detection service failed", e);
        }
    }
}
