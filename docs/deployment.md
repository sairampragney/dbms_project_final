# Production Deployment Guide

## Disaster Alert and Community Response App

---

## 📌 1. Deployment Architecture Overview

The application is prepared for a cost-effective, high-availability, serverless & container-compatible cloud deployment across three dedicated services:

```
+-------------------------------------------------------------------------------+
|                             FRONTEND TIER                                     |
|                                                                               |
|  Vercel Edge Network (React 18 + Vite SPA)                                    |
|  - Automatic GitHub CI/CD deployments on push to `main`                       |
|  - Client-side React Router rewrites handled via `vercel.json`               |
|  - Custom Domain / SSL Encryption (HTTPS)                                     |
+--------------------------------------+----------------------------------------+
                                       |
                                HTTPS / REST API
                                       |
+--------------------------------------v----------------------------------------+
|                             BACKEND TIER                                      |
|                                                                               |
|  Render Web Service (Node.js / Express REST API)                             |
|  - Environment: Node.js 18 runtime                                            |
|  - Build Command: `cd backend && npm install`                                 |
|  - Start Command: `cd backend && npm start`                                   |
|  - Health Endpoint: `https://<render-service>.onrender.com/api/v1/health`    |
|  - CORS Restriction: Restricted to Vercel production origin                   |
+--------------------------------------+----------------------------------------+
|                                      |
                             TCP / TLS Connection
                               (MySQL Pool)
                                       |
+--------------------------------------v----------------------------------------+
|                            DATABASE TIER                                      |
|                                                                               |
|  Cloud MySQL Database Service (Aiven / PlanetScale / Railway / Render)       |
|  - Engine: MySQL 8.0+ (InnoDB, `utf8mb4_unicode_ci`)                          |
|  - Initialization DDL: `database/schema.sql`                                  |
|  - Seed Data: `database/seed.sql`                                             |
+-------------------------------------------------------------------------------+
```

---

## 🌐 2. Environment Variables Reference Matrix

### 2.1 Vercel Frontend Environment Variables
Set these variables in the **Vercel Project Settings -> Environment Variables**:

| Variable Name | Example Production Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://disaster-backend.onrender.com/api/v1` | Production URL of the deployed Render backend service |

### 2.2 Render Backend Environment Variables
Set these variables in the **Render Web Service -> Environment**:

| Variable Name | Example Production Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production error sanitization and CORS origin enforcement |
| `PORT` | `10000` | Render assigned application port |
| `CORS_ORIGIN` | `https://disaster-app.vercel.app` | Allowed frontend origin for CORS requests |
| `DB_HOST` | `mysql-prod-instance.aivencloud.com` | Hostname of remote cloud MySQL database |
| `DB_PORT` | `24000` | Port of cloud MySQL database |
| `DB_NAME` | `disaster_response_db` | MySQL database name |
| `DB_USER` | `disaster_prod_user` | MySQL database username |
| `DB_PASSWORD` | `<secure_cloud_db_password>` | MySQL database password |
| `JWT_SECRET` | `<random_64_char_secret_key>` | Production JWT signing secret key |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |

---

## 🗄️ 3. Production MySQL Database Setup

1. **Provision MySQL Instance**:
   * Create a MySQL 8.0+ instance on a cloud provider (Aiven for MySQL, Railway, PlanetScale, or Render Managed MySQL).
2. **Execute Schema & Seed Scripts**:
   * Connect to the remote database using MySQL Workbench or CLI:
     ```bash
     mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/schema.sql
     mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/seed.sql
     ```
3. **Database Permissions**:
   * Ensure the database user has permissions for `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE VIEW`, and `TRIGGER` execution.

---

## 🚀 4. Render Backend Deployment Steps

1. **Connect Repository**:
   * Log into [Render Dashboard](https://dashboard.render.com/) -> New -> **Web Service**.
   * Connect GitHub repository `sairampragney/dbms_project_final`.
2. **Service Configuration**:
   * **Name**: `disaster-response-backend`
   * **Environment**: `Node`
   * **Region**: Choose closest to your target audience.
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
3. **Configure Environment Variables**:
   * Add all backend variables listed in Section 2.2.
4. **Health Check Path**:
   * Set Health Check Path to `/api/v1/health`.

---

## ⚡ 5. Vercel Frontend Deployment Steps

1. **Connect Repository**:
   * Log into [Vercel Dashboard](https://vercel.com/) -> New Project -> Import `sairampragney/dbms_project_final`.
2. **Project Settings**:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
3. **Configure Environment Variables**:
   * Add `VITE_API_BASE_URL` pointing to your deployed Render URL (e.g. `https://disaster-response-backend.onrender.com/api/v1`).
4. **Deploy**:
   * Click **Deploy**. Vercel will build the React SPA and serve it over its global CDN. Client-side routing is handled via `frontend/vercel.json`.

---

## ✅ 6. Post-Deployment Verification Checklist

1. **Health Check**:
   * Visit `https://<render-backend>.onrender.com/api/v1/health` and verify `{"success": true, "data": {"status": "UP", "database": "CONNECTED"}}`.
2. **Frontend Loading**:
   * Visit `https://<vercel-frontend>.vercel.app` and verify dashboard metrics populate from the live database.
3. **Authentication & JWT**:
   * Register a new user, log in, verify JWT token persistence, and navigate protected views.
4. **Full Triage Flow**:
   * Submit an incident report and emergency aid request. Confirm records persist in the production database.

---

## 🔧 7. Deployment Troubleshooting

| Issue / Symptom | Likely Cause | Resolution |
| :--- | :--- | :--- |
| `CORS Error: Not allowed by CORS origin restriction` | `CORS_ORIGIN` on Render does not match exact Vercel URL. | Update Render `CORS_ORIGIN` variable to match `https://<your-app>.vercel.app` (no trailing slash). |
| `404 Not Found` on page refresh in Vercel | Vercel rewrites missing for Single Page App client routes. | Ensure `frontend/vercel.json` exists with route rewrite rule to `/index.html`. |
| `ECONNREFUSED` in Render logs | Invalid MySQL connection parameters or firewall restriction. | Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` and enable SSL options if required by provider. |
