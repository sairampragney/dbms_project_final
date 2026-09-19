-- Disaster Alert and Community Response App
-- Relational Database Schema (MySQL 8.0+)
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci

CREATE DATABASE IF NOT EXISTS disaster_response_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE disaster_response_db;

-- Drop triggers, views, and tables if they exist to allow clean re-initialization
DROP TRIGGER IF EXISTS trg_check_shelter_capacity_before_update;
DROP VIEW IF EXISTS v_dashboard_summary;
DROP TABLE IF EXISTS response_records;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS safe_locations;
DROP TABLE IF EXISTS emergency_requests;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS disaster_alerts;
DROP TABLE IF EXISTS users;

-- ==========================================
-- 1. TABLE: users
-- Core entity storing account credentials, roles, and contact info
-- ==========================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('CITIZEN', 'VOLUNTEER', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_email_format CHECK (email LIKE '%@%.%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 2. TABLE: disaster_alerts
-- Broadcasted emergency warnings and alerts created by authorized admins
-- ==========================================
CREATE TABLE disaster_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    disaster_type ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    affected_location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('ACTIVE', 'RESOLVED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. TABLE: incidents
-- Real-time disaster incidents reported by citizens or responders
-- ==========================================
CREATE TABLE incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NULL,
    disaster_type ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER') NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'REPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidents_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_incident_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    CONSTRAINT chk_incident_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 4. TABLE: emergency_requests
-- Urgent aid/rescue requests submitted by affected citizens
-- ==========================================
CREATE TABLE emergency_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_id BIGINT NULL,
    request_type ENUM('RESCUE', 'MEDICAL', 'FOOD_WATER', 'SHELTER', 'EVACUATION', 'OTHER') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    location VARCHAR(255) NOT NULL,
    people_affected INT NOT NULL DEFAULT 1,
    contact_phone VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'FULFILLED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_requests_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_people_affected CHECK (people_affected > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 5. TABLE: safe_locations
-- Safe shelters, evacuation hubs, and medical centers
-- ==========================================
CREATE TABLE safe_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    facilities VARCHAR(255) NULL,
    status ENUM('OPEN', 'FULL', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    contact_phone VARCHAR(20) NULL,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_shelter_capacity CHECK (capacity > 0),
    CONSTRAINT chk_shelter_occupancy CHECK (current_occupancy >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 6. TABLE: volunteers
-- Community responder and volunteer profiles linked 1:1 to users
-- ==========================================
CREATE TABLE volunteers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    skills VARCHAR(255) NOT NULL,
    operating_area VARCHAR(150) NOT NULL,
    availability_status ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 7. TABLE: response_records
-- Tracking volunteer response assignments and completion status
-- ==========================================
CREATE TABLE response_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    volunteer_id BIGINT NOT NULL,
    incident_id BIGINT NULL,
    request_id BIGINT NULL,
    action_taken TEXT NULL,
    status ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'ASSIGNED',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_responses_volunteer FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_request FOREIGN KEY (request_id) REFERENCES emergency_requests(id) ON DELETE CASCADE,
    CONSTRAINT chk_response_target CHECK (incident_id IS NOT NULL OR request_id IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==========================================
CREATE INDEX idx_users_role_active ON users (role, is_active);
CREATE INDEX idx_alerts_status_severity ON disaster_alerts (status, severity);
CREATE INDEX idx_incidents_status_type ON incidents (status, disaster_type);
CREATE INDEX idx_requests_status_priority ON emergency_requests (status, priority);
CREATE INDEX idx_safe_locations_status ON safe_locations (status);
CREATE INDEX idx_volunteers_availability ON volunteers (availability_status);
CREATE INDEX idx_response_records_status ON response_records (status);

-- ==========================================
-- DATABASE VIEWS
-- Aggregated Statistics Summary for Real-Time Dashboard
-- ==========================================
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM disaster_alerts WHERE status = 'ACTIVE') AS active_alerts_count,
    (SELECT COUNT(*) FROM incidents WHERE status IN ('REPORTED', 'VERIFIED', 'IN_PROGRESS')) AS open_incidents_count,
    (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')) AS pending_requests_count,
    (SELECT COUNT(*) FROM safe_locations WHERE status = 'OPEN') AS open_shelters_count,
    (SELECT COALESCE(SUM(capacity - current_occupancy), 0) FROM safe_locations WHERE status = 'OPEN') AS total_shelter_remaining_capacity,
    (SELECT COUNT(*) FROM volunteers WHERE availability_status = 'AVAILABLE') AS available_volunteers_count;

-- ==========================================
-- DATABASE TRIGGERS
-- Automatically update safe_location status when current_occupancy reaches capacity
-- ==========================================
DELIMITER //
CREATE TRIGGER trg_check_shelter_capacity_before_update
BEFORE UPDATE ON safe_locations
FOR EACH ROW
BEGIN
    IF NEW.current_occupancy >= NEW.capacity THEN
        SET NEW.status = 'FULL';
    ELSEIF NEW.current_occupancy < NEW.capacity AND OLD.status = 'FULL' THEN
        SET NEW.status = 'OPEN';
    END IF;
END;
//
DELIMITER ;
