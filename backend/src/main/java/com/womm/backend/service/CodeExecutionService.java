package com.womm.backend.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeExecutionService {

    private static final int TIMEOUT_SECONDS = 10;

    public ExecutionResult execute(String base64Code, String fileName, String input, String inputFileBase64, String inputFileName) {
        String tempDir = System.getProperty("java.io.tmpdir");
        String uniqueId = UUID.randomUUID().toString().replace("-", "");
        Path workDir = Paths.get(tempDir, "codehawk_" + uniqueId);

        try {
            Files.createDirectories(workDir);
            byte[] codeBytes = Base64.getDecoder().decode(base64Code);
            String code = new String(codeBytes);
            String extension = getExtension(fileName);
            Path codeFile = workDir.resolve(fileName);
            Files.writeString(codeFile, code);

            // Write input file to work directory if provided
            if (inputFileBase64 != null && !inputFileBase64.isEmpty() && inputFileName != null) {
                byte[] fileBytes = Base64.getDecoder().decode(inputFileBase64);
                Files.write(workDir.resolve(inputFileName), fileBytes);
            }

            if (extension.equals("java")) {
                return executeJava(workDir, fileName, input);
            } else if (extension.equals("py")) {
                return executePython(workDir, fileName, input);
            } else {
                return new ExecutionResult("", "Unsupported file type: " + extension, -1);
            }
        } catch (Exception e) {
            return new ExecutionResult("", "Execution error: " + e.getMessage(), -1);
        } finally {
            deleteDirectory(workDir);
        }
    }

    // Keep old signature for backward compatibility
    public ExecutionResult execute(String base64Code, String fileName, String input) {
        return execute(base64Code, fileName, input, null, null);
    }

    private ExecutionResult executeJava(Path workDir, String fileName, String input) throws Exception {
        // Compile
        ProcessBuilder compileBuilder = new ProcessBuilder("javac", fileName);
        compileBuilder.directory(workDir.toFile());
        compileBuilder.redirectErrorStream(true);
        Process compileProcess = compileBuilder.start();
        String compileOutput = readStream(compileProcess.getInputStream());
        compileProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (compileProcess.exitValue() != 0) {
            return new ExecutionResult("", "Compilation error:\n" + compileOutput, compileProcess.exitValue());
        }

        // Run - class name is filename without .java
        String className = fileName.replace(".java", "");
        ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", className);
        runBuilder.directory(workDir.toFile());
        Process runProcess = runBuilder.start();

        // Feed input
        if (input != null && !input.isEmpty()) {
            try (OutputStream stdin = runProcess.getOutputStream()) {
                stdin.write(input.getBytes());
                stdin.flush();
            }
        }

        String stdout = readStream(runProcess.getInputStream());
        String stderr = readStream(runProcess.getErrorStream());
        boolean finished = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (!finished) {
            runProcess.destroyForcibly();
            return new ExecutionResult("", "Time limit exceeded", -1);
        }

        return new ExecutionResult(stdout.trim(), stderr.trim(), runProcess.exitValue());
    }

    private ExecutionResult executePython(Path workDir, String fileName, String input) throws Exception {
        ProcessBuilder runBuilder = new ProcessBuilder("python3", fileName);
        runBuilder.directory(workDir.toFile());
        Process runProcess = runBuilder.start();

        if (input != null && !input.isEmpty()) {
            try (OutputStream stdin = runProcess.getOutputStream()) {
                stdin.write(input.getBytes());
                stdin.flush();
            }
        }

        String stdout = readStream(runProcess.getInputStream());
        String stderr = readStream(runProcess.getErrorStream());
        boolean finished = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (!finished) {
            runProcess.destroyForcibly();
            return new ExecutionResult("", "Time limit exceeded", -1);
        }

        return new ExecutionResult(stdout.trim(), stderr.trim(), runProcess.exitValue());
    }

    private String readStream(InputStream stream) throws Exception {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private String getExtension(String fileName) {
        int dot = fileName.lastIndexOf(".");
        return dot >= 0 ? fileName.substring(dot + 1).toLowerCase() : "";
    }

    private void deleteDirectory(Path path) {
        try {
            if (Files.exists(path)) {
                Files.walk(path)
                        .sorted((a, b) -> b.compareTo(a))
                        .forEach(p -> {
                            try { Files.delete(p); } catch (IOException ignored) {}
                        });
            }
        } catch (IOException ignored) {}
    }

    public static class ExecutionResult {
        public final String stdout;
        public final String stderr;
        public final int exitCode;

        public ExecutionResult(String stdout, String stderr, int exitCode) {
            this.stdout = stdout;
            this.stderr = stderr;
            this.exitCode = exitCode;
        }
    }
}