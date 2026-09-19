# Database Design Specification

## Project: Disaster Alert and Community Response App
**DBMS Target**: MySQL 8.0+ (InnoDB Engine, utf8mb4)

---

## 1. Database Overview & Normalization Strategy

The database schema is designed in accordance with **Third Normal Form (3NF)** guidelines:
1. **1NF**: Every column contains atomic values, and each record is uniquely identified by a primary key (`id`).
2. **2NF**: All non-key attributes are fully functionally dependent on the entire primary key.
3. **3NF**: No transitive dependencies exist; non-key attributes depend only on the primary key.

---

## 2. Entity-Relationship Summary & Cardinalities

```
+----------------+          1:N           +---------------------+
|     USERS      |<-----------------------|   DISASTER_ALERTS   |
| (Citizens/     |                        | (Created by Admin)  |
| Responders/    |                        +---------------------+
| Admins)        |          1:N           +---------------------+
|                |<-----------------------|      INCIDENTS      |
|                |                        | (Reported by Users) |
|                |          1:N           +---------------------+
|                |<-----------------------|  EMERGENCY_REQS     |
|                |                        | (Requested by Users)|
|                |          1:1           +---------------------+
|                |<-----------------------|     VOLUNTEERS      |
+----------------+                        | (Responder Profile) |
        |                                 +---------------------+
        |                                            |
        | 1:N                                        | 1:N
        v                                            v
+----------------+                        +---------------------+
| SAFE_LOCATIONS |                        |  RESPONSE_RECORDS   |
| (Managed by    |                        | (Volunteer          |
| Admins)        |                        |  Assignments)       |
+----------------+                        +---------------------+
```

* **USERS (1) to DISASTER_ALERTS (N)**: An admin user can post multiple disaster alerts.
* **USERS (1) to INCIDENTS (N)**: A user can report multiple incidents.
* **USERS (1) to EMERGENCY_REQUESTS (N)**: A user can submit multiple emergency requests.
* **USERS (1) to VOLUNTEERS (1)**: A user account can optionally be registered as a volunteer profile.
* **VOLUNTEERS (1) to RESPONSE_RECORDS (N)**: A volunteer can be assigned to multiple emergency responses.
* **INCIDENTS/REQUESTS (1) to RESPONSE_RECORDS (N)**: An incident or emergency request can have multiple response records/updates over time.

---

## 3. Detailed Relational Schema & Data Types

### 3.1 Table: `users`
Stores system users, credentials, roles, and contact details.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique user ID |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | NOT NULL, UNIQUE | User login email |
| `password_hash` | VARCHAR(255) | NOT NULL | Salted bcrypt hash |
| `phone` | VARCHAR(20) | NULL | Contact phone number |
| `role` | ENUM('CITIZEN', 'VOLUNTEER', 'ADMIN') | NOT NULL, DEFAULT 'CITIZEN' | System authorization role |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Account state |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Record update timestamp |

### 3.2 Table: `disaster_alerts`
Stores active and historical disaster warnings broadcasted by authorities.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique alert ID |
| `title` | VARCHAR(150) | NOT NULL | Headline/title of alert |
| `disaster_type` | ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER') | NOT NULL | Category of disaster |
| `severity` | ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') | NOT NULL | Alert severity level |
| `affected_location` | VARCHAR(255) | NOT NULL | Location or region name |
| `description` | TEXT | NOT NULL | Comprehensive alert details and instructions |
| `status` | ENUM('ACTIVE', 'RESOLVED', 'CANCELLED') | NOT NULL, DEFAULT 'ACTIVE' | Lifecycle status |
| `created_by` | BIGINT | NOT NULL, FK -> `users(id)` | Admin user who created alert |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Alert timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

### 3.3 Table: `incidents`
Stores disaster incidents reported by citizens or responders.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique incident ID |
| `reporter_id` | BIGINT | NULL, FK -> `users(id)` ON DELETE SET NULL | Reporting user ID |
| `disaster_type` | ENUM('FLOOD', 'FIRE', 'EARTHQUAKE', 'STORM', 'CHEMICAL', 'OTHER') | NOT NULL | Type of disaster observed |
| `location` | VARCHAR(255) | NOT NULL | Text description of incident location |
| `latitude` | DECIMAL(10, 8) | NULL | Optional GPS latitude |
| `longitude` | DECIMAL(11, 8) | NULL | Optional GPS longitude |
| `severity` | ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') | NOT NULL | Observed severity |
| `description` | TEXT | NOT NULL | Details of observed incident |
| `status` | ENUM('REPORTED', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED') | NOT NULL, DEFAULT 'REPORTED' | Incident status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

### 3.4 Table: `emergency_requests`
Stores urgent citizen requests for rescue, medical, food, or evacuation assistance.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique request ID |
| `requester_id` | BIGINT | NULL, FK -> `users(id)` ON DELETE SET NULL | Requesting user ID |
| `request_type` | ENUM('RESCUE', 'MEDICAL', 'FOOD_WATER', 'SHELTER', 'EVACUATION', 'OTHER') | NOT NULL | Type of help requested |
| `priority` | ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') | NOT NULL, DEFAULT 'MEDIUM' | Request priority |
| `location` | VARCHAR(255) | NOT NULL | Location where help is needed |
| `people_affected` | INT | NOT NULL, CHECK (people_affected > 0) | Number of people requiring aid |
| `contact_phone` | VARCHAR(20) | NOT NULL | Direct contact number |
| `description` | TEXT | NOT NULL | Description of crisis/needs |
| `status` | ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'FULFILLED', 'CANCELLED') | NOT NULL, DEFAULT 'PENDING' | Request lifecycle status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

