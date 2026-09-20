# AGENTS.md - Instructions for Autonomous Engineers (Jules)

Welcome to the **Disaster Alert and Community Response App** repository. This document defines the engineering standards, architecture rules, database constraints, API guidelines, testing requirements, and git workflow instructions that all AI agents (including Jules) must strictly follow when working on this repository.

---

## 1. Primary Source of Truth
* **`PRD.md`** is the primary functional specification for this application.
* Every code addition, refactoring, API endpoint, database schema update, or UI view must align strictly with `PRD.md`.
* Do not introduce mock/in-memory data implementations or fake APIs as final code. All features must be powered by the MySQL database and Express REST backend.

---

## 2. System Architecture & Tech Stack Overview

### 2.1 Tech Stack
* **Frontend**: React (Vite), React Router, Axios/Fetch, Modern Responsive CSS. Located in `frontend/` (to be created in Phase 4).
* **Backend**: Node.js, Express.js (Modular route/controller/service architecture). Located in `backend/` (to be created in Phase 3).
* **Database**: MySQL 8.0+. Database schema scripts and seed data located in `database/` (to be created in Phase 2).
* **Containerization**: Docker & Docker Compose (`docker-compose.yml` in root).

### 2.2 Directory Structure Convention
```
.
├── PRD.md
├── AGENTS.md
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-design.md
│   └── development-plan.md
├── database/
│   ├── schema.sql
│   └── seeds.sql
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.js
│   ├── tests/
│   ├── package.json
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   └── App.jsx
    ├── package.json
    └── Dockerfile
```

---

## 3. Database Rules & Conventions
1. **Engine & Charset**: Use MySQL InnoDB engine with `utf8mb4` character set and `utf8mb4_unicode_ci` collation.
2. **Naming Conventions**:
   * Table names: lower_snake_case plural (e.g., `users`, `disaster_alerts`, `incidents`, `emergency_requests`, `safe_locations`, `volunteers`, `response_records`).
   * Column names: lower_snake_case singular (e.g., `alert_id`, `created_at`, `status`).
   * Foreign Keys: `<singular_table_name>_id` (e.g., `user_id`, `incident_id`).
3. **Data Integrity & Constraints**:
   * Every table MUST have a surrogate primary key `id` (INT AUTO_INCREMENT or BIGINT AUTO_INCREMENT).
   * Include `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP) and `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) on all core tables.
   * Enforce `NOT NULL` constraints where values are mandatory.
   * Explicitly define Foreign Keys with appropriate `ON DELETE` actions (e.g., `ON DELETE CASCADE` or `ON DELETE RESTRICT`).
   * Enforce `ENUM` or `CHECK` constraints on status/type fields (e.g., `severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`).
4. **Indexes**:
   * Create indexes on foreign keys, status columns, disaster types, and frequently queried timestamp fields.
5. **No Mock Data in Production Code**:
   * All API handlers must query MySQL directly using parameterized queries or query builders to prevent SQL injection.

---

## 4. Backend & API Rules
1. **Architecture**: Follow Controller-Service-Model / Route separation in Express.
2. **REST API Conventions**:
   * Base route path: `/api/v1/...`
   * Resource URLs: Nouns in plural (e.g., GET `/api/v1/alerts`, POST `/api/v1/incidents`).
   * Proper HTTP status codes:
     * `200 OK` for successful fetches/updates.
     * `201 Created` for resource creation.
     * `400 Bad Request` for invalid input data/validation failure.
     * `401 Unauthorized` for missing/invalid auth tokens.
     * `403 Forbidden` for insufficient role permissions.
     * `404 Not Found` for missing resources.
     * `500 Internal Server Error` for unhandled server/database exceptions.
3. **Validation & Sanitization**:
   * Validate all incoming `req.body`, `req.params`, and `req.query` using validation middleware (e.g., Express-Validator or Zod).
   * Return clear, standardized JSON error objects:
     ```json
     {
       "success": false,
       "error": {
         "code": "VALIDATION_ERROR",
         "message": "Invalid field value",
         "details": [ ... ]
       }
     }
     ```
4. **Error Handling**:
   * Use centralized error-handling middleware. Do not leak database stack traces or secret details in production responses.
5. **Security**:
   * Never hardcode database credentials or secret keys. Use `process.env`.
   * Hash passwords using `bcrypt` (minimum 10 salt rounds).
   * Configure `cors`, `helmet`, and request rate limiting.

---

## 5. Frontend Rules
1. **Component-Based Architecture**: Keep components modular, clean, and reusable in `frontend/src/components`.
2. **State Management & API Layer**:
   * Centralize API calls in `frontend/src/services/api.js`.
   * Use environment variables (`VITE_API_BASE_URL`) for backend endpoints.
3. **UI/UX Guidelines**:
   * Responsive layout supporting mobile, tablet, and desktop screens.
   * High visual clarity for emergency information (badges, alerts, clear status indicators).
   * Handle loading states, empty states, and user-friendly error banners on all pages.

---

## 6. Testing Strategy & Execution
1. **Backend Tests**:
   * Unit and integration tests using Jest / Supertest for API routes and controllers.
2. **Database Tests**:
   * Verify schema integrity, foreign key constraints, default timestamps, and trigger/view functionality.
3. **Frontend Verification**:
   * Component test or Playwright scripts for frontend user flows.
4. **Execution Mandate**:
   * Before committing any implementation task, run all backend tests (`npm test` in backend directory) and verify frontend builds (`npm run build` in frontend directory).

---

## 7. Git & Development Workflow
1. **Pre-commit Verification**:
   * Ensure `.env` is NOT tracked by Git (`.gitignore` must contain `.env`).
   * Run code style/lint checks if configured.
2. **Commit Messages**:
   * Write concise, descriptive commit messages specifying the feature or fix (e.g., `docs: create project specifications and architecture docs`).
3. **Phase-Based Progress**:
   * Always follow the development plan defined in `docs/development-plan.md`.
   * Complete and verify one phase before moving to the next.
