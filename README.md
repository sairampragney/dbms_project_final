# Disaster Alert and Community Response App

A production-ready full-stack web application built to help communities manage disaster-related information, broadcast real-time emergency alerts, report local incidents, request emergency aid, locate safe shelters, and coordinate volunteer emergency response activities.

---

## 📌 Project Overview

This repository contains the complete full-stack codebase and comprehensive architecture specifications for the **Disaster Alert and Community Response App**.

The platform provides a centralized, real-time coordination tool for three distinct user groups:
* **Citizens**: Stay informed on active disaster alerts, locate open emergency shelters, report incidents, and submit urgent requests for rescue, medical, food, or evacuation assistance.
* **Volunteers / Community Responders**: Offer skills (first aid, search & rescue, logistics, transport), view assigned emergency tasks, and log response activities.
* **Emergency Administrators**: Broadcast disaster warnings, manage shelter capacity, triage emergency assistance requests, and coordinate volunteer response assignments.

---

## 🌐 Live Application & Deployment Topology

The application is deployed across cloud infrastructure:

```text
GitHub Pages (Frontend)
    ↓ HTTPS API Requests
Render Web Service (Express REST API)
    ↓
MySQL Database (Relational Engine)
```

* **Frontend SPA Host**: [https://sairampragney.github.io/dbms_project_final/](https://sairampragney.github.io/dbms_project_final/) (GitHub Pages)
* **Production API Base URL**: [https://dbms-project-final-7h2f.onrender.com/api](https://dbms-project-final-7h2f.onrender.com/api)

---

## 🛠️ Technology Stack

### Frontend
* **Framework**: React 18
* **Build Tool**: Vite
* **Routing**: React Router v6 (`HashRouter` for GitHub Pages support)
* **HTTP Client**: Axios
* **Styling & UI**: Custom responsive CSS system with Lucide Icons

### Backend
* **Runtime**: Node.js & Express.js REST API
* **Security & Auth**: JWT Authentication, Role-Based Access Control (RBAC), Helmet, Express Rate Limit
* **Middleware**: CORS, Request Sanitization, Error Handling Middleware

### Database
* **Engine**: MySQL 8.0+ (3NF Relational Database Schema)
* **Features**: Connection pooling, Transactions, Indexes, Prepared Statements, Views, Triggers

### DevOps & Infrastructure
* **CI/CD & Hosting**: GitHub Actions (`deploy.yml`), GitHub Pages (Frontend Host)
* **Backend Hosting**: Render
* **Containerization**: Docker, Docker Compose

---

## 💻 Local Development Setup

### Prerequisites
* Node.js (v18 or v20) & npm
* Docker Desktop (optional, for multi-container local stack)

### 1. Frontend Development
```bash
cd frontend
npm install
npm run dev
```
Access frontend at `http://localhost:3000`.

### 2. Backend Development
```bash
cd backend
npm install
npm run dev
```
Access backend API at `http://localhost:5000/api`.

### 3. Full-Stack Launch via Docker Compose
```bash
docker-compose up -d --build
```
* **Frontend**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000/api`
* **MySQL**: `localhost:3306`

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description | Default / Production Value |
|---|---|---|
| `VITE_API_BASE_URL` | Base API URL for backend calls | `https://dbms-project-final-7h2f.onrender.com/api` |

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Express server port | `5000` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `rootpassword` |
| `DB_NAME` | MySQL database name | `disaster_response_db` |
| `JWT_SECRET` | Secret key for JWT signing | `super_secret_jwt_key` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://sairampragney.github.io` |

---

## 📁 Repository Structure

```text
.
├── .github/workflows/
│   ├── ci.yml               # Automated CI workflow
│   └── deploy.yml           # GitHub Pages deployment workflow
├── backend/                 # Express REST API Server
│   ├── src/                 # Controllers, routes, models, middleware
│   ├── tests/               # Automated API & security integration tests
│   └── Dockerfile           # Backend container setup
├── database/                # MySQL Schema, Seeds & Migration scripts
│   ├── schema.sql           # DDL schema definitions
│   └── seed.sql             # Demo seed dataset
├── docs/                    # Architecture & system specifications
├── frontend/                # React / Vite Single Page Application
│   ├── src/                 # React components, pages, context, services
│   ├── index.html           # HTML entry point with app metadata
│   ├── package.json         # Frontend dependencies & scripts
│   └── vite.config.js       # Vite build & base path config (/dbms_project_final/)
├── docker-compose.yml       # Multi-container local deployment
├── PRD.md                   # Product Requirements Document
└── README.md                # Project README
```

---

## 🚀 GitHub Pages Deployment Setup

To deploy the frontend to GitHub Pages automatically via GitHub Actions:
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Push changes to the `main` branch. The `.github/workflows/deploy.yml` workflow will automatically build `frontend/` and deploy `frontend/dist` to `https://sairampragney.github.io/dbms_project_final/`.

---

## 🔒 Security & Best Practices

* Zero secrets committed to frontend source or git.
* HTTPS enforced for production API communication.
* Role-Based Access Control (RBAC) enforced on protected REST routes.
