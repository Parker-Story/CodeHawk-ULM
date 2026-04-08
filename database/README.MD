# CodeHawk — Database

This folder contains the MySQL schema and initialization scripts for the CodeHawk automated grading system.

---

## Table of Contents

- [Database Details](#database-details)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Schema Overview](#schema-overview)
- [Tables](#tables)
- [Entity Relationships](#entity-relationships)

---

## Database Details

| Property | Value |
|---|---|
| Engine | MySQL 8.0+ |
| Database name | `codehawk_dev` |
| User | `codehawk_user` |
| Host | `localhost` |
| Default password | `devpassword123` |

> **Note:** The default credentials are for local development only. Use secure credentials in any shared or production environment.

---

## Folder Structure

```
database/
└── schema/
    └── codehawk_initial_schema.sql   # Full database initialization script
```

---

## Setup

Run the initialization script against a local MySQL instance:

```bash
mysql -u root -p < database/schema/codehawk_initial_schema.sql
```

This script will:
1. Drop and recreate the `codehawk_dev` database
2. Create the `codehawk_user` account with local access
3. Grant all privileges on `codehawk_dev` to `codehawk_user`
4. Create all tables

> **Warning:** The script runs `DROP SCHEMA IF EXISTS codehawk_dev` at the top. Running it against an existing database will erase all data.

To verify the setup:

```bash
mysql -u codehawk_user -p codehawk_dev
```

---

## Schema Overview

```
users ─────────────┐
                   │
courses ──── course_users (junction)
    │
    └──── assignments ──── submissions ──── users
```

---

## Tables

### `users`

Stores all user accounts regardless of role.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `cwid` | CHAR(8) | PRIMARY KEY | Campus-wide ID — unique identifier per user |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password |
| `user_role` | ENUM | NOT NULL | One of: `STUDENT`, `FACULTY`, `ADMIN` |
| `created_at` | TIMESTAMP | DEFAULT NOW | Account creation time |

---

### `courses`

Stores course records created by faculty.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `crn` | CHAR(5) | PRIMARY KEY | Course Reference Number — unique per course |
| `course_name` | VARCHAR(255) | NOT NULL | Display name of the course |
| `created_at` | TIMESTAMP | DEFAULT NOW | Course creation time |

---

### `course_users`

Junction table linking users to the courses they are enrolled in or teach.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `course_crn` | CHAR(5) | PK, FK → `courses.crn` | The course |
| `user_cwid` | CHAR(8) | PK, FK → `users.cwid` | The user |

Primary key is the composite `(course_crn, user_cwid)`.

---

### `assignments`

Stores assignments belonging to a course.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Assignment ID |
| `course_crn` | CHAR(5) | NOT NULL, FK → `courses.crn` | The course this assignment belongs to |
| `title` | VARCHAR(255) | NOT NULL | Assignment title |
| `description` | TEXT | | Assignment instructions |
| `created_at` | TIMESTAMP | DEFAULT NOW | Assignment creation time |

---

### `submissions`

Tracks which users have submitted which assignments.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `assignment_id` | BIGINT | PK, FK → `assignments.id` | The assignment |
| `user_cwid` | CHAR(8) | PK, FK → `users.cwid` | The submitting user |
| `submitted_at` | TIMESTAMP | DEFAULT NOW | Submission timestamp |

Primary key is the composite `(assignment_id, user_cwid)`.

---

## Entity Relationships

```
users (cwid)
 ├── course_users.user_cwid     — enrolled in many courses
 └── submissions.user_cwid      — has many submissions

courses (crn)
 ├── course_users.course_crn    — has many enrolled users
 └── assignments.course_crn     — has many assignments

assignments (id)
 └── submissions.assignment_id  — has many submissions
```
