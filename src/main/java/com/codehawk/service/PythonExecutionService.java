package com.codehawk.service;

import com.codehawk.dto.ExecutionResult;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class PythonExecutionService {

    // Timeout for execution in seconds (default: 10 seconds)
    private static final int EXECUTION_TIMEOUT = 10;

    /**
     * Executes a Python program from a file with optional input data
     * 
     * @param pythonFilePath Path to the Python file to execute
     * @param inputData Input data to provide to the program (can be null)
     * @return ExecutionResult containing output, error, and status
     */
    public ExecutionResult executePython(String pythonFilePath, String inputData) {
        ExecutionResult result = new ExecutionResult();
        
        try {
            // Build the command to execute Python
            ProcessBuilder processBuilder = new ProcessBuilder("python3", pythonFilePath);
            processBuilder.redirectErrorStream(true); // Merge stderr into stdout for simpler reading
            
            // Start the process
            Process process = processBuilder.start();
            
            // Write input data to the process if provided, then close the stream
            OutputStream processInput = process.getOutputStream();
            if (inputData != null && !inputData.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(processInput, StandardCharsets.UTF_8))) {
                    writer.write(inputData);
                    writer.flush();
                }
            }
            // Always close the input stream to signal end of input (prevents hanging)
            processInput.close();
            
            // Read output from the process (stdout + stderr merged)
            StringBuilder output = new StringBuilder();
            
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            // Wait for process to complete with timeout
            boolean finished = process.waitFor(EXECUTION_TIMEOUT, TimeUnit.SECONDS);
            
            if (!finished) {
                process.destroyForcibly();
                result.setStatus(false);
                result.setError("Execution timed out after " + EXECUTION_TIMEOUT + " seconds");
                return result;
            }
            
            // Check exit code
            int exitCode = process.exitValue();
            
            String outputText = output.toString().trim();
            
            if (exitCode == 0) {
                // Success
                result.setStatus(true);
                result.setOutput(outputText);
            } else {
                // Error occurred - output may contain error messages
                result.setStatus(false);
                result.setError(outputText.length() > 0 ? outputText : 
                               "Program exited with code: " + exitCode);
                result.setOutput(""); // Clear output on error
            }
            
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("IO Error: " + e.getMessage());
        } catch (InterruptedException e) {
            result.setStatus(false);
            result.setError("Execution interrupted: " + e.getMessage());
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            result.setStatus(false);
            result.setError("Unexpected error: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Executes arbitrary Python code provided as a string
     * Creates a temporary file, executes it, and cleans up
     * 
     * @param pythonCode The Python code to execute
     * @param inputData Optional input data to provide to the program (can be null)
     * @return ExecutionResult containing output, error, and status
     */
    public ExecutionResult executePythonCode(String pythonCode, String inputData) {
        ExecutionResult result = new ExecutionResult();
        Path tempFile = null;
        
        try {
            // Validate input
            if (pythonCode == null || pythonCode.trim().isEmpty()) {
                result.setStatus(false);
                result.setError("Python code cannot be empty");
                return result;
            }
            
            // Create a temporary file
            tempFile = Files.createTempFile("python_exec_", ".py");
            
            // Write Python code to the temporary file
            Files.write(tempFile, pythonCode.getBytes(StandardCharsets.UTF_8));
            
            // Execute the temporary file
            result = executePython(tempFile.toAbsolutePath().toString(), inputData);
            
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to create temporary file: " + e.getMessage());
        } finally {
            // Clean up: delete the temporary file
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    // Log but don't fail - temp file cleanup is best effort
                    System.err.println("Warning: Failed to delete temporary file: " + tempFile);
                }
            }
        }
        
        return result;
    }
}
