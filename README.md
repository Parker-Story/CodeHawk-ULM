# CodeHawk Execution Environment

Simple execution environment for running Python programs. Receives files from backend, executes them, and returns results.

## What It Does

1. **Receives** Python file from backend
2. **Executes** the Python program
3. **Sends result** back to backend endpoint
4. **Returns** output and error (also returns to caller)

## API Endpoint

**`POST /api/execute`**

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): Python file (.py)
  - `input` (optional): Input data for the program

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

```bash
curl -X POST http://localhost:8080/api/execute \
  -F "file=@program.py" \
  -F "input=optional input data"
```

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
- Maven
- Python 3

## Running

```bash
mvn clean install
mvn spring-boot:run
```

The service will start on port 8080.
