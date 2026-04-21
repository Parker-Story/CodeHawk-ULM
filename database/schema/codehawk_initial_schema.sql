SET NAMES utf8mb4;
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

<<<<<<< HEAD
CREATE DATABASE IF NOT EXISTS `codehawk_dev`
CHARACTER SET utf8mb4
=======
CREATE DATABASE IF NOT EXISTS `codehawk_dev` 
CHARACTER SET utf8mb4 
>>>>>>> origin/main
COLLATE utf8mb4_0900_ai_ci;

USE `codehawk_dev`;

--
<<<<<<< HEAD
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT '',
  `cwid` varchar(8) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_role` enum('STUDENT','FACULTY','ADMIN') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `crn` char(5) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `archived` bit(1) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `course_abbreviation` varchar(255) DEFAULT NULL,
  `course_description` text,
  `days` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`crn`),
  UNIQUE KEY `UK61og8rbqdd2y28rx2et5fdnxd` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `course_users`
--

DROP TABLE IF EXISTS `course_users`;
CREATE TABLE `course_users` (
  `course_crn` char(5) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `course_role` varchar(10) NOT NULL DEFAULT 'STUDENT',
  PRIMARY KEY (`course_crn`,`user_id`),
  FOREIGN KEY (`course_crn`) REFERENCES `courses` (`crn`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignments`
--

=======
-- Table structure for table `assignment_group_members`
--

