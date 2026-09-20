# System Architecture Document

## Project: Disaster Alert and Community Response App

---

## 1. High-Level System Architecture

The **Disaster Alert and Community Response App** is built as a three-tier web application designed for high availability, security, and scalability during emergency scenarios.

```
+-------------------------------------------------------------------+
|                           CLIENT TIER                             |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                  React 18 + Vite Frontend                 |   |
|   |         (Single Page Application hosted on Vercel)         |   |
|   +-----------------------------------------------------------+   |
+---------------------------------+---------------------------------+
                                  |
                           HTTPS / REST API
                                  |
+---------------------------------v---------------------------------+
|                           SERVER TIER                             |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                  Express.js / Node.js API                 |   |
|   |          (REST API Server hosted on Render platform)      |   |
|   +-----------------------------------------------------------+   |
|   | Middlewares: Auth (JWT), Validation, CORS, Error Handler  |   |
|   +-----------------------------------------------------------+   |
+---------------------------------+---------------------------------+
                                  |
                             MySQL Native /
                         Connection Pool (TCP)
                                  |
+---------------------------------v---------------------------------+
|                          DATABASE TIER                            |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                        MySQL 8.0+                         |   |
|   |         (Normalized Relational Database Instance)          |   |
|   +-----------------------------------------------------------+   |
|   | Tables, Views, Stored Procedures, Triggers, Indexes       |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

---

## 2. Component Breakdown

### 2.1 Frontend Component Layer (`frontend/`)
* **Framework**: React 18, Vite build tool, JavaScript (ES6+) or TypeScript.
* **Routing**: `react-router-dom` v6 for client-side routing.
* **State & Data Fetching**: React Context API for global state (Authentication, Active User Session), combined with modular API services (`src/services/api.js`) utilizing Axios/Fetch.
* **Pages & Components**:
  * `Dashboard`: High-level summary of active alerts, open incidents, pending requests, shelter capacity, and volunteer stats.
  * `AlertsPage`: Searchable, filterable list of disaster alerts; admin creation/editing modal.
  * `IncidentsPage`: List of reported incidents and public submission form.
  * `EmergencyRequestsPage`: Assistance submission form and status tracker.
  * `SafeLocationsPage`: Interactive list/map cards of shelters, facility tags, and occupancy progress bars.
  * `CommunityResponsePage`: Volunteer registration form and task assignment directory.
  * `AuthPages`: Login and Register forms.
  * `AboutPage`: System overview, usage guide, and emergency contact directory.

### 2.2 Backend Component Layer (`backend/`)
* **Framework**: Node.js v18+ with Express.js framework.
* **Modular Layering**:
  ```
  backend/src/
  ├── config/        # Database pool, JWT constants, CORS config
  ├── controllers/   # Request handling & HTTP response formatting
  ├── middleware/    # Auth, Role Verification, Validation, Error Handler
  ├── models/        # Database abstraction layer (Parameterized MySQL queries)
  ├── routes/        # Modular Express router definitions (/api/v1/...)
  └── utils/         # Helper functions (logging, JWT signer, formatters)
  ```
* **Security & Middleware**:
  * `helmet` for security headers.
  * `cors` for cross-origin origin restriction.
  * `express-rate-limit` for DDoS / brute-force protection.
  * `jsonwebtoken` for stateless bearer token verification.
  * `bcryptjs` for salted password hashing.
  * Validation middleware using `express-validator` or `zod`.

### 2.3 Database Layer (`database/`)
* **DBMS**: MySQL 8.0+.
* **Pooling**: `mysql2/promise` connection pool with automatic reconnection and query parameterization.
* **Database Objects**:
  * Normalized tables with primary/foreign keys and CHECK constraints.
  * Database views for aggregated dashboard stats and shelter availability summaries.
  * Stored procedures/triggers for audit logging and automatic shelter occupancy updates.

---

## 3. Communication & Data Flow

### 3.1 Typical User Flow (Incident Reporting & Response)
1. **Citizen reports incident**:
   * Client sends `POST /api/v1/incidents` with payload.
   * Express validates payload schema -> passes to `IncidentController`.
   * Controller calls `IncidentModel` to execute parameterized `INSERT INTO incidents ...`.
   * Database persists record and returns new `incident_id`.
   * Express responds with `201 Created` and created resource object.
2. **Admin assigns Volunteer**:
   * Admin submits `POST /api/v1/response-records` linking `incident_id` or `request_id` to `volunteer_id`.
   * Backend executes a MySQL Transaction (`START TRANSACTION`):
     * Inserts into `response_records`.
     * Updates `incidents` status to `IN_PROGRESS` or `assigned`.
     * Commit transaction (`COMMIT`).
   * Express responds with `201 Created`.

---

## 4. Containerization Architecture (Docker & Docker Compose)

Local development and testing environment is managed via Docker Compose (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: disaster_app_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: disaster_response_db
      MYSQL_USER: disaster_user
      MYSQL_PASSWORD: disaster_password
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/1_schema.sql
      - ./database/seeds.sql:/docker-entrypoint-initdb.d/2_seeds.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: disaster_app_backend
    restart: always
    environment:
      PORT: 5000
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: disaster_user
      DB_PASSWORD: disaster_password
      DB_NAME: disaster_response_db
      JWT_SECRET: supersecretjwtkey
    ports:
      - "5000:5000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    container_name: disaster_app_frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  db_data:
```

---

## 5. Deployment Architecture (Production)

### 5.1 Frontend Deployment: Vercel
* Connects directly to Git repository branch (`main`).
* Build Command: `npm run build` in `frontend/`.
* Output Directory: `frontend/dist`.
* Environment Variables set in Vercel Dashboard:
  * `VITE_API_BASE_URL`: URL of the deployed Render backend (e.g., `https://disaster-app-backend.onrender.com/api/v1`).

### 5.2 Backend Deployment: Render
* Deployed as a Web Service on Render.
* Build Command: `cd backend && npm install`.
* Start Command: `cd backend && npm start`.
* Environment Variables set in Render Dashboard:
  * `NODE_ENV`: `production`
  * `PORT`: `10000`
  * `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Credentials from production MySQL provider.
  * `JWT_SECRET`: Secure production secret key.
  * `FRONTEND_URL`: URL of the deployed Vercel frontend (for CORS whitelist).

### 5.3 Database Deployment: Managed MySQL Service
* Hosted on a cloud MySQL provider (e.g., Aiven, PlanetScale, Railway, or Render MySQL).
* Connected over TLS/SSL with strict database user access controls.
