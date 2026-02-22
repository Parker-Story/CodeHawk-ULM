# CodeHawk Execution Environment

Execution environment for running **Python** and **Java** programs. Receives source files from the backend, runs them in **Docker** containers (isolated, resource-limited), and returns results.

## What It Does

1. **Receives** a Python (.py) or Java (.java) file from the backend
2. **Executes** the program in a Docker container
3. **Sends result** back to the backend endpoint
4. **Returns** output and error to the caller

## API Endpoint

**`POST /api/execute`**

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): Python (.py) or Java (.java) file
  - `input` (optional): Input data for the program (stdin)

## Response Format

```json
{
  "status": true,
  "output": "program output here",
  "error": ""
}
```

On error:
```json
{
  "status": false,
  "output": "",
  "error": "error message here"
}
```

## Example Usage

**Python:**
```bash
curl -X POST http://localhost:8080/api/execute \
  -F "file=@program.py" \
  -F "input=optional input data"
```

**Java:** (source must contain a single `public class`; its name must match the filename or be the first public class)
```bash
curl -X POST http://localhost:8080/api/execute \
  -F "file=@Main.java" \
  -F "input=optional input data"
```

## Grading API (placeholder DB/backend)

Grade a submission by ID: the service fetches the submission and assignment criteria from the backend/DB (placeholder URLs), runs the code against professor-defined test cases, and applies late penalties.

**`POST /api/grade/{submissionId}`**

- Fetches submission (code + language + submittedAt) from `submission.service.url` (placeholder).
- Fetches grading criteria (test cases + due date + late penalty rules) from `assignment.service.url` (placeholder).
- Runs the submitted code with each test input and compares output to expected output.
- Applies late penalty (e.g. X% per day late, with optional grace period and cap).
- Returns a grade result and optionally POSTs it to `grading.result.url` if set.

**Placeholder config** (`application.properties`). Replace when you have real links:

```properties
# Base URL for fetching submissions (e.g. http://localhost:8081)
submission.service.url=http://localhost:8081
# Base URL for fetching assignment criteria
assignment.service.url=http://localhost:8081
# Optional: URL to POST grade results after grading
grading.result.url=http://localhost:8081/api/grades
```

With no backend running, the service returns **dummy** submission and criteria so you can try the grading flow. Expected backend contract (when you add it):

- **GET** `{submission.service.url}/api/submissions/{id}` → `Submission`. Single-file: `code`, `language`, `submittedAt`. Multi-file (4–5 files as one program): `files` (list of `{filename, content}`), `language`, `mainClass` (Java: class with `main`) or `entryPoint` (Python: e.g. `"main.py"`), `submittedAt`. If `files` is present and non-empty, it is used; otherwise `code` is used.
- **GET** `{assignment.service.url}/api/assignments/{assignmentId}/criteria` → `GradingCriteria` (dueAt, testCases[], latePenaltyRule). The **same program is run once per test case** (multiple test case files = multiple entries in `testCases`). Each test case: `id`, optional `label` (e.g. `"test1.in"`), `input`, `expectedOutput`, `points`; or use `inputFileUrl` / `expectedOutputFileUrl` to point to test files (content is fetched and used). Late penalty: gracePeriod, penaltyType `PERCENT_PER_DAY` or `FIXED_PERCENT`, penaltyPercent, maxPenaltyPercent.

## Backend Integration

After execution, results are automatically sent to the backend endpoint configured in `application.properties`:

```properties
backend.url=http://localhost:8081/api/execution/result
```

**TODO:** Update `backend.url` in `application.properties` with your actual backend endpoint URL.

The execution result is sent as JSON:
```json
{
  "status": true,
  "output": "program output",
  "error": ""
}
```

## Requirements

- Java 17+
- Maven (or `./mvnw`)
- **Docker** (required): images `python:3-slim` and `eclipse-temurin:17` are used for execution

## Running

```bash
mvn clean install
mvn spring-boot:run
```

The service will start on port 8080.
