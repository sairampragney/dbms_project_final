# Database Architecture & Schema Documentation

## Disaster Alert and Community Response App
**Target Engine**: MySQL 8.0+ (InnoDB, `utf8mb4_unicode_ci`)

---

## 📌 Overview

The database layer for the Disaster Alert and Community Response App is fully normalized (**3NF**) and built on MySQL 8.0+. It provides high data integrity, strict referential actions, custom validation check constraints, optimized performance indexes, aggregated views for real-time reporting, and trigger-based status automation.

---

## 📁 SQL Files Included

| File | Description |
| :--- | :--- |
| **`database/schema.sql`** | Complete DDL script that creates `disaster_response_db`, table schemas, primary/foreign keys, CHECK constraints, indexes, views, and triggers. |
| **`database/seed.sql`** | Seed script populating realistic demo data for users, alerts, reported incidents, emergency requests, shelters, volunteers, and response logs. |

---

## 🗄️ Relational Schema Summary

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

---

## 📊 Table Specifications

### 1. `users`
Stores user authentication credentials, system roles (`CITIZEN`, `VOLUNTEER`, `ADMIN`), and contact information.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Unique Constraints**: `email`
* **Check Constraint**: `chk_user_email_format` (`email LIKE '%@%.%'`)

### 2. `disaster_alerts`
Broadcast warnings published by emergency administrators.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Key**: `created_by` -> `users(id)` (`ON DELETE RESTRICT`)
* **Enums**: `disaster_type` (`FLOOD`, `FIRE`, `EARTHQUAKE`, `STORM`, `CHEMICAL`, `OTHER`), `severity` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`ACTIVE`, `RESOLVED`, `CANCELLED`)

### 3. `incidents`
Disaster incidents reported by citizens or responders.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Key**: `reporter_id` -> `users(id)` (`ON DELETE SET NULL`)
* **Check Constraints**: `latitude BETWEEN -90 AND 90`, `longitude BETWEEN -180 AND 180`
* **Enums**: `status` (`REPORTED`, `VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`)

### 4. `emergency_requests`
Urgent citizen aid/rescue requests.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Key**: `requester_id` -> `users(id)` (`ON DELETE SET NULL`)
* **Check Constraint**: `people_affected > 0`
* **Enums**: `request_type` (`RESCUE`, `MEDICAL`, `FOOD_WATER`, `SHELTER`, `EVACUATION`, `OTHER`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), `status` (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `FULFILLED`, `CANCELLED`)

### 5. `safe_locations`
Emergency shelters, medical posts, and relief centers.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Key**: `created_by` -> `users(id)` (`ON DELETE SET NULL`)
* **Check Constraints**: `capacity > 0`, `current_occupancy >= 0`
* **Enums**: `status` (`OPEN`, `FULL`, `CLOSED`)

### 6. `volunteers`
Community responder profiles linked 1:1 to a user account.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Key**: `user_id` -> `users(id)` (`UNIQUE`, `ON DELETE CASCADE`)
* **Enums**: `availability_status` (`AVAILABLE`, `BUSY`, `UNAVAILABLE`)

### 7. `response_records`
Volunteer emergency assignments linked to an incident or request.
* **Primary Key**: `id` (BIGINT AUTO_INCREMENT)
* **Foreign Keys**: `volunteer_id` -> `volunteers(id)` (`ON DELETE CASCADE`), `incident_id` -> `incidents(id)` (`ON DELETE CASCADE`), `request_id` -> `emergency_requests(id)` (`ON DELETE CASCADE`)
* **Check Constraint**: `chk_response_target` (`incident_id IS NOT NULL OR request_id IS NOT NULL`)

---

## ⚡ Views & Triggers

### Aggregated Dashboard View (`v_dashboard_summary`)
Provides real-time summary stats for active alerts, open incidents, pending requests, shelter availability, remaining capacity, and available volunteers.

### Shelter Occupancy Trigger (`trg_check_shelter_capacity_before_update`)
Automatically sets `safe_locations.status = 'FULL'` when `current_occupancy >= capacity`, and re-opens the shelter (`status = 'OPEN'`) if occupancy drops below capacity.

---

## 🚀 Initialization Guide

### Option A: Using Docker Compose (Recommended)
Simply start Docker Compose from the project root directory. MySQL will automatically initialize the database using `schema.sql` and `seed.sql`:

```bash
docker-compose up -d db
```

To view database logs:
```bash
docker logs disaster_app_db
```

### Option B: Local MySQL CLI
To run manually on a local MySQL server:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p disaster_response_db < database/seed.sql
```
