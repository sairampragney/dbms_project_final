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

* **Frontend**: React 18, Vite, React Router v6, Responsive CSS / Component Architecture.
* **Backend**: Node.js, Express.js REST API, JWT Authentication, Role-Based Access Control (RBAC).
* **Database**: MySQL 8.0+ normalized relational database (3NF), InnoDB engine, parameterized connection pooling, indexes, views, triggers.
* **DevOps & Infrastructure**: Docker, Docker Compose, environment configuration (`.env`).
* **Deployment Architecture**: Vercel (Frontend), Render (Backend Web Service), Managed MySQL (Database).

---

## 📁 Repository Structure

```
.
├── PRD.md                  # Product Requirements Document
├── AGENTS.md               # Guidelines & Rules for AI Agents (Jules)
├── README.md               # Project Overview & Setup Guide
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── docs/                   # Architecture & System Specifications
│   ├── architecture.md     # High-Level Architecture & Deployment Topology
│   ├── database-design.md  # 3NF Relational Schema, Tables, Views & Triggers
│   ├── api-design.md       # REST API Endpoints Specification
│   └── development-plan.md # 10-Phase Implementation Roadmap
├── database/               # MySQL Schema & Seeds (To be populated in Phase 2)
├── backend/                # Express REST API Server (To be created in Phase 3)
└── frontend/               # React / Vite SPA (To be created in Phase 4)
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

## 🚀 Quick Start (Local Development Preview)

### Prerequisites
* [Node.js (v18+)](https://nodejs.org/)
* [Docker & Docker Compose](https://www.docker.com/) (Recommended) or local MySQL 8.0+ server

### Local Docker Environment
```bash
# 1. Clone the repository
git clone https://github.com/sairampragney/dbms_project_final.git
cd dbms_project_final

# 2. Copy environment file
cp .env.example .env

# 3. Start local services using Docker Compose
docker-compose up -d --build
```

---

## 📜 License
This project is developed as part of an advanced university DBMS full-stack application.
