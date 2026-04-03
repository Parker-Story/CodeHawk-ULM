# CodeHawk — Backend

The CodeHawk backend is a Spring Boot 4 REST API built with Java 17. It handles authentication, course and assignment management, sandboxed code execution, automated test evaluation, rubric-based grading, and plagiarism detection.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Architecture](#architecture)
- [Code Execution](#code-execution)
- [Grading & Rubrics](#grading--rubrics)
- [Plagiarism Detection](#plagiarism-detection)
- [Data Model](#data-model)

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| Java | 17 | Language |
| Spring Boot | 4.0.1 | Application framework |
| Spring Web MVC | — | REST API |
| Spring Data JPA | — | ORM / data access |
| Hibernate | — | JPA implementation |
| MySQL Connector/J | — | MySQL JDBC driver |
| HikariCP | — | Connection pooling |
| Maven | 3.8+ | Build tool |

---

## Project Structure

```
backend/
└── src/main/
    ├── java/com/womm/backend/
    │   ├── BackendApplication.java       # Main entry point
    │   ├── config/
    │   │   └── CorsConfig.java           # CORS configuration
    │   ├── controller/                   # REST controllers (11)
    │   ├── dto/                          # Request/response DTOs
    │   ├── entity/                       # JPA entity classes (15)
    │   ├── enums/                        # Role, CourseRole enums
    │   ├── id/                           # Composite key classes
    │   ├── repository/                   # Spring Data JPA repositories (15)
    │   └── service/                      # Service interfaces + implementations
    └── resources/
        └── application.yaml              # Application configuration
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.0+ (with schema initialized — see [database/README.MD](../database/README.MD))

### Run

```bash
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

### Build

```bash
mvn package
```

---

## Configuration

All configuration is in [src/main/resources/application.yaml](src/main/resources/application.yaml). Each value supports an environment variable override.

```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/codehawk_dev}
    username: ${DB_USERNAME:codehawk_user}
    password: ${DB_PASSWORD}   # Required — set in your environment or .env file
  jpa:
    hibernate:
      ddl-auto: validate
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

server:
  port: ${PORT:8080}

python:
  execution:
    timeout: 10        # seconds

frontend:
  url: ${FRONTEND_URL:http://localhost:3000}
```

| Environment Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/codehawk_dev` | JDBC connection URL |
| `DB_USERNAME` | `codehawk_user` | Database username |
| `DB_PASSWORD` | — | **Required.** Set in your environment or a local `.env` file. Never commit this value. |
| `PORT` | `8080` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | Allowed CORS origin |

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| POST | `/api/auth/login` | Log in | `{ email, password }` |
| POST | `/api/auth/register` | Register new user | `RegisterRequest` |

### Users — `/api/users`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users` | Create user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

### Courses — `/course`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/course/{userId}` | Create course (sets creator as FACULTY) |
| GET | `/course` | Get all courses |
| GET | `/course/{crn}` | Get course by CRN |
| GET | `/course/user/{userId}` | Get courses for a user |
| PUT | `/course` | Update course |
| DELETE | `/course/{crn}` | Delete course |

### Course Enrollment — `/courseUser`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/courseUser/add/{crn}/{cwid}` | Add user to course |
| POST | `/courseUser/enroll/{code}/{cwid}` | Enroll via enrollment code |
| GET | `/courseUser/roster/{crn}` | Get all users in a course |
| GET | `/courseUser/user/{userId}` | Get courses for a user |
| PUT | `/courseUser/promote-ta/{crn}/{userId}` | Promote user to TA |
| PUT | `/courseUser/demote-ta/{crn}/{userId}` | Demote TA to student |
| DELETE | `/courseUser/{userId}/{courseCrn}` | Remove user from course |

### Assignments — `/assignment`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/assignment/course/{crn}` | Create assignment for a course |
| GET | `/assignment/{id}` | Get assignment by ID |
| GET | `/assignment/course/{crn}` | Get all assignments for a course |
| PUT | `/assignment` | Update assignment |
| DELETE | `/assignment/{id}` | Delete assignment (cascades all related data) |

### Submissions — `/submission`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/submission/submit/{assignmentId}/{userId}` | Submit assignment (runs tests automatically) |
| GET | `/submission/{userId}/{assignmentId}` | Get a specific submission |
| GET | `/submission/assignment/{assignmentId}` | Get all submissions for an assignment |
| PUT | `/submission/score/{assignmentId}/{userId}` | Manually set score |
| PUT | `/submission/feedback/{assignmentId}/{userId}` | Save feedback |
| DELETE | `/submission/{userId}/{assignmentId}` | Delete submission |

### Test Cases — `/testcase`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/testcase/assignment/{assignmentId}` | Create test case |
| GET | `/testcase/assignment/{assignmentId}` | Get all test cases |
| GET | `/testcase/assignment/{assignmentId}/visible` | Get visible (non-hidden) test cases |
| POST | `/testcase/run/{assignmentId}/{userId}` | Run tests for a submission |
| GET | `/testcase/results/{assignmentId}/{userId}` | Get test results for a submission |
| GET | `/testcase/results/assignment/{assignmentId}` | Get all results for an assignment |
| DELETE | `/testcase/{id}` | Delete test case |

### Test Suites — `/testsuite`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/testsuite/user/{userId}` | Create a test suite |
| GET | `/testsuite/user/{userId}` | Get all suites for a user |
| GET | `/testsuite/{id}` | Get suite by ID |
| DELETE | `/testsuite/{id}` | Delete suite |
| POST | `/testsuite/{suiteId}/case` | Add test case to suite |
| GET | `/testsuite/{suiteId}/cases` | Get all cases in suite |
| POST | `/testsuite/{suiteId}/import/{assignmentId}` | Import suite into an assignment |
| DELETE | `/testsuite/case/{caseId}` | Delete a case from suite |

### Rubrics — `/rubric`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/rubric/user/{userId}` | Create rubric |
| GET | `/rubric/user/{userId}` | Get rubrics for a user |
| GET | `/rubric/{id}` | Get rubric by ID |
| PUT | `/rubric/{id}` | Update rubric |
| POST | `/rubric/{id}/copy` | Deep copy a rubric |
| DELETE | `/rubric/{id}` | Delete rubric |
| POST | `/rubric/{rubricId}/criteria` | Add criteria to rubric |
| DELETE | `/rubric/criteria/{criteriaId}` | Delete criteria |
| POST | `/rubric/criteria/{criteriaId}/item` | Add item to criteria |
| DELETE | `/rubric/item/{itemId}` | Delete item |
| POST | `/rubric/assign/{rubricId}/assignment/{assignmentId}` | Attach rubric to assignment |
| DELETE | `/rubric/assign/assignment/{assignmentId}` | Detach rubric from assignment |
| GET | `/rubric/assignment/{assignmentId}` | Get rubric for assignment |
| PUT | `/rubric/item-testcases/{itemId}/{assignmentId}` | Link test cases to rubric item |
| GET | `/rubric/item-testcases/{itemId}/{assignmentId}` | Get linked test cases |
| POST | `/rubric/scores/{assignmentId}/{userId}` | Save rubric item score |
| GET | `/rubric/scores/{assignmentId}/{userId}` | Get rubric scores for submission |
| POST | `/rubric/autograde/{assignmentId}/{userId}` | Auto-grade a submission |
| GET | `/rubric/totalscore/{assignmentId}/{userId}` | Get total score (weighted or flat) |

### Code Execution — `/api/execute`

| Method | Endpoint | Description | Request |
|---|---|---|---|
| POST | `/api/execute` | Execute a Python file | `multipart/form-data`: `file` (.py), `input` (optional stdin) |

### Plagiarism — `/plagiarism`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/plagiarism/check/{assignmentId}` | Run plagiarism check across all submissions |

---

## Architecture

The backend follows a layered architecture:

```
Controller → Service (Interface + Impl) → Repository → Database
```

- **Controllers** handle HTTP routing and request/response mapping.
- **Services** contain all business logic. Each domain has an interface and an implementation class.
- **Repositories** extend Spring Data JPA and include custom `@Query` methods where needed.
- **Entities** are JPA-mapped domain objects.
- **DTOs** are used for auth requests/responses and execution results.

### CORS

Configured in `CorsConfig.java` to allow requests from `${frontend.url}` with credentials. Allowed methods: `GET`, `POST`, `PUT`, `DELETE`.

---

## Code Execution

Submitted code is executed in an isolated temporary directory with a 10-second timeout.

### Submission Flow

1. Student submits a file via `/submission/submit/{assignmentId}/{userId}`
2. The submission is saved with the file name and base64-encoded content
3. All test cases for the assignment are run in parallel
4. Each test case:
   - Decodes the submission code
   - Writes it to `/tmp/codehawk_<UUID>/`
   - Runs the code with the test case input (STDIN or FILE mode)
   - Compares actual output to expected output
   - Records a `TestResult` (pass/fail)
5. Submission score is calculated: `(passed / total) × 100`
6. If a rubric with `autoGrade` items is attached, auto-grading runs immediately

### Supported Languages

| Language | Execution | Notes |
|---|---|---|
| Python | `python3 <file>` | Temp file created, executed, cleaned up |
| Java | `javac` → `java` | Compiled first; compilation errors returned as stderr |

### Execution Result

```json
{
  "status": true,
  "output": "Hello, World!\n",
  "error": ""
}
```

### Direct Execution (`/api/execute`)

Accepts a `.py` file upload and optional stdin string. Validates the file extension, executes it via `PythonExecutionService`, and returns the result.

---

## Grading & Rubrics

Rubrics are structured as: **Rubric → Criteria → Items**

- A **Rubric** can be weighted or unweighted and is created independently by faculty before being attached to an assignment.
- **Criteria** are categories within a rubric (e.g., "Correctness"), each with an optional weight.
- **Items** are individual scoring checkpoints within a criterion, each with `maxPoints` and an optional `autoGrade` flag.

### Auto-Grading

When `autoGrade=true` on a rubric item:
- The item is linked to one or more test cases
- After submission, the system calculates: `(passed linked tests / total linked tests) × maxPoints`
- The score is saved automatically as a `RubricScore`

### Weighted Scoring

When `weighted=true` on a rubric:
- Each criterion's score is normalized to its weight percentage
- Final score = sum of `(criteriaScore / criteriaTotalPoints) × weight` for all criteria

### Rubric Reuse

Faculty can copy an existing rubric (`POST /rubric/{id}/copy`) — the copy is a full deep clone including all criteria and items.

---

## Plagiarism Detection

The plagiarism check (`GET /plagiarism/check/{assignmentId}`) compares all submissions for an assignment pairwise using **Jaccard similarity** on tokenized source code.

- Code is tokenized (whitespace/punctuation normalized)
- Each pair of submissions gets a similarity score between 0 and 1
- Results are returned as a list of `{ studentA, studentB, similarity }` objects for faculty/TA review

---

## Data Model

### Entities

| Entity | Primary Key | Description |
|---|---|---|
| `User` | `id` (UUID) | All user accounts |
| `Course` | `crn` (CHAR 5) | Course records |
| `CourseUser` | `(userId, courseCrn)` | Course enrollment with role |
| `Assignment` | `id` (BIGINT) | Assignments per course |
| `Submission` | `(userId, assignmentId)` | Student submissions |
| `TestCase` | `id` (BIGINT) | Test cases per assignment |
| `TestResult` | `id` (BIGINT) | Execution result per test per submission |
| `TestSuite` | `id` (BIGINT) | Reusable test case collections |
| `TestSuiteCase` | `id` (BIGINT) | Individual cases within a suite |
| `Rubric` | `id` (BIGINT) | Grading rubrics |
| `RubricCriteria` | `id` (BIGINT) | Criteria within a rubric |
| `RubricItem` | `id` (BIGINT) | Scoring items within criteria |
| `RubricScore` | `id` (BIGINT) | Awarded points per item per submission |
| `AssignmentRubric` | `assignmentId` | Links a rubric to an assignment |
| `AssignmentRubricItemTestCase` | `id` (BIGINT) | Links test cases to rubric items |

### Enums

**`Role`** — `STUDENT`, `FACULTY`, `TA`, `ADMIN`

**`CourseRole`** — `STUDENT`, `TA`, `FACULTY`

### DTOs

| DTO | Fields |
|---|---|
| `LoginRequest` | `email`, `password` |
| `LoginResponse` | `success`, `id`, `cwid`, `firstName`, `lastName`, `role`, `email` |
| `RegisterRequest` | `cwid`, `firstName`, `lastName`, `email`, `password`, `role` |
| `ExecutionResult` | `status`, `output`, `error` |
