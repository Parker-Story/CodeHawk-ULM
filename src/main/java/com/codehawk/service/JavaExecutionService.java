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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class JavaExecutionService {

    private static final Pattern PUBLIC_CLASS_PATTERN = Pattern.compile("public\\s+class\\s+(\\w+)");
    private static final Pattern MAIN_METHOD_PATTERN = Pattern.compile("public\\s+static\\s+void\\s+main\\s*\\(");
    private static final String CONTAINER_APP_DIR = "/app";

    @Value("${java.execution.timeout:10}")
    private int executionTimeoutSeconds;

    @Value("${java.execution.docker.image:eclipse-temurin:17}")
    private String dockerImage;

    @Value("${java.execution.docker.memory:128m}")
    private String dockerMemory;

    @Value("${java.execution.docker.network:none}")
    private String dockerNetwork;

    public ExecutionResult executeJavaCode(String javaCode, String inputData) {
        ExecutionResult result = new ExecutionResult();
        Path tempDir = null;

        try {
            if (javaCode == null || javaCode.trim().isEmpty()) {
                result.setStatus(false);
                result.setError("Java code cannot be empty");
                return result;
            }

            String className = extractPublicClassName(javaCode);
            if (className == null) {
                result.setStatus(false);
                result.setError("No public class found. Provide a single public class (e.g. public class Main { ... }).");
                return result;
            }

            tempDir = Files.createTempDirectory("java_exec_");
            Path javaFile = tempDir.resolve(className + ".java");
            Files.write(javaFile, javaCode.getBytes(StandardCharsets.UTF_8));

            result = executeJavaViaDocker(tempDir, className, inputData);
        } catch (IOException e) {
            result.setStatus(false);
            result.setError("Failed to create temporary file: " + e.getMessage());
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

    public ExecutionResult executeJavaCode(List<SubmissionFile> files, String mainClass, String inputData) {
        ExecutionResult result = new ExecutionResult();
        Path tempDir = null;

        try {
            if (files == null || files.isEmpty()) {
                result.setStatus(false);
                result.setError("No Java files provided");
                return result;
            }

            tempDir = Files.createTempDirectory("java_exec_");
            List<String> javaNames = new ArrayList<>();
            for (SubmissionFile f : files) {
                String name = f.getFilename();
                if (name == null || !name.toLowerCase().endsWith(".java")) continue;
                Path p = tempDir.resolve(name);
                Files.write(p, (f.getContent() != null ? f.getContent() : "").getBytes(StandardCharsets.UTF_8));
                javaNames.add(name);
            }
            if (javaNames.isEmpty()) {
                result.setStatus(false);
                result.setError("No .java files in submission");
                return result;
            }

            String runClass = mainClass;
            if (runClass == null || runClass.isBlank()) {
                runClass = detectMainClass(files);
                if (runClass == null) {
                    result.setStatus(false);
                    result.setError("No class with public static void main found; set mainClass in submission.");
                    return result;
                }
            }

            result = executeJavaMultiFileViaDocker(tempDir, runClass, inputData);
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

    private String detectMainClass(List<SubmissionFile> files) {
        for (SubmissionFile f : files) {
            String content = f.getContent();
            if (content == null) continue;
            if (!MAIN_METHOD_PATTERN.matcher(content).find()) continue;
            Matcher m = PUBLIC_CLASS_PATTERN.matcher(content);
            if (m.find()) return m.group(1);
        }
        return null;
    }

    private ExecutionResult executeJavaMultiFileViaDocker(Path hostDir, String mainClass, String inputData) {
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
        command.add("cd " + CONTAINER_APP_DIR + " && javac *.java && java " + mainClass + " 2>&1");

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        ExecutionResult result = new ExecutionResult();
        Process process = null;
        try {
            process = processBuilder.start();
            writeInputAndCaptureOutput(process, inputData, result, executionTimeoutSeconds, () -> {
                killDockerContainer(containerName);
                result.setStatus(false);
                result.setError("Execution timed out after " + executionTimeoutSeconds + " seconds");
            });

            if (result.getError() != null && result.getError().contains("timed out")) {
                return result;
            }

            int exitCode = process.exitValue();
            String outputText = result.getOutput() != null ? result.getOutput().trim() : "";
            if (exitCode == 0) {
                result.setStatus(true);
                result.setOutput(outputText);
            } else {
                result.setStatus(false);
                result.setError(outputText.length() > 0 ? outputText : "Program exited with code: " + exitCode);
                result.setOutput("");
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

    private String extractPublicClassName(String javaCode) {
        Matcher m = PUBLIC_CLASS_PATTERN.matcher(javaCode);
        return m.find() ? m.group(1) : null;
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

    private ExecutionResult executeJavaViaDocker(Path hostDir, String className, String inputData) {
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
        command.add("cd " + CONTAINER_APP_DIR + " && javac " + className + ".java && java " + className + " 2>&1");

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        Process process = null;
        try {
            process = processBuilder.start();

            writeInputAndCaptureOutput(process, inputData, result, executionTimeoutSeconds, () -> {
                killDockerContainer(containerName);
                result.setStatus(false);
                result.setError("Execution timed out after " + executionTimeoutSeconds + " seconds");
            });

            if (result.getError() != null && result.getError().contains("timed out")) {
                return result;
            }

            int exitCode = process.exitValue();
            String outputText = result.getOutput() != null ? result.getOutput().trim() : "";
            if (exitCode == 0) {
                result.setStatus(true);
                result.setOutput(outputText);
            } else {
                result.setStatus(false);
                result.setError(outputText.length() > 0 ? outputText : "Program exited with code: " + exitCode);
                result.setOutput("");
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

    private void killDockerContainer(String containerName) {
        try {
            new ProcessBuilder("docker", "kill", containerName)
                    .redirectErrorStream(true)
                    .start()
                    .waitFor(5, TimeUnit.SECONDS);
        } catch (Exception ignored) {
        }
    }

    private void writeInputAndCaptureOutput(Process process, String inputData, ExecutionResult result,
                                            int timeoutSeconds, Runnable onTimeout) throws IOException, InterruptedException {
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

        boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
        String outputText = output.toString().trim();
        result.setOutput(outputText);

        if (!finished) {
            process.destroyForcibly();
            onTimeout.run();
        }
    }
}
