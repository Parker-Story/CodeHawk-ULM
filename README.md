# CodeHawk — Automated Grading System

CodeHawk is a secure, web-based automated grading platform designed for programming courses. It streamlines assignment management, code execution, grading, plagiarism detection, and reporting for **students, faculty, and teaching assistants (TAs)**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Overview](#api-overview)
- [Contributing](#contributing)

---

## Overview

CodeHawk reduces faculty grading overhead by automating code submission, test execution, and rubric-based scoring. Students receive instant feedback on their submissions, TAs can review and grade within a scoped interface, and faculty retain full control over course and assignment management.

**Key goals:**
- Reduce faculty grading time by at least 50%
- Provide students with instant automated feedback
- Support exportable reports compatible with external LMS platforms (e.g., Canvas)
- Ensure secure, sandboxed code execution with full audit trails

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TailwindCSS 4 |
| Backend | Spring Boot 4, Java 17, Spring Data JPA |
| Database | MySQL 8.0+ |
| Build Tools | Maven (backend), npm (frontend) |
| Code Execution | Python 3 (sandboxed, 10s timeout) |
| Icons / UI | Lucide React, React Big Calendar, date-fns |

---

## Project Structure

```
CodeHawk-ULM/
├── frontend/       # Next.js web application (student, faculty, TA portals)
├── backend/        # Spring Boot REST API (auth, grading, execution, courses)
├── database/       # MySQL schema and initialization scripts
├── ai/             # Plagiarism and AI-generated code detection modules
└── docs/           # Business requirements and technical documentation
```

Each folder contains its own `README.md` with details specific to that layer.

---

## Features

### Code Submission & Execution
- Students submit `.py` files or paste code directly
- Sandboxed Python execution with a 10-second timeout
- Automatic test case evaluation against faculty-defined test suites
- Instant feedback on public test results

### Grading & Rubrics
- Faculty define weighted or unweighted rubrics
- TAs grade submissions within a structured workspace
- Supports individual and group assignment grading modes
- Manual score and feedback entry per submission

### Plagiarism & AI Detection
- Per-assignment plagiarism reports for faculty and TA review
- AI-generated code detection integration

### Course & Assignment Management
- CRN-based course creation and enrollment
- Assignments with due dates, descriptions, starter code, and visibility settings
- Calendar view for upcoming deadlines (all roles)
- Archiving support for completed courses

### Reporting & Export
- Grade reports per assignment and course
- LMS-compatible export format (e.g., Canvas)
- Institution-level analytics accessible to faculty

---

## User Roles

### Student
- Log in and access enrolled courses
- Submit code and run against public test cases
- View grades, feedback, and grading reports
- Participate in group assignments

### Faculty
- Create and manage courses and assignments
- Define rubrics (weighted/unweighted) and test suites
- Assign and remove TAs from courses
- Select grading mode (individual or group)
- View plagiarism/AI reports and export analytics

### Teaching Assistant (TA)
- Access only courses they are assigned to
- Review submissions and provide grades and feedback
- View plagiarism and AI-detection reports
- Export LMS-compatible reports for assigned courses
- Cannot create, modify, or delete courses or assignments
- Cannot access institution-level analytics

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Python 3.x

### 1. Database Setup

```bash
mysql -u root -p < database/schema/codehawk_initial_schema.sql
```

### 2. Backend

```bash
cd backend
# Configure database credentials in src/main/resources/application.yaml
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

---

## Environment Configuration

**Backend** — [backend/src/main/resources/application.yaml](backend/src/main/resources/application.yaml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/codehawk_dev
    username: codehawk_user
    password: <your-password>
```

**Frontend** — create a `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/course/{userId}` | Create a course (faculty) |
| GET | `/course/user/{userId}` | Get user's courses |
| POST | `/submission/submit/{assignmentId}/{userId}` | Submit assignment |
| GET | `/submission/{userId}/{assignmentId}` | Get submission details |
| PUT | `/submission/score/{assignmentId}/{userId}` | Score a submission |
| PUT | `/submission/feedback/{assignmentId}/{userId}` | Add feedback |
| POST | `/api/execute` | Execute Python code (sandboxed) |
| GET | `/plagiarism/check/{assignmentId}` | Run plagiarism check |
| POST | `/rubric` | Create a rubric |

Full API documentation is available in [docs/](docs/).

---

## Contributing

1. Create a branch off `main` using the convention `type/short-description`
   - e.g., `feat/group-grading`, `fix/submission-timeout`, `docs/add-readmes`
2. Make your changes and open a pull request against `main`
3. Ensure the backend builds (`mvn package`) and the frontend lints (`npm run lint`) before submitting
