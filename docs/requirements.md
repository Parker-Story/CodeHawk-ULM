# Business Requirements

---

**Group Name:** The WOMM Collective
**Date:** 02/12/2026
**Project Name:** CodeHawk
**Created By:** Ritika Bajgain
**Version:** 1.1

---

## Executive Summary

- CodeHawk is an automated grading system designed to support students, faculty, and teaching assistant in programming-based courses.
- The system enables secure code submission and testing, AI-generated code and plagiarism detection, flexible rubric-based grading and comprehensive reporting.
- The system accepts multiple programming languages and assists generation and formatting of report to facilitate data transfer.
- The system includes role-based access control model that supports teaching assistant with limited but essential review and grading permissions.

---

## Business Objectives

- Develop a secure and efficient web-based automated grading system that accepts different programming languages by the end of project timeline.
- Increase students' satisfaction with instant automated feedback on submission and reduce faculty's grading time by at least 50% through features such as automated rubric-based grading, AI generated code and plagiarism detection, group grading features, and support from teaching assistant.
- Facilitate generation of report and data export in formats that are compatible with external learning management systems.
- Ensure system security through auditable authentication, authorization, and controlled execution environment.

---

## Needs Statement

- Manually grading the programming assignments is time-consuming and prone to inconsistency.
- It is difficult for students to identify mistakes and improve learning since they don't get immediate feedback.
- Faculty need a centralized system to manage coding assignments, group, rubrics, and grading while maintaining fairness.
- Sometimes faculty may require support from teaching assistants to manage large class, review submissions, provide detailed feedback, and assist with plagiarism monitoring.
- CodeHawk solves these problems by providing a platform for students to get real-time feedback in their programming assignments, an automated grading and easy to manage group assignments system for faculty, and a structured grading and review workflow for teaching assistants under faculty supervision.

---

## Requirements

### Critical Importance

- Secure user (students, faculty, and teaching assistant) authentication and data.
- Student ability to securely test and submit code, and get immediate result based on public test cases.
- Faculty ability to create assignments, define grading rubrics, and manage group for group assignments.
- Teaching Assistant ability to access and review student submissions, grade submissions, provide feedback, and generate and view plagiarism reports.
- AI assisted features like plagiarism detector and AI-generated code detector for faculty and teaching assistant.
- System's ability to accept multiple programming languages.
- Database management for user information, assignments and submissions.
- Exportable reports in format that are compatible with external systems.

### High Importance

- Student ability to access and use starter code provided by the instructor in specific assignment.
- System ability to support both weighted and unweighted rubric.
- Faculty ability to manage group on pre-assignment or reusable basis.
- Faculty ability to choose grading for group assignments, i.e. grading each member individually or grading all members at once.
- Teaching assistant ability to grade group assignments according to faculty-selected grading mode but cannot modify the grading settings.
- Teaching assistant ability to assess and view reporting dashboards limited to assigned courses but cannot export institution-level analytics.
- Support for multiple classes per students or faculty or teaching assistant.
- Reporting dashboards with printable reports at student, assignment, and class levels.

### Medium Importance

- Mobile-responsive web interface for accessibility.
- Allow administrators to add new programming languages to the system.
- Faculty ability to remove or assign teaching assistants from specific classes.

---

## Project Constraints

- Code execution must occur in a sandboxed environment.
- The project must rely on open-source tools.
- All user activity must be auditable.
- The system must comply with institutional security standards.
- Data export and report formatting must be compatible with external learning management tools like Canvas.
- Teaching assistant must not have permission to create, modify, or delete classes and assignments.
