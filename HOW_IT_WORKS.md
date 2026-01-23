# How the Execution Environment Works

## Overview

Yes! The execution environment can:
- ✅ **Receive files** from the backend
- ✅ **Receive text input** (optional) for the program
- ✅ **Run the Python program**
- ✅ **Return results** back to the backend

## Complete Flow

```
┌─────────────┐
│   Backend   │
│  (Spring    │
│   Boot)     │
└──────┬──────┘
       │
       │ 1. POST /api/execute
       │    - file: program.py
       │    - input: "test data" (optional)
       │
       ▼
┌─────────────────────────────┐
│  Execution Environment       │
│  (This Service - Port 8080)  │
│                              │
│  ┌───────────────────────┐  │
│  │ ExecutionController    │  │
│  │ - Receives file        │  │
│  │ - Extracts code        │  │
│  └───────────┬────────────┘  │
│              │                │
│              ▼                │
│  ┌───────────────────────┐  │
│  │ PythonExecutionService│  │
│  │ - Creates temp file    │  │
│  │ - Writes code to file  │  │
│  │ - Executes Python     │  │
│  └───────────┬────────────┘  │
│              │                │
│              ▼                │
│  ┌───────────────────────┐  │
│  │ BackendService        │  │
│  │ - Sends result back   │  │
│  └───────────┬────────────┘  │
└──────────────┼───────────────┘
               │
               │ 2. POST to backend.url
               │    - ExecutionResult JSON
               │
               ▼
┌─────────────┐
│   Backend   │
│  (Receives  │
│   result)   │
└─────────────┘
```

## Step-by-Step Process

### Step 1: Backend Sends Request
**Backend makes HTTP POST request:**
```bash
POST http://localhost:8080/api/execute
Content-Type: multipart/form-data

file: program.py
input: "optional input data"
```

**Example:**
```python
# program.py content:
name = input()
print(f"Hello, {name}!")
```

### Step 2: Execution Environment Receives File
**Location:** `ExecutionController.java` (line 34-37)
- Receives the Python file via `MultipartFile`
- Receives optional input text
- Validates file is `.py` format

### Step 3: Extract Code from File
**Location:** `ExecutionController.java` (line 58)
```java
String code = new String(file.getBytes(), StandardCharsets.UTF_8);
```
- Reads the file content into a string
- Now we have the Python code as text

### Step 4: Create Temporary File
**Location:** `PythonExecutionService.java` (line 122)
```java
tempFile = Files.createTempFile("python_exec_", ".py");
Files.write(tempFile, pythonCode.getBytes(StandardCharsets.UTF_8));
```
- Creates a temporary `.py` file in the system temp directory
- Writes the Python code to this file
- Example: `/tmp/python_exec_1234567890.py`

### Step 5: Execute Python Program
**Location:** `PythonExecutionService.java` (line 30)
```java
ProcessBuilder processBuilder = new ProcessBuilder("python3", pythonFilePath);
Process process = processBuilder.start();
```

**Where code runs:**
- **Python interpreter runs on the SAME SERVER** where this Java application runs
- Uses system's `python3` command
- Creates a **separate OS process** to run Python
- The Python code runs in its own process, isolated from Java

**Input handling:**
```java
if (inputData != null && !inputData.isEmpty()) {
    writer.write(inputData);  // Writes input to Python's stdin
}
```

**Output capture:**
```java
BufferedReader reader = new BufferedReader(
    new InputStreamReader(process.getInputStream()));
// Reads stdout/stderr from Python process
```

### Step 6: Capture Results
**Location:** `PythonExecutionService.java` (line 72-84)
- Reads all output from Python's stdout/stderr
- Checks exit code (0 = success, non-zero = error)
- Creates `ExecutionResult` object:
  ```java
  {
    status: true/false,
    output: "program output",
    error: "error message if any"
  }
  ```

### Step 7: Send Result to Backend
**Location:** `BackendService.java` (line 33-55)
```java
restTemplate.postForEntity(backendUrl, result, String.class);
```
- Makes HTTP POST to backend endpoint
- Sends `ExecutionResult` as JSON
- Backend receives the execution result

### Step 8: Return Result to Caller
**Location:** `ExecutionController.java` (line 77)
- Also returns the result directly to the caller
- So both backend AND original caller get the result

## Where Code is Interpreted and Running

### Python Interpreter Location
- **Runs on the same machine** as the Java application
- Uses the system's installed `python3` command
- **Requires Python 3 to be installed** on the server

### Execution Environment
- **OS Process:** Each Python execution runs in a separate OS process
- **Isolation:** Python code runs isolated from Java application
- **Temporary Files:** Code is written to temp files (auto-deleted after execution)
- **Timeout:** Programs are killed after 10 seconds (configurable)

### Example Execution
```bash
# What happens behind the scenes:
python3 /tmp/python_exec_1234567890.py
# Python interpreter reads the file
# Executes the code
# Output goes to stdout
# Errors go to stderr
```

## Important Points

1. **File Input:** ✅ Receives Python files from backend
2. **Text Input:** ✅ Receives optional input data for the program
3. **Execution:** ✅ Runs Python code using system's python3
4. **Output:** ✅ Captures stdout/stderr
5. **Return:** ✅ Sends result back to backend AND returns to caller
6. **Location:** Python runs on the same server, in separate OS process

## Configuration

**Backend endpoint:** `application.properties`
```properties
backend.url=http://localhost:8081/api/execution/result
```

**Timeout:** `application.properties`
```properties
python.execution.timeout=10  # seconds
```

## Security Considerations

⚠️ **Current Implementation:**
- Runs code in system temp directory
- Uses system's python3 (no sandboxing)
- No resource limits (except timeout)
- **For production, consider:**
  - Docker containers for isolation
  - Resource limits (CPU, memory)
  - Restricted file system access
  - Network restrictions
