package com.codehawk.service;

import com.codehawk.dto.ExecutionResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Service for sending execution results back to the backend
 */
@Service
public class BackendService {
    
    @Value("${backend.url:http://localhost:8081/api/execution/result}")
    private String backendUrl;
    
    private final RestTemplate restTemplate;
    
    public BackendService() {
        this.restTemplate = new RestTemplate();
    }
    
    /**
     * Sends execution result to the backend endpoint
     * 
     * @param result The execution result to send
     * @return true if successful, false otherwise
     */
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
            
            // Log the response (can be removed later)
            System.out.println("Backend response: " + response.getStatusCode());
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            // Log error but don't fail execution
            System.err.println("Failed to send result to backend: " + e.getMessage());
            return false;
        }
    }
}
