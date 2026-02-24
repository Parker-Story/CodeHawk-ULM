package com.womm.backend.controller;

import com.womm.backend.dto.ExecutionResult;
import com.womm.backend.service.BackendService;
import com.womm.backend.service.PythonExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Execution environment controller
 * Receives Python files from backend, executes them, and returns results
 */
@RestController
@RequestMapping("/api/execute")
@CrossOrigin(origins = "https://codehawk-ulm.onrender.com")
public class ExecutionController {

    @Autowired
    private PythonExecutionService pythonExecutionService;

    @Autowired
    private BackendService backendService;

    /**
     * Execute Python code from uploaded file
     *
     * @param file The Python file to execute
     * @param input Optional input data for the program
     * @return ExecutionResult with output and error
     */
    @PostMapping(consumes = "multipart/form-data")
    public ExecutionResult executeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "input", required = false) String input) {

        ExecutionResult result = new ExecutionResult();

        // Validate file
        if (file == null || file.isEmpty()) {
            result.setStatus(false);
            result.setError("File is required");
            return result;
        }

        // Check if it's a Python file
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".py")) {
            result.setStatus(false);
            result.setError("File must be a Python file (.py)");
            return result;
        }

        try {
            // Extract code from file
            String code = new String(file.getBytes(), StandardCharsets.UTF_8);

            if (code.trim().isEmpty()) {
                result.setStatus(false);
                result.setError("File is empty");
                return result;
            }

            // Execute the code
            result = pythonExecutionService.executePythonCode(code, input);

            // Send result back to backend
            backendService.sendResultToBackend(result);

        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to read file: " + e.getMessage());
        }

        return result;
    }
}