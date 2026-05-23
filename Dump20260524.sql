-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: jobmatch
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `jobmatch`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `jobmatch` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `jobmatch`;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (3,1,6,NULL,NULL,'Rejected','2026-05-22 22:08:37','2026-05-23 22:28:48'),(4,1,5,1,NULL,'Rejected','2026-05-22 22:38:58','2026-05-23 22:48:00');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_profiles`
--

DROP TABLE IF EXISTS `candidate_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
  `phone` varchar(50) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `linkedin_url` varchar(300) DEFAULT NULL,
  `desired_role` varchar(150) DEFAULT NULL,
  `expected_salary` varchar(100) DEFAULT NULL,
  `cv_file_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `fk_cp_cv_file` (`cv_file_id`),
  CONSTRAINT `fk_candidate_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_cp_cv_file` FOREIGN KEY (`cv_file_id`) REFERENCES `files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_profiles`
--

LOCK TABLES `candidate_profiles` WRITE;
/*!40000 ALTER TABLE `candidate_profiles` DISABLE KEYS */;
INSERT INTO `candidate_profiles` VALUES (1,1,'Senior Frontend','dasdasda','React,Node JS','Senior','BSC CSE',NULL,'2026-05-19 07:02:27','2026-05-22 22:38:27','+11111111','Bujanoc','linjelkasd','Senior Frontend','120-150K',1);
/*!40000 ALTER TABLE `candidate_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profiles`
--

DROP TABLE IF EXISTS `company_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profiles`
--

LOCK TABLES `company_profiles` WRITE;
/*!40000 ALTER TABLE `company_profiles` DISABLE KEYS */;
INSERT INTO `company_profiles` VALUES (1,2,'TechNova','Technology','','https://technova.com',NULL,1,'','','','2026-05-19 07:03:23','2026-05-22 22:49:26'),(2,4,'HelloInc','Technology',NULL,'https://hello.com',NULL,0,NULL,NULL,NULL,'2026-05-19 07:25:00','2026-05-19 07:25:00'),(3,5,'Premium Inc','Education',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-05-19 07:31:43','2026-05-19 07:31:43'),(4,6,'Com3','Hospitality',NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-05-19 07:37:30','2026-05-19 07:37:46'),(5,7,'Com4','Transportation',NULL,NULL,NULL,1,NULL,NULL,NULL,'2026-05-19 07:42:43','2026-05-19 07:43:15'),(6,8,'company5@gmail.com','Consulting','','https://company5.com',NULL,1,'','','','2026-05-19 07:49:16','2026-05-23 22:44:28'),(7,9,'Company6@gmail.com','Media',NULL,NULL,NULL,0,NULL,NULL,NULL,'2026-05-19 08:08:04','2026-05-19 08:08:04');
/*!40000 ALTER TABLE `company_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files` DISABLE KEYS */;
INSERT INTO `files` VALUES (1,1,'BLEND.FETAHU -  CV  (1).pdf','uploads/cv\\25cddced-7a8f-4f69-bbe7-430a6bc4f7e0.pdf','cv',75172,'2026-05-22 22:38:27');
/*!40000 ALTER TABLE `files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_listings`
--

DROP TABLE IF EXISTS `job_listings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_listings`
--

LOCK TABLES `job_listings` WRITE;
/*!40000 ALTER TABLE `job_listings` DISABLE KEYS */;
INSERT INTO `job_listings` VALUES (4,6,'aa','vvv',NULL,NULL,'Full-time','Prishtina',NULL,0,NULL,'2026-05-19 08:04:18','2026-05-19 08:09:44'),(5,6,'Product Manager','.',NULL,NULL,'Full-time','Prishtina',NULL,1,NULL,'2026-05-19 14:17:43','2026-05-19 14:17:43'),(6,1,'Senior FrontEnd Developer','Description','requirementsss','Node js','Full-time','Prishtina',30000.00,1,'2026-05-30','2026-05-22 21:52:53','2026-05-23 22:28:37'),(7,6,'Product Owner','PO','PO','PO','Full-time','Prishtina',908.00,1,'2026-05-25','2026-05-22 22:43:23','2026-05-22 22:43:41'),(8,1,'Product Owner','PO','PO','PO','Full-time','Prishtina',50000.00,1,'2026-05-30','2026-05-23 22:29:50','2026-05-23 22:29:50');
/*!40000 ALTER TABLE `job_listings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ml_match_results`
--

DROP TABLE IF EXISTS `ml_match_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ml_match_results`
--

LOCK TABLES `ml_match_results` WRITE;
/*!40000 ALTER TABLE `ml_match_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `ml_match_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (67,8,'020ddd9f29b3af91e5d812ef7f84091ffe6729adf09393975d6967d5635d66f1','2026-05-29 21:49:36',NULL,'2026-05-22 21:49:35'),(68,3,'972c1c7deb7e6822536329a1e0d7a8f80d67814cbbef1736025ed9820249f740','2026-05-29 21:50:45',NULL,'2026-05-22 21:50:44'),(69,3,'a8ec3dde030d25103781028c0132cf44280b0a5a452bd405b768ac626cddaa69','2026-05-29 21:50:56',NULL,'2026-05-22 21:50:56'),(70,2,'04d993bf0412f993d7e8d4963e0eab16d8380bb79fb9c243bb904d9da0ad0647','2026-05-29 21:51:09',NULL,'2026-05-22 21:51:08'),(71,2,'d9530416f0d94c7890aefd548c7ac60745764ea6b55514cb7dd186dea2858280','2026-05-29 21:52:09',NULL,'2026-05-22 21:52:09'),(72,1,'070ee54a4139c4e6b1d1ad4ad9ab9f728889d071b7b3c1c8ebe9931737f15230','2026-05-29 22:06:09',NULL,'2026-05-22 22:06:08'),(73,1,'64176b63c4e499dde192f3a5f1a71b2dc233893f53289ea2e47a2586f828a311','2026-05-29 22:07:36','2026-05-22 22:11:02','2026-05-22 22:07:35'),(74,3,'e8147a0afc27407264aa95246a340fefc57915c21852012a7371432d95432e68','2026-05-29 22:11:18','2026-05-22 22:11:42','2026-05-22 22:11:18'),(75,1,'99403e6fcba2a0005035d425b6e5f206dd90a1d2faa44bbe5c8ca0b4b826af09','2026-05-29 22:13:21','2026-05-22 22:13:54','2026-05-22 22:13:21'),(76,1,'6bb34e2c6afab762fd38e7187b05379d6e0638c695aa80e2ef917c7aeba324fc','2026-05-29 22:33:39','2026-05-22 22:39:03','2026-05-22 22:33:39'),(77,8,'aeb2fb2a9ff2946dc4b18bcddf748048e17be52108ff1a9cb089d5053cfbef5b','2026-05-29 22:39:15','2026-05-22 22:44:02','2026-05-22 22:39:15'),(78,1,'3fc6422608d6ab9a33d54c001e313179e6836f8722bd1ca314d296e90f57371d','2026-05-29 22:44:23','2026-05-22 22:45:03','2026-05-22 22:44:23'),(79,1,'41af7f6fd4fcee525933ae560b7d8f0dfd0c201a6d8d1bb90a0f45d7c1508f0d','2026-05-29 22:48:32','2026-05-22 22:48:41','2026-05-22 22:48:31'),(80,2,'3ea9c2bb60210332bf07e0969d8dd52df533c800310ec64188cb00d4c60861b6','2026-05-29 22:48:58','2026-05-22 22:49:31','2026-05-22 22:48:57'),(81,1,'65afda87a268e7849273802cee370e4a89d82edf11f27ff564a417ff9c6f8aa7','2026-05-30 22:08:53','2026-05-23 22:18:33','2026-05-23 22:08:53'),(82,2,'56c4ef98b299301286e7859c293c3522d134996a8f0aebcc666813606338a3e9','2026-05-30 22:18:56','2026-05-23 22:29:59','2026-05-23 22:18:56'),(83,1,'3feb7cde0cb231f17169b33064533e551026d9d889364d7467c20122f5ff6718','2026-05-30 22:30:18','2026-05-23 22:30:54','2026-05-23 22:30:17'),(84,1,'61396c95d2174fdab661112cecb21f68a177179b14a99b3547f60db278fa1eb1','2026-05-30 22:42:05','2026-05-23 22:43:58','2026-05-23 22:42:05'),(85,8,'efb79cb6288fbfb286f3b7f3f7f4149d2639194978a4286409bf2aa22478659d','2026-05-30 22:44:10','2026-05-23 22:48:26','2026-05-23 22:44:09'),(86,1,'5bd1cd258e90e00255b28c8f5f76d34cdede2603793256a8ae66be85d7a56505','2026-05-30 22:50:12',NULL,'2026-05-23 22:50:11'),(87,2,'1e6b9bf777135d8d074310fef765fcd0fc5751cf01772ce1ba3d627934c5352f','2026-05-30 22:50:12',NULL,'2026-05-23 22:50:11'),(88,3,'3c3f5982313edb2f313c2dabb8c88a92ebb13dcd295accb2849ef0044c27eb68','2026-05-30 22:50:12',NULL,'2026-05-23 22:50:12'),(89,1,'339122a00b1d702654537ba7b9b2224c6d1c13e3fc3ea72b0e71b46831510ce1','2026-05-30 22:50:27',NULL,'2026-05-23 22:50:27'),(90,2,'4f6ab5b2255f9581025d2636ccd6912ec88b7319f085eb6cf9a85c018c8abaf7','2026-05-30 22:50:28',NULL,'2026-05-23 22:50:27'),(91,1,'323b67fd3552d049a1cc62f45ee8d1a735f389e54489ded99af78a51430fd4f5','2026-05-30 22:50:57',NULL,'2026-05-23 22:50:56'),(92,2,'2f6ae153e598b9b4e815a8d8440f9de949f6043f672434196c534efeb40a4782','2026-05-30 22:50:57',NULL,'2026-05-23 22:50:57'),(93,1,'8140d6267152d7122d76c97cc78d179f947611aa61f12923c346dff6c5204652','2026-05-30 22:51:36',NULL,'2026-05-23 22:51:36'),(94,2,'12143512b64461fc03daa764feb3d0bf6b80d0b67a93bf74574028390149ad7d','2026-05-30 22:51:37',NULL,'2026-05-23 22:51:36'),(95,3,'a08a32ab3e2a5a3e23b9d52df805b43a6abc37bfe6973e90ca702a99941c8a6f','2026-05-30 22:51:37',NULL,'2026-05-23 22:51:36');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN',NULL,'2026-04-30 18:19:09'),(2,'COMPANY',NULL,'2026-04-30 18:19:09'),(3,'CANDIDATE',NULL,'2026-04-30 18:19:09');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,3,'Filan Fisteku','filanfisteku@gmail.com','$2b$12$M6JaWy/6SOQRlXiPTGBPu.PekHo6FvtPOu9L6SyKLHnabrmsqw2uK',1,'2026-05-19 07:02:27','2026-05-23 22:50:02'),(2,2,'TechNova','company@test.com','$2b$12$M6JaWy/6SOQRlXiPTGBPu.PekHo6FvtPOu9L6SyKLHnabrmsqw2uK',1,'2026-05-19 07:03:23','2026-05-23 22:50:02'),(3,1,'System Admin','admin@jobmatch.com','$2b$12$M6JaWy/6SOQRlXiPTGBPu.PekHo6FvtPOu9L6SyKLHnabrmsqw2uK',1,'2026-05-19 07:22:51','2026-05-23 22:50:02'),(4,2,'HelloInc','hello@gmail.com','$2b$12$rpQ.kOe9XPGbfs5Bm8beGucesmwBYUVbSxvD2JGHwh8v5VF0f/1/W',0,'2026-05-19 07:25:00','2026-05-19 07:25:27'),(5,2,'Premium Inc','company2@gmail.com','$2b$12$zVOMa87ppgg8kqH0nmfCt.ZvlGSw/y2oxRUp.SrlF3XIaorsMOEfa',0,'2026-05-19 07:31:43','2026-05-19 07:32:28'),(6,2,'Com3','company3@gmail.com','$2b$12$.GYmn.bhpBaJs3bz/ddhO.kIqu.szV0TQZZWHpujfdzT9OWLItLc6',1,'2026-05-19 07:37:30','2026-05-19 07:37:30'),(7,2,'Com4','company4@gmail.com','$2b$12$Q/G7oHcbk.yTdcLY3odcf.sCBOzBclHBdvKXhh4fd46k2AUYVe20u',1,'2026-05-19 07:42:43','2026-05-19 07:42:43'),(8,2,'company5@gmail.com','company5@gmail.com','$2b$12$/BT4gBq8/UsLITwDlhPuM.rKOA.WAJiniMtGS0urxQVocrKdNar3u',1,'2026-05-19 07:49:16','2026-05-19 07:49:16'),(9,2,'Company6@gmail.com','company6@gmail.com','$2b$12$660LUY33jAtCq5GxFiCq5.70dSeZWlUDK40ooJEp7ZdkSY31WDYyu',1,'2026-05-19 08:08:04','2026-05-19 08:08:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'jobmatch'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 8.0.43.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-24  0:51:49
