# Deployment Guide

This document details the deployment procedures and architecture for the Disaster Alert and Community Response App.

## 🏗️ Architecture Summary

```text
GitHub Pages (Frontend SPA)
    ↓ HTTPS REST Requests
Render Web Service (Express API)
    ↓
MySQL Database (Relational Store)
```

## 🌐 Production URLs

- **Frontend**: `https://sairampragney.github.io/dbms_project_final/`
- **Backend API**: `https://dbms-project-final-7h2f.onrender.com/api`

## 🚀 Frontend Deployment (GitHub Pages)

The frontend React/Vite application is deployed to GitHub Pages using the GitHub Actions workflow located at `.github/workflows/deploy.yml`.

### Configuration Steps
1. Navigate to GitHub repository Settings -> Pages.
2. Under **Source**, select **GitHub Actions**.
3. Any push to `main` branch or manual trigger via `workflow_dispatch` will automatically run `deploy.yml`.
4. Vite generates build artifacts under `frontend/dist/` with base path `/dbms_project_final/` and a fallback `404.html` copy for SPA routing.

## ⚙️ Backend Deployment (Render)

The Express backend runs on Render as a Web Service.
- Environment variables configured on Render include `PORT`, `NODE_ENV=production`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, and `JWT_SECRET`.
- CORS in Express (`backend/src/app.js`) is configured to allow requests from GitHub Pages (`https://sairampragney.github.io`).
