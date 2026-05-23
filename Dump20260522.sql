-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
-- Host: localhost    Database: jobmatch_db
-- Server version 8.0.44

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

INSERT INTO `roles` VALUES (1,'ADMIN',NULL,'2026-04-30 20:19:09'),(2,'COMPANY',NULL,'2026-04-30 20:19:09'),(3,'CANDIDATE',NULL,'2026-04-30 20:19:09');

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_roles` (`role_id`),
  CONSTRAINT `fk_users_roles` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` VALUES
(1,3,'Filan Fisteku','filanfisteku@gmail.com','$2b$12$PiQd918PsnPbEQyaugLUfO1/Lnsmvuin5Usdk4iM4fEXlJE3cp7u6',1,'2026-05-19 09:02:27','2026-05-19 09:02:27'),
(2,2,'TechNova','company@test.com','$2b$12$wtMpwL8aSWt9/S/PDDHVBOMi/eKU/I0d.N5vYgFZHz66DJGrrHLXu',1,'2026-05-19 09:03:23','2026-05-19 09:03:23'),
(3,1,'System Admin','admin@jobmatch.com','$2b$12$PiQd918PsnPbEQyaugLUfO1/Lnsmvuin5Usdk4iM4fEXlJE3cp7u6',1,'2026-05-19 09:22:51','2026-05-19 09:22:51'),
(4,2,'HelloInc','hello@gmail.com','$2b$12$rpQ.kOe9XPGbfs5Bm8beGucesmwBYUVbSxvD2JGHwh8v5VF0f/1/W',0,'2026-05-19 09:25:00','2026-05-19 09:25:27'),
(5,2,'Premium Inc','company2@gmail.com','$2b$12$zVOMa87ppgg8kqH0nmfCt.ZvlGSw/y2oxRUp.SrlF3XIaorsMOEfa',0,'2026-05-19 09:31:43','2026-05-19 09:32:28'),
(6,2,'Com3','company3@gmail.com','$2b$12$.GYmn.bhpBaJs3bz/ddhO.kIqu.szV0TQZZWHpujfdzT9OWLItLc6',1,'2026-05-19 09:37:30','2026-05-19 09:37:30'),
(7,2,'Com4','company4@gmail.com','$2b$12$Q/G7oHcbk.yTdcLY3odcf.sCBOzBclHBdvKXhh4fd46k2AUYVe20u',1,'2026-05-19 09:42:43','2026-05-19 09:42:43'),
(8,2,'company5@gmail.com','company5@gmail.com','$2b$12$/BT4gBq8/UsLITwDlhPuM.rKOA.WAJiniMtGS0urxQVocrKdNar3u',1,'2026-05-19 09:49:16','2026-05-19 09:49:16'),
(9,2,'Company6@gmail.com','company6@gmail.com','$2b$12$660LUY33jAtCq5GxFiCq5.70dSeZWlUDK40ooJEp7ZdkSY31WDYyu',1,'2026-05-19 10:08:04','2026-05-19 10:08:04');

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
CREATE TABLE `files` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uploaded_by` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_files_users` (`uploaded_by`),
  CONSTRAINT `fk_files_users` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
