# Testing Strategy & Automated QA Pipeline

## Automated Test Suites

### 1. Database DDL/DML Structural Validation
- **Script:** `database/validate_db.py`
- **Purpose:** Verifies SQL syntax, constraint definitions, foreign keys, triggers, and seed script execution for `database/schema.sql` and `database/seed.sql`.

### 2. Express REST API Integration Test Suite
- **Script:** `backend/tests/run_test.js`
- **Purpose:** Tests Express routing on `/api` and `/api/v1`, health endpoints (`/health`, `/ready`), input validation middleware, and auth guards.

### 3. Security Assertion & Production Hardening Suite
- **Script:** `backend/tests/run_security_tests.js`
- **Purpose:** Verifies input sanitization, rejection of tampered/expired JWT tokens, rate limiting headers, error response standardization, and 404 envelopes.

### 4. End-to-End Workflow Integration Test Suite
- **Script:** `backend/tests/run_e2e_tests.js`
- **Purpose:** Validates end-to-end user workflows including user registration validation, incident geolocation boundaries, emergency request priority triage, safe shelter aliasing, and volunteer response authorization.

## Executing Tests Locally

To run all automated test suites sequentially:

```bash
# 1. Validate Database Schema & Seeds
python3 database/validate_db.py

# 2. Run REST API Suite
node backend/tests/run_test.js

# 3. Run Security Assertion Suite
node backend/tests/run_security_tests.js

# 4. Run E2E Integration Suite
node backend/tests/run_e2e_tests.js

# 5. Verify Frontend Production Build Compilation
npm run --prefix frontend build
```
