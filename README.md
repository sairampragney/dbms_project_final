# Disaster Alert and Community Response App

A production-style full-stack web application built to help communities manage disaster-related information, broadcast real-time emergency alerts, report local incidents, request emergency aid, locate safe shelters, and coordinate volunteer emergency response activities.

---

## 📌 Project Overview

This repository contains the complete full-stack codebase and comprehensive architecture specifications for the **Disaster Alert and Community Response App**.

The platform provides a centralized, real-time coordination tool for three distinct user groups:
* **Citizens**: Stay informed on active disaster alerts, locate open emergency shelters, report incidents, and submit urgent requests for rescue, medical, food, or evacuation assistance.
* **Volunteers / Community Responders**: Offer skills (first aid, search & rescue, logistics, transport), view assigned emergency tasks, and log response activities.
* **Emergency Administrators**: Broadcast disaster warnings, manage shelter capacity, triage emergency assistance requests, and coordinate volunteer response assignments.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, React Router v6, Responsive CSS System, Axios.
* **Backend**: Node.js, Express.js REST API, JWT Authentication, Role-Based Access Control (RBAC), Helmet, Express Rate Limit.
* **Database**: MySQL 8.0+ normalized relational database (3NF), InnoDB engine, parameterized connection pooling, indexes, views, triggers.
* **DevOps & Infrastructure**: Docker, Docker Compose, Nginx, environment configuration (`.env`).
* **Deployment Architecture**: Vercel (Frontend SPA), Render (Backend Express Web Service), Managed MySQL (Database).

---

## 🚀 Docker Quick Start (Local Development & Containerization)

The entire application stack (Frontend, Backend, MySQL Database) can be launched locally using Docker Compose:

### 1. Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### 2. Single-Command Launch
```bash
# Clone the repository
git clone https://github.com/sairampragney/dbms_project_final.git
cd dbms_project_final

# Build and start all containers in detached mode
docker-compose up -d --build
```

### 3. Container Services & Ports
* **Frontend SPA (Nginx)**: `http://localhost:3000`
* **Backend REST API (Express)**: `http://localhost:5000/api/v1`
* **MySQL Database**: `localhost:3306` (Database: `disaster_response_db`)

### 4. Stopping Container Services
```bash
docker-compose down -v
```

---

## 📁 Repository Structure

```
.
├── PRD.md                  # Product Requirements Document
├── AGENTS.md               # Guidelines & Rules for AI Agents (Jules)
├── README.md               # Project Overview & Setup Guide
├── docker-compose.yml      # Multi-container Docker Compose file
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── docs/                   # Architecture & System Specifications
│   ├── architecture.md     # High-Level Architecture & Deployment Topology
│   ├── database-design.md  # 3NF Relational Schema, Tables, Views & Triggers
│   ├── api-design.md       # REST API Endpoints Specification
│   └── development-plan.md # 10-Phase Implementation Roadmap
├── database/               # MySQL Schema & Seed SQL scripts
│   ├── schema.sql          # DDL table creation, views, triggers, constraints
│   ├── seed.sql            # Seed demo data
│   └── validate_db.py      # Schema syntax verification script
├── backend/                # Express REST API Server
│   ├── src/                # Controllers, routes, models, middleware
│   ├── tests/              # Automated API & security integration tests
│   └── Dockerfile          # Backend container build script
└── frontend/               # React / Vite Single Page Application
    ├── src/                # Pages, components, services, context
    ├── nginx.conf          # Nginx production configuration
    └── Dockerfile          # Multi-stage frontend container build script
```

---

## 📖 System Documentation

Detailed technical documentation is available in the `docs/` folder:

* **[PRD (`PRD.md`)](./PRD.md)**: Product vision, user roles, functional requirements, and non-functional goals.
* **[Agent Instructions (`AGENTS.md`)](./AGENTS.md)**: Coding standards, database rules, REST conventions, and Git workflow.
* **[Architecture Overview (`docs/architecture.md`)](./docs/architecture.md)**: 3-tier component architecture, container setup, and deployment flow.
* **[Database Design (`docs/database-design.md`)](./docs/database-design.md)**: Complete database schema, normalization analysis, entity relationships, views, and triggers.
* **[API Design (`docs/api-design.md`)](./docs/api-design.md)**: RESTful routes, request payloads, response envelopes, and HTTP status codes.
* **[Development Roadmap (`docs/development-plan.md`)](./docs/development-plan.md)**: 10-phase sequential development plan.

---

## 📜 License
This project is developed as part of an advanced university DBMS full-stack application.
