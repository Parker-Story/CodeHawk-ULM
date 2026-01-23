package com.codehawk.service;

import com.codehawk.dto.ExecutionResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PythonExecutionServiceTest {

    @Autowired
    private PythonExecutionService pythonExecutionService;

    @Test
    public void testExecutePythonCode() {
        String code = "print('hello world')";
        ExecutionResult result = pythonExecutionService.executePythonCode(code, null);
        
        System.out.println("Status: " + result.isStatus());
        System.out.println("Output: " + result.getOutput());
        System.out.println("Error: " + result.getError());
        
        assertNotNull(result);
        assertTrue(result.isStatus());
        assertTrue(result.getOutput().contains("hello world"));
    }
}
