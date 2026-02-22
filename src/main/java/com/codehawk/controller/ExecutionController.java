package com.codehawk.controller;

import com.codehawk.dto.ExecutionResult;
import com.codehawk.service.BackendService;
import com.codehawk.service.JavaExecutionService;
import com.codehawk.service.PythonExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/execute")
public class ExecutionController {

    @Autowired
    private PythonExecutionService pythonExecutionService;

    @Autowired
    private JavaExecutionService javaExecutionService;

    @Autowired
    private BackendService backendService;

    @PostMapping(consumes = "multipart/form-data")
    public ExecutionResult executeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "input", required = false) String input) {

        ExecutionResult result = new ExecutionResult();

        if (file == null || file.isEmpty()) {
            result.setStatus(false);
            result.setError("File is required");
            return result;
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            result.setStatus(false);
            result.setError("Missing filename");
            return result;
        }

        String lower = filename.toLowerCase();
        boolean isPython = lower.endsWith(".py");
        boolean isJava = lower.endsWith(".java");
        if (!isPython && !isJava) {
            result.setStatus(false);
            result.setError("File must be a Python (.py) or Java (.java) file");
            return result;
        }

        try {
            String code = new String(file.getBytes(), StandardCharsets.UTF_8);
            if (code.trim().isEmpty()) {
                result.setStatus(false);
                result.setError("File is empty");
                return result;
            }

            if (isPython) {
                result = pythonExecutionService.executePythonCode(code, input);
            } else {
                result = javaExecutionService.executeJavaCode(code, input);
            }

            backendService.sendResultToBackend(result);
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to read file: " + e.getMessage());
        }

        return result;
    }
}
