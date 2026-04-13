DROP SCHEMA IF EXISTS codehawk_dev;
CREATE DATABASE codehawk_dev;
USE codehawk_dev;

CREATE USER IF NOT EXISTS 'codehawk_user'@'localhost' IDENTIFIED BY 'devpassword123';
GRANT ALL PRIVILEGES ON codehawk_dev.* TO 'codehawk_user'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE users (
    cwid CHAR(8) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_role ENUM('STUDENT', 'FACULTY', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    crn CHAR(5) PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_users (
    course_crn CHAR(5),
    user_cwid CHAR(8),
    PRIMARY KEY (course_crn, user_cwid),
    FOREIGN KEY (course_crn) REFERENCES courses(crn),
    FOREIGN KEY (user_cwid) REFERENCES users(cwid)
);

CREATE TABLE assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_crn CHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    DESCRIPTION TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_crn) REFERENCES courses(crn)
);

CREATE TABLE submissions (
    assignment_id BIGINT NOT NULL,
    user_cwid CHAR(8) NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (assignment_id, user_cwid),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    FOREIGN KEY (user_cwid) REFERENCES users(cwid)
);

CREATE TABLE submission_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_cwid CHAR(8) NOT NULL,
    assignment_id BIGINT NOT NULL,
    file_name VARCHAR(255),
    file_content LONGTEXT,
    file_order INT DEFAULT 0,
    FOREIGN KEY (assignment_id, user_cwid) REFERENCES submissions(assignment_id, user_cwid)
);
-- ============================================================
-- Group Assignments (migration — run against existing DB)
-- ============================================================

ALTER TABLE assignments
    ADD COLUMN group_assignment BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN group_size INT DEFAULT NULL;

CREATE TABLE assignment_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id)
);

CREATE TABLE assignment_group_members (
    group_id BIGINT NOT NULL,
    user_cwid CHAR(8) NOT NULL,
    PRIMARY KEY (group_id, user_cwid),
    FOREIGN KEY (group_id) REFERENCES assignment_groups(id),
    FOREIGN KEY (user_cwid) REFERENCES users(cwid)
);
