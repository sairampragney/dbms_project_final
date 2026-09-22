const pool = require('./db');

/**
 * Idempotent Auto-Migration and Database Initializer
 * Safe for automated deployment on Render with Aiven MySQL over SSL.
 * Automatically creates tables, indexes, constraints, views, triggers, and seed data.
 * Non-destructive: Never drops tables or wipes existing production data.
 */
async function initDb() {
  console.log('[DB Init] Starting idempotent database schema & migration check...');
  let conn;
  try {
    conn = await pool.getConnection();

    // 0. Schema Migrations Tracking Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 1. Users Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NULL,
          role ENUM('CITIZEN', 'VOLUNTEER', 'ADMIN') NOT NULL DEFAULT 'CITIZEN',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT chk_user_email_format CHECK (email LIKE '%@%.%'),
          INDEX idx_users_role_active (role, is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Disaster Alerts Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS disaster_alerts (
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
          CONSTRAINT fk_alerts_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_alerts_status_severity (status, severity)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Incidents Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS incidents (
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
          CONSTRAINT chk_incident_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
          INDEX idx_incidents_status_type (status, disaster_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Emergency Requests Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS emergency_requests (
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
          CONSTRAINT chk_people_affected CHECK (people_affected > 0),
          INDEX idx_requests_status_priority (status, priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Safe Locations Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS safe_locations (
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
          CONSTRAINT chk_shelter_occupancy CHECK (current_occupancy >= 0),
          INDEX idx_safe_locations_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Volunteers Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS volunteers (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL UNIQUE,
          skills VARCHAR(255) NOT NULL,
          operating_area VARCHAR(150) NOT NULL,
          availability_status ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_volunteers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_volunteers_availability (availability_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 7. Response Records Table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS response_records (
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
          CONSTRAINT chk_response_target CHECK (incident_id IS NOT NULL OR request_id IS NOT NULL),
          INDEX idx_response_records_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Aggregated Dashboard Summary View
    await conn.query(`
      CREATE OR REPLACE VIEW v_dashboard_summary AS
      SELECT
          (SELECT COUNT(*) FROM disaster_alerts WHERE status = 'ACTIVE') AS active_alerts_count,
          (SELECT COUNT(*) FROM incidents WHERE status IN ('REPORTED', 'VERIFIED', 'IN_PROGRESS')) AS open_incidents_count,
          (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')) AS pending_requests_count,
          (SELECT COUNT(*) FROM safe_locations WHERE status = 'OPEN') AS open_shelters_count,
          (SELECT COALESCE(SUM(capacity - current_occupancy), 0) FROM safe_locations WHERE status = 'OPEN') AS total_shelter_remaining_capacity,
          (SELECT COUNT(*) FROM volunteers WHERE availability_status = 'AVAILABLE') AS available_volunteers_count;
    `);

    // 9. Shelter Capacity Check Trigger
    const [triggers] = await conn.query(`
      SELECT TRIGGER_NAME FROM information_schema.TRIGGERS
      WHERE TRIGGER_SCHEMA = DATABASE() AND TRIGGER_NAME = 'trg_check_shelter_capacity_before_update'
    `);

    if (triggers.length === 0) {
      await conn.query(`
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
      `);
      console.log('[DB Init] Created trigger trg_check_shelter_capacity_before_update');
    }

    console.log('[DB Init] Schema structure verified successfully.');

    // 10. Idempotent Seed Insertion (Only seeds if database has no users)
    const [userRows] = await conn.query('SELECT COUNT(*) AS count FROM users');
    if (userRows[0].count === 0) {
      console.log('[DB Init] Database is empty. Inserting initial seed data...');

      await conn.query(`
        INSERT IGNORE INTO users (id, full_name, email, password_hash, phone, role, is_active) VALUES
        (1, 'System Administrator', 'admin@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15550001111', 'ADMIN', TRUE),
        (2, 'Sarah Jenkins (EOC Coordinator)', 'sarah.j@disasterapp.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15550002222', 'ADMIN', TRUE),
        (3, 'John Doe (Citizen)', 'john.doe@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15551112233', 'CITIZEN', TRUE),
        (4, 'Maria Garcia (Citizen)', 'maria.g@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15552223344', 'CITIZEN', TRUE),
        (5, 'Robert Chen (Citizen)', 'robert.chen@example.com', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15553334455', 'CITIZEN', TRUE),
        (6, 'Dr. Alex Vance (EMT Volunteer)', 'alex.vance@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15554445566', 'VOLUNTEER', TRUE),
        (7, 'David Miller (Rescue Tech)', 'david.m@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15555556677', 'VOLUNTEER', TRUE),
        (8, 'Elena Rostova (Logistics Specialist)', 'elena.r@responder.org', '$2a$10$e8W/X0A/H1B3c7j7899Xze.8J3H4i8Y998u3828s1919', '+15556667788', 'VOLUNTEER', TRUE);
      `);

      await conn.query(`
        INSERT IGNORE INTO disaster_alerts (id, title, disaster_type, severity, affected_location, description, status, created_by) VALUES
        (1, 'Critical River Flash Flood Warning', 'FLOOD', 'CRITICAL', 'Downtown Riverfront & Lower East Sector', 'Rapidly rising water levels along the main river basin following heavy rainfall. Residents in low-lying zones must evacuate to elevated ground immediately.', 'ACTIVE', 1),
        (2, 'Wildfire Evacuation Advisory', 'FIRE', 'HIGH', 'Northern Pine Ridge & Hillside Heights', 'Fast-moving brush fire spreading southwards due to high wind gusts. Prepare emergency grab-and-go kits and monitor local broadcasts.', 'ACTIVE', 2),
        (3, 'Severe Thunderstorm & High Winds', 'STORM', 'MEDIUM', 'Metropolitan County Area', 'Severe weather system approaching with wind gusts up to 60mph and potential hail. Secure outdoor property and stay indoors.', 'ACTIVE', 1),
        (4, 'Chemical Tanker Spill Warning (Resolved)', 'CHEMICAL', 'HIGH', 'Industrial Zone Highway 9 Junction', 'Hazardous material leak contained by HAZMAT response team. Air quality safety confirmed.', 'RESOLVED', 2);
      `);

      await conn.query(`
        INSERT IGNORE INTO incidents (id, reporter_id, disaster_type, location, latitude, longitude, severity, description, status) VALUES
        (1, 3, 'FLOOD', 'Intersection of 5th Ave and Water Street', 37.77490000, -122.41940000, 'CRITICAL', 'Water depth reached 3 feet. Multiple vehicles stalled on road.', 'IN_PROGRESS'),
        (2, 4, 'FIRE', '1420 Hillside Terrace', 37.78330000, -122.41670000, 'HIGH', 'Transformer explosion caused brush fire near residential structures.', 'VERIFIED'),
        (3, 5, 'STORM', 'Oakwood Community Park Entrance', 37.76500000, -122.43000000, 'MEDIUM', 'Large oak tree collapsed, blocking main two-lane access road and tearing down power lines.', 'REPORTED'),
        (4, 3, 'OTHER', 'Westside Shopping Plaza', 37.75000000, -122.40000000, 'LOW', 'Minor localized street flooding due to clogged storm drains.', 'RESOLVED');
      `);

      await conn.query(`
        INSERT IGNORE INTO emergency_requests (id, requester_id, request_type, priority, location, people_affected, contact_phone, description, status) VALUES
        (1, 3, 'RESCUE', 'CRITICAL', '842 Riverfront Lane, Apt 2B', 3, '+15551112233', 'Water surrounds ground floor. Two elderly residents and one infant require boat evacuation.', 'ASSIGNED'),
        (2, 4, 'MEDICAL', 'HIGH', '1420 Hillside Terrace', 1, '+15552223344', 'Individual suffered minor smoke inhalation from nearby brush fire. Needs medical checkup.', 'IN_PROGRESS'),
        (3, 5, 'FOOD_WATER', 'MEDIUM', 'Oakwood High School Assembly Hall', 12, '+15553334455', 'Stranded community group requiring clean drinking water and emergency rations.', 'PENDING'),
        (4, 3, 'SHELTER', 'LOW', 'Westside Transit Hub', 2, '+15551112233', 'Family needing temporary overnight shelter due to power outages.', 'FULFILLED');
      `);

      await conn.query(`
        INSERT IGNORE INTO safe_locations (id, name, address, capacity, current_occupancy, facilities, status, contact_phone, created_by) VALUES
        (1, 'Central High School Emergency Shelter', '500 Education Way, Sector 1', 300, 120, 'Medical Station, Emergency Generator, Hot Meals, Pet Friendly, Wheelchair Access', 'OPEN', '+15559001000', 1),
        (2, 'Civic Center Evacuation Complex', '100 Municipal Plaza', 500, 480, 'Full Medical Post, Showers, Family Units, Wi-Fi, Generator Power', 'OPEN', '+15559002000', 2),
        (3, 'Northside Community Gym', '782 North Boundary Road', 150, 150, 'Sleeping Cots, Basic First Aid, Water Distribution Point', 'FULL', '+15559003000', 1),
        (4, 'Westside St. Jude Relief Center', '320 Hope Street', 200, 0, 'Food Kitchen, Supplies Distribution, Clothing', 'CLOSED', '+15559004000', 2);
      `);

      await conn.query(`
        INSERT IGNORE INTO volunteers (id, user_id, skills, operating_area, availability_status) VALUES
        (1, 6, 'First Aid, Triage, Paramedic, CPR Certified', 'Downtown & Riverfront District', 'BUSY'),
        (2, 7, 'Swiftwater Rescue, Boat Operator, Search & Rescue', 'Riverfront & Flood Zone A', 'BUSY'),
        (3, 8, 'Food Logistics, Supply Distribution, Truck Driving (CDL)', 'Metropolitan Area Wide', 'AVAILABLE');
      `);

      await conn.query(`
        INSERT IGNORE INTO response_records (id, volunteer_id, incident_id, request_id, action_taken, status, assigned_at, completed_at) VALUES
        (1, 2, 1, 1, 'Dispatched inflatable rescue craft to 842 Riverfront Lane. Evacuating 3 residents.', 'IN_PROGRESS', NOW(), NULL),
        (2, 1, 2, 2, 'Arrived on scene at Hillside Terrace. Administered oxygen treatment for smoke inhalation.', 'IN_PROGRESS', NOW(), NULL),
        (3, 3, NULL, 4, 'Coordinated temporary shelter placement at Central High Shelter for displaced family.', 'COMPLETED', NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR);
      `);

      console.log('[DB Init] Initial seed data inserted successfully.');
    } else {
      console.log('[DB Init] Existing database records found. Skipping seed step to preserve existing data.');
    }
  } catch (err) {
    console.error('[DB Init] Error during database initialization:', err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = initDb;
