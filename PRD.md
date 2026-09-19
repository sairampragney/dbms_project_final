# Product Requirements Document (PRD)

## Project Title
**Disaster Alert and Community Response App**

---

## 1. Executive Summary & Project Purpose
The **Disaster Alert and Community Response App** is a full-stack web application designed to help communities effectively manage disaster-related information, broadcast critical emergency alerts, enable citizens to report local incidents, request emergency assistance, locate nearby safe shelters, and coordinate community responder and volunteer activities.

The system serves as a centralized platform during natural or man-made disasters (e.g., floods, wildfires, earthquakes, hurricanes, chemical spills), connecting citizens, community volunteers, and emergency administrators in real-time.

---

## 2. Target Audience & User Roles

### 2.1 Citizen / Community Member (`CITIZEN`)
* Public or registered user residing in affected areas.
* Can view active alerts, search safe locations, report disaster incidents, submit emergency aid requests, and register as a responder/volunteer.

### 2.2 Community Responder / Volunteer (`VOLUNTEER`)
* Registered volunteer offering skills (e.g., medical aid, search & rescue, logistics, transport).
* Can view assigned emergency responses, update response status (e.g., IN_PROGRESS, COMPLETED), and participate in disaster mitigation operations.

### 2.3 Emergency Administrator / Coordinator (`ADMIN`)
* Authorized emergency coordinator or local authority official.
* Can broadcast, edit, and cancel disaster alerts; manage shelter capacities; triage and assign emergency requests to responders; update incident statuses; and manage system users.

---

## 3. Core Functional Requirements

### 3.1 Disaster Alerts Module
* **View Active & Historical Alerts**: Users can view lists and detailed pages of disaster alerts.
* **Filtering & Search**: Filter by disaster type (e.g., Flood, Fire, Earthquake, Storm, Chemical, Other), severity (LOW, MEDIUM, HIGH, CRITICAL), status (ACTIVE, RESOLVED, CANCELLED), and location keyword.
* **Alert Information**: Each alert includes alert title, disaster type, severity level, affected geographical area/location, issuance timestamp, description, recommended safety instructions, and status.
* **Alert Management (`ADMIN`)**: Authorized admins can create, update, and resolve/cancel alerts.

### 3.2 Incident Reporting Module
* **Report Incident**: Citizens and volunteers can report real-time incidents.
* **Data Fields**: Disaster type, specific location description, latitude/longitude (optional/geolocated), severity level (LOW, MEDIUM, HIGH, CRITICAL), detailed description, and contact info.
* **Incident Status Tracking**: Incidents move through lifecycle statuses (`REPORTED`, `VERIFIED`, `IN_PROGRESS`, `RESOLVED`, `DISMISSED`).
* **Validation**: Strict server-side validation on location formats, severity choices, and required descriptions.

### 3.3 Emergency Assistance Requests Module
* **Submit Emergency Request**: Citizens in immediate danger or need can request rescue, medical, food/water, shelter, or evacuation assistance.
* **Data Fields**: Request type (`RESCUE`, `MEDICAL`, `FOOD_WATER`, `SHELTER`, `EVACUATION`, `OTHER`), location address/coordinates, priority level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), number of individuals affected, description, contact phone.
* **Status Lifecycle**: Track requests through `PENDING`, `ASSIGNED`, `IN_PROGRESS`, `FULFILLED`, `CANCELLED`.
* **Response Status Tracking**: Admin/Volunteers can claim or be assigned to requests and log status updates.

### 3.4 Safe Locations & Shelters Module
* **View & Search Shelters**: Citizens can browse and filter safe locations (evacuation centers, medical centers, distribution points).
* **Location Details**: Name, address, total capacity, current occupancy, available facilities (e.g., medical aid, generator power, food supply, pet friendly, wheelchair accessible), operational status (`OPEN`, `FULL`, `CLOSED`), and contact phone.
* **Capacity Management (`ADMIN`)**: Admin can update occupancy and facility availability in real-time.

### 3.5 Community Response & Volunteer Module
* **Volunteer Registration**: Users can register as volunteers specifying availability, skills (Medical, Transport, Rescue, Logistics, First Aid, Cooking), contact information, and operating area.
* **Response Activity Tracking**: Responders can view emergency requests or response tasks assigned to them.
* **Assignment Management**: Admins can assign registered volunteers to specific incidents or emergency requests, creating structured `response_records`.
* **Activity Status**: Update task completion status and log response notes/timestamps.

### 3.6 Real-Time Community Dashboard
* Aggregate real-time database metrics (no mock/hardcoded stats):
  * Count of active disaster alerts by severity.
  * Count of open vs. resolved incidents.
  * Count of pending emergency assistance requests.
  * Safe location capacity summary (total shelters open, remaining capacity).
  * Active volunteers count and active response assignments.
* Quick links to report an incident, request emergency aid, or view shelter availability.

### 3.7 User Authentication & Authorization
* **User Registration & Login**: Email/password registration with password hashing (bcrypt).
* **JWT-Based Authentication**: Secure stateless authentication token stored securely in standard authorization headers or HTTP-only cookies.
* **Role-Based Access Control (RBAC)**: Enforce granular access for `CITIZEN`, `VOLUNTEER`, and `ADMIN` endpoints.

---

## 4. Non-Functional Requirements

### 4.1 System Performance & Scalability
* API response time < 200ms for standard queries.
* Optimized MySQL index strategies for location filtering, status filters, and relational joins.

### 4.2 Security & Compliance
* Password hashing using bcrypt with high salt rounds (>= 10).
* Prevention of SQL Injection via parameterized queries and ORM/Query Builder safety.
* Cross-Origin Resource Sharing (CORS) restricted to trusted frontend origins.
* Robust request sanitization and schema validation on all POST/PUT/PATCH endpoints (e.g., Zod / Joi / Express Validator).
* Strict separation of application secrets using environment variables (`.env`).

### 4.3 Reliability & Database Integrity
* Foreign key constraints with cascading options (`ON DELETE RESTRICT/CASCADE`) to enforce referential integrity.
* Normalized database design up to 3NF.
* Atomic MySQL transactions for operations modifying multiple tables (e.g., shelter occupancy updates, volunteer response assignment).

### 4.4 Accessibility & UI/UX
* Modern, responsive, clean web interface using React and modern CSS.
* Accessible color contrasts suited for emergency scenarios (high visibility alerts, clear severity badges).
* Mobile-first responsive layout for citizens accessing the system on smartphones during crises.

---

## 5. Technology Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, React Router, CSS / Tailwind | Modern responsive user interface |
| **Backend** | Node.js, Express.js | Modular RESTful API server |
| **Database** | MySQL 8+ | Relational data persistence & transactional integrity |
| **DevOps** | Docker, Docker Compose | Isolated local containerization |
| **Deployment** | Vercel (Frontend), Render (Backend), Managed MySQL | Cloud deployment architecture |

---

## 6. Success Criteria
1. 100% real database dynamic data across all dashboard widgets and features.
2. Complete end-to-end user workflows: alert creation -> incident reporting -> emergency request -> volunteer assignment -> status resolution.
3. Fully documented REST API endpoints and relational database schema.
4. Successful single-command execution via `docker-compose up` for local environment.
