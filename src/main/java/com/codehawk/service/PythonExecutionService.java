package com.codehawk.service;

import com.codehawk.dto.ExecutionResult;
import com.codehawk.dto.SubmissionFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class PythonExecutionService {

    @Value("${python.execution.timeout:10}")
    private int executionTimeoutSeconds;

    @Value("${python.execution.docker.image:python:3-slim}")
    private String dockerImage;

    @Value("${python.execution.docker.memory:128m}")
    private String dockerMemory;

    @Value("${python.execution.docker.network:none}")
    private String dockerNetwork;

    private static final String CONTAINER_CODE_PATH = "/app/code.py";
    private static final String CONTAINER_APP_DIR = "/app";

    public ExecutionResult executePython(String pythonFilePath, String inputData) {
        return executePythonViaDocker(pythonFilePath, inputData);
    }

    private ExecutionResult executePythonViaDocker(String pythonFilePath, String inputData) {
        ExecutionResult result = new ExecutionResult();
        String containerName = "exec_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");
        command.add("--name");
        command.add(containerName);
        command.add("-i");
        command.add("--memory=" + dockerMemory);
        command.add("--network=" + dockerNetwork);
        command.add("-v");
        command.add(pythonFilePath + ":" + CONTAINER_CODE_PATH + ":ro");
        command.add(dockerImage);
        command.add("sh");
        command.add("-c");
        command.add("python3 " + CONTAINER_CODE_PATH + " 2>&1");

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = null;
        try {
            process = processBuilder.start();

            OutputStream processInput = process.getOutputStream();
            if (inputData != null && !inputData.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(processInput, StandardCharsets.UTF_8))) {
                    writer.write(inputData);
                    writer.flush();
                }
            }
            processInput.close();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(executionTimeoutSeconds, TimeUnit.SECONDS);

            if (!finished) {
                killDockerContainer(containerName);
                result.setStatus(false);
                result.setError("Execution timed out after " + executionTimeoutSeconds + " seconds");
                return result;
            }

            int exitCode = process.exitValue();
            String outputText = output.toString().trim();

            if (exitCode == 0) {
                result.setStatus(true);
                result.setOutput(outputText);
            } else {
                result.setStatus(false);
                result.setError(outputText.length() > 0 ? outputText : "Program exited with code: " + exitCode);
            }
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Docker execution error: " + e.getMessage());
        } catch (InterruptedException e) {
            if (process != null) {
                process.destroyForcibly();
            }
            killDockerContainer(containerName);
            result.setStatus(false);
            result.setError("Execution interrupted: " + e.getMessage());
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            result.setStatus(false);
            result.setError("Unexpected error: " + e.getMessage());
        }

        return result;
    }

    private void killDockerContainer(String containerName) {
        try {
            new ProcessBuilder("docker", "kill", containerName)
                    .redirectErrorStream(true)
                    .start()
                    .waitFor(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            // best effort; container may already be gone
        }
    }

    public ExecutionResult executePythonCode(List<SubmissionFile> files, String entryPoint, String inputData) {
        ExecutionResult result = new ExecutionResult();
        Path tempDir = null;

        try {
            if (files == null || files.isEmpty()) {
                result.setStatus(false);
                result.setError("No Python files provided");
                return result;
            }

            tempDir = Files.createTempDirectory("python_exec_");
            String runScript = null;
            for (SubmissionFile f : files) {
                String name = f.getFilename();
                if (name == null) continue;
                Path p = tempDir.resolve(name);
                Files.write(p, (f.getContent() != null ? f.getContent() : "").getBytes(StandardCharsets.UTF_8));
                if (name.toLowerCase().endsWith(".py") && runScript == null) {
                    runScript = name;
                }
            }

            if (entryPoint != null && !entryPoint.isBlank()) {
                runScript = entryPoint;
            } else if (runScript == null) {
                result.setStatus(false);
                result.setError("No .py file found in submission");
                return result;
            }

            result = executePythonMultiFileViaDocker(tempDir, runScript, inputData);
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to write files: " + e.getMessage());
        } finally {
            if (tempDir != null) {
                try {
                    deleteRecursively(tempDir);
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete temp dir: " + tempDir);
                }
            }
        }

        return result;
    }

    private void deleteRecursively(Path path) throws IOException {
        if (Files.isDirectory(path)) {
            try (var stream = Files.list(path)) {
                for (Path p : stream.toList()) {
                    deleteRecursively(p);
                }
            }
        }
        Files.deleteIfExists(path);
    }

    private ExecutionResult executePythonMultiFileViaDocker(Path hostDir, String entryScript, String inputData) {
        ExecutionResult result = new ExecutionResult();
        String containerName = "exec_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String hostPath = hostDir.toAbsolutePath().toString();

        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");
        command.add("--name");
        command.add(containerName);
        command.add("-i");
        command.add("--memory=" + dockerMemory);
        command.add("--network=" + dockerNetwork);
        command.add("-v");
        command.add(hostPath + ":" + CONTAINER_APP_DIR);
        command.add(dockerImage);
        command.add("sh");
        command.add("-c");
        command.add("cd " + CONTAINER_APP_DIR + " && python3 " + entryScript + " 2>&1");

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = null;
        try {
            process = processBuilder.start();

            OutputStream processInput = process.getOutputStream();
            if (inputData != null && !inputData.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(processInput, StandardCharsets.UTF_8))) {
                    writer.write(inputData);
                    writer.flush();
                }
            }
            processInput.close();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            boolean finished = process.waitFor(executionTimeoutSeconds, TimeUnit.SECONDS);

            if (!finished) {
                killDockerContainer(containerName);
                result.setStatus(false);
                result.setError("Execution timed out after " + executionTimeoutSeconds + " seconds");
                return result;
            }

            int exitCode = process.exitValue();
            String outputText = output.toString().trim();

            if (exitCode == 0) {
                result.setStatus(true);
                result.setOutput(outputText);
            } else {
                result.setStatus(false);
                result.setError(outputText.length() > 0 ? outputText : "Program exited with code: " + exitCode);
            }
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Docker execution error: " + e.getMessage());
        } catch (InterruptedException e) {
            if (process != null) process.destroyForcibly();
            killDockerContainer(containerName);
            result.setStatus(false);
            result.setError("Execution interrupted: " + e.getMessage());
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            result.setStatus(false);
            result.setError("Unexpected error: " + e.getMessage());
        }

        return result;
    }

    public ExecutionResult executePythonCode(String pythonCode, String inputData) {
        ExecutionResult result = new ExecutionResult();
        Path tempFile = null;

        try {
            if (pythonCode == null || pythonCode.trim().isEmpty()) {
                result.setStatus(false);
                result.setError("Python code cannot be empty");
                return result;
            }

            tempFile = Files.createTempFile("python_exec_", ".py");
            Files.write(tempFile, pythonCode.getBytes(StandardCharsets.UTF_8));

            result = executePython(tempFile.toAbsolutePath().toString(), inputData);
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to create temporary file: " + e.getMessage());
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    System.err.println("Warning: Failed to delete temporary file: " + tempFile);
                }
            }
        }

        return result;
    }
}