CREATE TABLE `company_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `company_name` varchar(150) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `description` text,
  `website` varchar(255) DEFAULT NULL,
  `logo_file_id` int DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT '0',
  `company_size` varchar(100) DEFAULT NULL,
  `founded_year` varchar(10) DEFAULT NULL,
  `hq_location` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_company_logo_file` (`logo_file_id`),
  CONSTRAINT `fk_company_logo_file` FOREIGN KEY (`logo_file_id`) REFERENCES `files` (`id`),
  CONSTRAINT `fk_company_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4;

INSERT INTO `company_profiles` VALUES
(1,2,'TechNova','Technology',NULL,'https://technova.com',NULL,1,NULL,NULL,NULL,'2026-05-19 09:03:23','2026-05-19 09:23:38'),
(2,4,'HelloInc','Technology',NULL,'https://hello.com',NULL,0,NULL,NULL,NULL,'2026-05-19 09:25:00','2026-05-19 09:25:00'),
(3,5,'Premium Inc','Education',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-05-19 09:31:43','2026-05-19 09:31:43'),
(4,6,'Com3','Hospitality',NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-05-19 09:37:30','2026-05-19 09:37:46'),
(5,7,'Com4','Transportation',NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-05-19 09:42:43','2026-05-19 09:43:15'),
(6,8,'company5@gmail.com','Consulting',NULL,'https://company5.com',NULL,1,NULL,NULL,NULL,'2026-05-19 09:49:16','2026-05-19 09:49:42'),
(7,9,'Company6@gmail.com','Media',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-05-19 10:08:04','2026-05-19 10:08:04');

--
-- Table structure for table `candidate_profiles`
--

DROP TABLE IF EXISTS `candidate_profiles`;
CREATE TABLE `candidate_profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `headline` varchar(255) DEFAULT NULL,
  `summary` text,
  `skills` text,
  `experience_level` varchar(100) DEFAULT NULL,
  `education` text,
  `resume_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_candidate_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4;

INSERT INTO `candidate_profiles` VALUES (1,1,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-19 09:02:27','2026-05-19 09:02:27');

--
-- Table structure for table `job_listings`
--

DROP TABLE IF EXISTS `job_listings`;
CREATE TABLE `job_listings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `company_id` int NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `requirements` text,
  `skills_required` text,
  `job_type` varchar(100) DEFAULT NULL,
  `location` varchar(150) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_jobs_company` (`company_id`),
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `company_profiles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4;

INSERT INTO `job_listings` VALUES
(4,6,'aa','vvv',NULL,NULL,'Full-time','Prishtina',NULL,0,NULL,'2026-05-19 10:04:18','2026-05-19 10:09:44'),
(5,6,'Product Manager','.',NULL,NULL,'Full-time','Prishtina',NULL,1,NULL,'2026-05-19 16:17:43','2026-05-19 16:17:43');

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
CREATE TABLE `applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `job_id` int NOT NULL,
  `cv_file_id` int DEFAULT NULL,
  `cover_letter_file_id` int DEFAULT NULL,
  `status` enum('Pending','Under Review','Interview','Accepted','Rejected') DEFAULT 'Pending',
  `applied_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_app_candidate` (`candidate_id`),
  KEY `fk_app_job` (`job_id`),
  KEY `fk_app_cv_file` (`cv_file_id`),
  KEY `fk_app_cover_file` (`cover_letter_file_id`),
  CONSTRAINT `fk_app_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`),
  CONSTRAINT `fk_app_cover_file` FOREIGN KEY (`cover_letter_file_id`) REFERENCES `files` (`id`),
  CONSTRAINT `fk_app_cv_file` FOREIGN KEY (`cv_file_id`) REFERENCES `files` (`id`),
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `job_listings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_refresh_users` (`user_id`),
  CONSTRAINT `fk_refresh_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `ml_match_results`
--

DROP TABLE IF EXISTS `ml_match_results`;
CREATE TABLE `ml_match_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `job_id` int NOT NULL,
  `match_label` varchar(50) NOT NULL,
  `confidence` decimal(5,4) DEFAULT NULL,
  `model_input` text,
  `model_output` text,
  `calculated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ml_candidate` (`candidate_id`),
  KEY `fk_ml_job` (`job_id`),
  CONSTRAINT `fk_ml_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`),
  CONSTRAINT `fk_ml_job` FOREIGN KEY (`job_id`) REFERENCES `job_listings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_users` (`user_id`),
  CONSTRAINT `fk_notifications_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) NOT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` text,
  `new_values` text,
  `ip_address` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_users` (`user_id`),
  CONSTRAINT `fk_audit_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
CREATE TABLE `saved_jobs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int NOT NULL,
  `job_id` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_saved_job` (`candidate_id`,`job_id`),
  KEY `fk_saved_job` (`job_id`),
  CONSTRAINT `fk_saved_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidate_profiles` (`id`),
  CONSTRAINT `fk_saved_job` FOREIGN KEY (`job_id`) REFERENCES `job_listings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS=1;