DROP TABLE IF EXISTS `assignment_group_members`;
CREATE TABLE `assignment_group_members` (
  `group_id` bigint NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`group_id`,`user_id`),
  FOREIGN KEY (`group_id`) REFERENCES `assignment_groups` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_groups`
--

DROP TABLE IF EXISTS `assignment_groups`;
CREATE TABLE `assignment_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_rubric_item_test_cases`
--

DROP TABLE IF EXISTS `assignment_rubric_item_test_cases`;
CREATE TABLE `assignment_rubric_item_test_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `rubric_item_id` bigint NOT NULL,
  `test_case_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_link` (`assignment_id`,`rubric_item_id`,`test_case_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  FOREIGN KEY (`rubric_item_id`) REFERENCES `rubric_items` (`id`),
  FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_rubrics`
--

DROP TABLE IF EXISTS `assignment_rubrics`;
CREATE TABLE `assignment_rubrics` (
  `assignment_id` bigint NOT NULL,
  `rubric_id` bigint NOT NULL,
  PRIMARY KEY (`assignment_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignments`
--

>>>>>>> origin/main
DROP TABLE IF EXISTS `assignments`;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_crn` char(5) NOT NULL,
  `title` varchar(255) NOT NULL,
  `DESCRIPTION` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `scores_visible` tinyint(1) NOT NULL DEFAULT '0',
  `input_mode` varchar(10) NOT NULL DEFAULT 'STDIN',
  `input_file_name` varchar(255) DEFAULT NULL,
  `input_file_content` longtext,
  `due_date` datetime DEFAULT NULL,
  `published` tinyint(1) NOT NULL DEFAULT '1',
  `total_points` int NOT NULL DEFAULT '100',
  `group_assignment` tinyint(1) NOT NULL DEFAULT '0',
  `group_size` int DEFAULT NULL,
<<<<<<< HEAD
  `starter_code` longtext DEFAULT NULL,
=======
>>>>>>> origin/main
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_crn`) REFERENCES `courses` (`crn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
<<<<<<< HEAD
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `assignment_id` bigint NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `file_content` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `feedback` text,
  `ai_probability` double DEFAULT NULL,
  `ai_percentage` double DEFAULT NULL,
  `ai_label` varchar(255) DEFAULT NULL,
  `ai_confidence` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`assignment_id`,`user_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
=======
-- Table structure for table `course_users`
--

DROP TABLE IF EXISTS `course_users`;
CREATE TABLE `course_users` (
  `course_crn` char(5) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `course_role` varchar(10) NOT NULL DEFAULT 'STUDENT',
  PRIMARY KEY (`course_crn`,`user_id`),
  FOREIGN KEY (`course_crn`) REFERENCES `courses` (`crn`),
>>>>>>> origin/main
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
<<<<<<< HEAD
-- Table structure for table `submission_files`
--

DROP TABLE IF EXISTS `submission_files`;
CREATE TABLE `submission_files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `assignment_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_content` longtext,
  `file_order` int DEFAULT '0',
  `ai_probability` double DEFAULT NULL,
  `ai_percentage` double DEFAULT NULL,
  `ai_label` varchar(255) DEFAULT NULL,
  `ai_confidence` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`, `user_id`) REFERENCES `submissions` (`assignment_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `rubrics`
--

DROP TABLE IF EXISTS `rubrics`;
CREATE TABLE `rubrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(36) NOT NULL,
  `is_visible` bit(1) NOT NULL DEFAULT b'0',
  `total_points` double NOT NULL DEFAULT '0',
  `weighted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
=======
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `crn` char(5) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `archived` bit(1) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `course_abbreviation` varchar(255) DEFAULT NULL,
  `course_description` text,
  `days` varchar(255) DEFAULT NULL,
  `end_time` varchar(255) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `start_time` varchar(255) DEFAULT NULL,
  `year` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`crn`),
  UNIQUE KEY `UK61og8rbqdd2y28rx2et5fdnxd` (`code`)
>>>>>>> origin/main
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `rubric_criteria`
--

DROP TABLE IF EXISTS `rubric_criteria`;
CREATE TABLE `rubric_criteria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rubric_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `display_order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `rubric_items`
--

DROP TABLE IF EXISTS `rubric_items`;
CREATE TABLE `rubric_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `criteria_id` bigint NOT NULL,
  `label` varchar(255) NOT NULL,
  `max_points` double NOT NULL DEFAULT '0',
  `auto_grade` bit(1) NOT NULL DEFAULT b'0',
  `display_order` int NOT NULL DEFAULT '0',
  `weight` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`criteria_id`) REFERENCES `rubric_criteria` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `rubric_score_labels`
--

DROP TABLE IF EXISTS `rubric_score_labels`;
CREATE TABLE `rubric_score_labels` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rubric_item_id` bigint NOT NULL,
  `score` int NOT NULL,
  `label` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_item_score` (`rubric_item_id`,`score`),
  FOREIGN KEY (`rubric_item_id`) REFERENCES `rubric_items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `rubric_scores`
--

DROP TABLE IF EXISTS `rubric_scores`;
CREATE TABLE `rubric_scores` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `rubric_item_id` bigint NOT NULL,
  `submission_assignment_id` bigint NOT NULL,
  `submission_user_id` varchar(36) NOT NULL,
  `awarded_points` double NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`rubric_item_id`) REFERENCES `rubric_items` (`id`),
  FOREIGN KEY (`submission_assignment_id`, `submission_user_id`) REFERENCES `submissions` (`assignment_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
<<<<<<< HEAD
=======
-- Table structure for table `rubrics`
--

DROP TABLE IF EXISTS `rubrics`;
CREATE TABLE `rubrics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(36) NOT NULL,
  `is_visible` bit(1) NOT NULL DEFAULT b'0',
  `total_points` double NOT NULL DEFAULT '0',
  `weighted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `submission_files`
--

DROP TABLE IF EXISTS `submission_files`;
CREATE TABLE `submission_files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `assignment_id` bigint NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_content` longtext,
  `file_order` int DEFAULT '0',
  `ai_probability` double DEFAULT NULL,
  `ai_percentage` double DEFAULT NULL,
  `ai_label` varchar(255) DEFAULT NULL,
  `ai_confidence` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`, `user_id`) REFERENCES `submissions` (`assignment_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
CREATE TABLE `submissions` (
  `assignment_id` bigint NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `file_content` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `feedback` text,
  `ai_probability` double DEFAULT NULL,
  `ai_percentage` double DEFAULT NULL,
  `ai_label` varchar(255) DEFAULT NULL,
  `ai_confidence` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`assignment_id`,`user_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
>>>>>>> origin/main
-- Table structure for table `test_cases`
--

DROP TABLE IF EXISTS `test_cases`;
CREATE TABLE `test_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `input` text,
  `expected_output` text NOT NULL,
  `is_hidden` bit(1) NOT NULL DEFAULT b'0',
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `test_results`
--

DROP TABLE IF EXISTS `test_results`;
CREATE TABLE `test_results` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `submission_assignment_id` bigint NOT NULL,
  `submission_user_id` varchar(36) NOT NULL,
  `test_case_id` bigint NOT NULL,
  `actual_output` text,
  `passed` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`),
  FOREIGN KEY (`submission_assignment_id`, `submission_user_id`) REFERENCES `submissions` (`assignment_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
<<<<<<< HEAD
-- Table structure for table `test_suites`
--

DROP TABLE IF EXISTS `test_suites`;
CREATE TABLE `test_suites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
=======
>>>>>>> origin/main
-- Table structure for table `test_suite_cases`
--

DROP TABLE IF EXISTS `test_suite_cases`;
CREATE TABLE `test_suite_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `suite_id` bigint NOT NULL,
  `input` text,
  `expected_output` text NOT NULL,
  `is_hidden` bit(1) NOT NULL DEFAULT b'0',
  `label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`suite_id`) REFERENCES `test_suites` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
<<<<<<< HEAD
-- Table structure for table `assignment_groups`
--

DROP TABLE IF EXISTS `assignment_groups`;
CREATE TABLE `assignment_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_group_members`
--

DROP TABLE IF EXISTS `assignment_group_members`;
CREATE TABLE `assignment_group_members` (
  `group_id` bigint NOT NULL,
  `user_id` varchar(36) NOT NULL,
  PRIMARY KEY (`group_id`,`user_id`),
  FOREIGN KEY (`group_id`) REFERENCES `assignment_groups` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_rubrics`
--

DROP TABLE IF EXISTS `assignment_rubrics`;
CREATE TABLE `assignment_rubrics` (
  `assignment_id` bigint NOT NULL,
  `rubric_id` bigint NOT NULL,
  PRIMARY KEY (`assignment_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  FOREIGN KEY (`rubric_id`) REFERENCES `rubrics` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `assignment_rubric_item_test_cases`
--

DROP TABLE IF EXISTS `assignment_rubric_item_test_cases`;
CREATE TABLE `assignment_rubric_item_test_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `rubric_item_id` bigint NOT NULL,
  `test_case_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_link` (`assignment_id`,`rubric_item_id`,`test_case_id`),
  FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  FOREIGN KEY (`rubric_item_id`) REFERENCES `rubric_items` (`id`),
  FOREIGN KEY (`test_case_id`) REFERENCES `test_cases` (`id`)
=======
-- Table structure for table `test_suites`
--

DROP TABLE IF EXISTS `test_suites`;
CREATE TABLE `test_suites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT '',
  `cwid` varchar(8) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_role` enum('STUDENT','FACULTY','ADMIN') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
>>>>>>> origin/main
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
<<<<<<< HEAD
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
=======
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
>>>>>>> origin/main