### 3.5 Table: `safe_locations`
Stores information regarding emergency shelters, medical posts, and safe havens.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique location ID |
| `name` | VARCHAR(150) | NOT NULL | Shelter name |
| `address` | VARCHAR(255) | NOT NULL | Physical address |
| `capacity` | INT | NOT NULL, CHECK (capacity > 0) | Maximum human capacity |
| `current_occupancy` | INT | NOT NULL, DEFAULT 0, CHECK (current_occupancy >= 0) | Current number of occupants |
| `facilities` | VARCHAR(255) | NULL | Facilities (e.g. Medical, Power, Food, Pets) |
| `status` | ENUM('OPEN', 'FULL', 'CLOSED') | NOT NULL, DEFAULT 'OPEN' | Operational status |
| `contact_phone` | VARCHAR(20) | NULL | Contact number for shelter |
| `created_by` | BIGINT | NULL, FK -> `users(id)` | Admin creator |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

### 3.6 Table: `volunteers`
Stores profiles for registered community responders.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique volunteer ID |
| `user_id` | BIGINT | NOT NULL, UNIQUE, FK -> `users(id)` ON DELETE CASCADE | Associated user ID |
| `skills` | VARCHAR(255) | NOT NULL | Skills (e.g. First Aid, Search & Rescue, Driving) |
| `operating_area` | VARCHAR(150) | NOT NULL | City/Neighborhood operating area |
| `availability_status` | ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') | NOT NULL, DEFAULT 'AVAILABLE' | Current availability |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | Update timestamp |

### 3.7 Table: `response_records`
Tracks volunteer assignments to emergency requests or reported incidents.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT AUTO_INCREMENT | PRIMARY KEY | Unique response record ID |
| `volunteer_id` | BIGINT | NOT NULL, FK -> `volunteers(id)` ON DELETE CASCADE | Assigned volunteer |
| `incident_id` | BIGINT | NULL, FK -> `incidents(id)` ON DELETE CASCADE | Linked incident (optional) |
| `request_id` | BIGINT | NULL, FK -> `emergency_requests(id)` ON DELETE CASCADE | Linked emergency request (optional) |
| `action_taken` | TEXT | NULL | Description of activities undertaken |
| `status` | ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED') | NOT NULL, DEFAULT 'ASSIGNED' | Task status |
| `assigned_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Assignment timestamp |
| `completed_at` | TIMESTAMP | NULL | Completion timestamp |

---

## 4. Database Optimization: Indexes, Views, Triggers

### 4.1 Indexes
```sql
-- Search & Filtering Indexes
CREATE INDEX idx_alerts_status_severity ON disaster_alerts (status, severity);
CREATE INDEX idx_incidents_status_type ON incidents (status, disaster_type);
CREATE INDEX idx_requests_status_priority ON emergency_requests (status, priority);
CREATE INDEX idx_safe_locations_status ON safe_locations (status);
CREATE INDEX idx_volunteers_availability ON volunteers (availability_status);
CREATE INDEX idx_response_records_status ON response_records (status);
```

### 4.2 Views
```sql
-- Dashboard Aggregated Metrics View
CREATE OR REPLACE VIEW v_dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM disaster_alerts WHERE status = 'ACTIVE') AS active_alerts_count,
    (SELECT COUNT(*) FROM incidents WHERE status IN ('REPORTED', 'VERIFIED', 'IN_PROGRESS')) AS open_incidents_count,
    (SELECT COUNT(*) FROM emergency_requests WHERE status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS')) AS pending_requests_count,
    (SELECT COUNT(*) FROM safe_locations WHERE status = 'OPEN') AS open_shelters_count,
    (SELECT COALESCE(SUM(capacity - current_occupancy), 0) FROM safe_locations WHERE status = 'OPEN') AS total_shelter_remaining_capacity,
    (SELECT COUNT(*) FROM volunteers WHERE availability_status = 'AVAILABLE') AS available_volunteers_count;
```

### 4.3 Triggers
```sql
-- Automatic Shelter Status Update Trigger based on Occupancy vs Capacity
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
```
