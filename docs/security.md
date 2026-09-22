# Security Architecture & Production Hardening Policy

## 1. Authentication & Role Escalation Mitigation
- **Public Registration Isolation:** The public registration endpoint (`POST /api/v1/auth/register`) strictly forces `role = 'CITIZEN'`. Incoming `role` fields in request payloads are completely ignored to prevent administrative privilege escalation.
- **Account Active Status Enforcement:** Accounts flagged as disabled (`is_active = false`) are rejected at authentication time with `403 ACCOUNT_DISABLED`.
- **Email Normalization:** All user email addresses are trimmed and converted to lowercase during registration and login (`email.trim().toLowerCase()`).
- **Strict JWT Secret Policy:** The backend checks for `JWT_SECRET` in production environments (`NODE_ENV=production`) and fails startup if the variable is missing. Known fallback strings are restricted to non-production development environments.

## 2. Authorization & Role-Based Access Control (RBAC)
- **Citizens:** Permitted to view active alerts, report disaster incidents, submit emergency aid requests, view safe shelter locations, and view their own submitted records. Restricted from managing user roles or broadcasting administrative alerts.
- **Volunteers:** Permitted to manage assigned response activities and update availability statuses.
- **Administrators:** Full system privileges including creating/editing alerts, verifying incidents, managing shelter capacities, and assigning volunteer responders.
- **Server-Side Authorization Enforcer:** RBAC rules are enforced via Express middleware (`requireRole('ADMIN')`, `authenticateToken`).

## 3. Threat Protection & Injection Safeguards
- **SQL Injection Prevention:** 100% of SQL database operations utilize parameterized queries (`mysql2/promise` prepared statements).
- **Rate Limiting:** Dedicated authentication rate limiting (`authLimiter`) restricts login and registration attempts to max 20 requests per 15 minutes per IP. A global rate limiter caps general API traffic at 500 requests per 15-minute window.
- **Strict CORS Origin Whitelisting:** Cross-Origin Resource Sharing is configured in `backend/src/app.js` with explicit origin verification targeting `https://dbms-project-final.vercel.app` and Vercel preview deployment subdomains. Wildcard origins (`*`) are prohibited in production.
- **HTTP Security Headers:** Integrated `helmet` middleware provides Content-Security-Policy, Frameguard, XSS filter, and MIME-type sniffing protection.
