package com.womm.backend.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class CodeExecutionService {

    private static final int TIMEOUT_SECONDS = 10;

    public ExecutionResult execute(String base64Code, String fileName, String input, String inputFileBase64, String inputFileName) {
        return execute(base64Code, fileName, input, inputFileBase64, inputFileName, null);
    }

    public ExecutionResult execute(String base64Code, String fileName, String input, String inputFileBase64, String inputFileName, List<String[]> additionalFiles) {
        String tempDir = System.getProperty("java.io.tmpdir");
        String uniqueId = UUID.randomUUID().toString().replace("-", "");
        Path workDir = Paths.get(tempDir, "codehawk_" + uniqueId);

        try {
            Files.createDirectories(workDir);

            // Write additional files first so they're available during compilation
            if (additionalFiles != null) {
                for (String[] file : additionalFiles) {
                    byte[] fileBytes = Base64.getDecoder().decode(file[1]);
                    Files.write(workDir.resolve(file[0]), fileBytes);
                }
            }

            byte[] codeBytes = Base64.getDecoder().decode(base64Code);
            String code = new String(codeBytes);
            String extension = getExtension(fileName);
            Files.writeString(workDir.resolve(fileName), code);

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
        return execute(base64Code, fileName, input, null, null, null);
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CodeExecutionService.class);

    private ExecutionResult executeJava(Path workDir, String fileName, String input) throws Exception {
        // Compile all .java files in the work directory
        List<String> javaFiles = Files.list(workDir)
                .filter(p -> p.toString().endsWith(".java"))
                .map(p -> p.getFileName().toString())
                .collect(Collectors.toList());
        List<String> compileCmd = new ArrayList<>();
        compileCmd.add("javac");
        compileCmd.addAll(javaFiles);
        ProcessBuilder compileBuilder = new ProcessBuilder(compileCmd);
        compileBuilder.directory(workDir.toFile());
        compileBuilder.redirectErrorStream(true);
        Process compileProcess = compileBuilder.start();
        String compileOutput = readStream(compileProcess.getInputStream());
        compileProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        log.info("CODEHAWK javac exit={} output={}", compileProcess.exitValue(), compileOutput);

        if (compileProcess.exitValue() != 0) {
            return new ExecutionResult("", "Compilation error:\n" + compileOutput, compileProcess.exitValue());
        }

        // Find the class that contains the main method (handles multi-file submissions
        // where the entry point may not be the first uploaded file).
        String entryClassName = findMainClass(workDir, javaFiles);
        if (entryClassName == null) {
            entryClassName = fileName.replace(".java", "");
        }
        ProcessBuilder runBuilder = new ProcessBuilder("java", "-cp", ".", entryClassName);
        runBuilder.directory(workDir.toFile());
        Process runProcess = runBuilder.start();

        // Write stdin FIRST, then close it so the program knows input is done
        if (input != null && !input.isEmpty()) {
            OutputStream stdin = runProcess.getOutputStream();
            stdin.write(input.getBytes());
            stdin.flush();
            stdin.close();
        } else {
            // Close stdin immediately so programs don't hang waiting for input
            runProcess.getOutputStream().close();
        }

        // Now read output concurrently using threads to avoid blocking
        final StringBuilder stdout = new StringBuilder();
        final StringBuilder stderr = new StringBuilder();

        Thread stdoutThread = new Thread(() -> {
            try { stdout.append(readStreamQuiet(runProcess.getInputStream())); } catch (Exception ignored) {}
        });
        Thread stderrThread = new Thread(() -> {
            try { stderr.append(readStreamQuiet(runProcess.getErrorStream())); } catch (Exception ignored) {}
        });

        stdoutThread.start();
        stderrThread.start();

        boolean finished = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        stdoutThread.join(2000);
        stderrThread.join(2000);

        log.info("CODEHAWK java exit={} stdout={} stderr={}", finished ? runProcess.exitValue() : -1, stdout, stderr);

        if (!finished) {
            runProcess.destroyForcibly();
            return new ExecutionResult("", "Time limit exceeded", -1);
        }

        return new ExecutionResult(stdout.toString().trim(), stderr.toString().trim(), runProcess.exitValue());
    }

    /** Scans source files for the one containing {@code public static void main} and returns its class name. */
    private String findMainClass(Path workDir, List<String> javaFileNames) {
        for (String javaFile : javaFileNames) {
            try {
                String source = Files.readString(workDir.resolve(javaFile));
                if (source.contains("public static void main") || source.contains("static public void main")) {
                    return javaFile.replace(".java", "");
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private ExecutionResult executePython(Path workDir, String fileName, String input) throws Exception {
        ProcessBuilder runBuilder = new ProcessBuilder("python3", fileName);
        runBuilder.directory(workDir.toFile());
        Process runProcess = runBuilder.start();

        if (input != null && !input.isEmpty()) {
            OutputStream stdin = runProcess.getOutputStream();
            stdin.write(input.getBytes());
            stdin.flush();
            stdin.close();
        } else {
            runProcess.getOutputStream().close();
        }

        final StringBuilder stdout = new StringBuilder();
        final StringBuilder stderr = new StringBuilder();

        Thread stdoutThread = new Thread(() -> {
            try { stdout.append(readStreamQuiet(runProcess.getInputStream())); } catch (Exception ignored) {}
        });
        Thread stderrThread = new Thread(() -> {
            try { stderr.append(readStreamQuiet(runProcess.getErrorStream())); } catch (Exception ignored) {}
        });

        stdoutThread.start();
        stderrThread.start();

        boolean finished = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        stdoutThread.join(2000);
        stderrThread.join(2000);

        if (!finished) {
            runProcess.destroyForcibly();
            return new ExecutionResult("", "Time limit exceeded", -1);
        }

        return new ExecutionResult(stdout.toString().trim(), stderr.toString().trim(), runProcess.exitValue());
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

    private String readStreamQuiet(InputStream stream) {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        } catch (Exception ignored) {}
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