# 🏰 AuraHostel ERP — Intelligent Hostel Operations & Student Living Management

> **Enterprise-Grade Full-Stack Hostel Management System**  
> Synthesizing all **10 Engineering Laboratory Experiments** into one cohesive, runnable production-ready web application.

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/lavanyamahesh675-collab/aura-hostel)
[![24/7 Permanent Live URL](https://img.shields.io/badge/24%2F7_Permanent_Link-Active_Global_CDN-success?logo=githubpages)](https://lavanyamahesh675-collab.github.io/aura-hostel/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

### 🌐 Live Application Links

* **🌍 24/7 Permanent Deployed Link (Always Online / Zero Downtime):**  
  👉 **[https://lavanyamahesh675-collab.github.io/aura-hostel/](https://lavanyamahesh675-collab.github.io/aura-hostel/)**  
  *(Permanent Standalone Login Portal: [https://lavanyamahesh675-collab.github.io/aura-hostel/login.html](https://lavanyamahesh675-collab.github.io/aura-hostel/login.html))*

* **Official GitHub Repository:**  
  👉 **[https://github.com/lavanyamahesh675-collab/aura-hostel](https://github.com/lavanyamahesh675-collab/aura-hostel)**

* **Local Running Instance:**  
  👉 **[http://localhost:3000](http://localhost:3000)**  
  *(Login Portal: [http://localhost:3000/login](http://localhost:3000/login))*

---

## 📋 Table of Contents
1. [Live Application Links](#-live-application-links)
2. [Project Overview](#-project-overview)
3. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
4. [Engineering Experiments Synthesis](#-engineering-experiments-synthesis)
5. [Technology Stack](#-technology-stack)
6. [Cloud Deployment (Vercel / Render)](#-cloud-deployment-vercel--render)
7. [Environment Configuration (.env)](#-environment-configuration-env)
8. [Database Seeding & Demo Accounts](#-database-seeding--pre-seeded-accounts)
9. [REST API Documentation](#-rest-api-documentation)
10. [XML, DTD & XSD Policy Inspector](#-xml-dtd--xsd-policy-inspector)

---

## 🌟 Project Overview

**AuraHostel ERP** is an enterprise-level, production-oriented Hostel Management Platform designed for universities, engineering campuses, and residential institutions. It provides a visual dashboard, intelligent room allocation, student living self-service, complaint ticketing, payment processing, XML/DTD/XSD policy schema validation, and real-time Node.js OS & EventEmitter system telemetry.

---

## 🔬 Engineering Experiments Synthesis

| Exp # | Engineering Laboratory Subject | Module Implementation in AuraHostel ERP |
| :--- | :--- | :--- |
| **Exp 1 & 2** | HTML5, CSS3, Grid & Flexbox | 100vh/100vw full-screen responsive shell, glassmorphism theme, CSS Variables (`public/css/styles.css`, `public/index.html`). |
| **Exp 3** | Form Integrity & Focus Management | Client-side validation enforcing min 8-char student name regex, 10-digit phone regex, and immediate element focus (`.focus()`) on error (`public/js/validation.js`). |
| **Exp 4** | Dynamic Data Visualizations | Live Chart.js dashboard displaying room occupancy rate per block (Bar Chart) and mess diet distribution (Doughnut Chart) (`public/js/charts.js`). |
| **Exp 5 & 10** | RESTful CRUD Architecture & Persistence | Full RESTful endpoints under `/api/students`, `/api/rooms`, `/api/payments`, `/api/complaints` with MongoDB Mongoose schemas (`routes/studentRoutes.js`, `models/Student.js`). |
| **Exp 6** | XML, DTD & XSD Policy Engine | `hostelRules.xml` configuration for curfew hours and mess menu, validated against DTD grammar and XSD types via `/api/system/validate-schema` (`schemas/`, `services/schemaValidationService.js`). |
| **Exp 7 & 8** | Authentication & Session Tracking | Role-based authentication using `express-session`, signed HttpOnly authentication cookies, and RBAC authorization middleware (`routes/authRoutes.js`, `middleware/auth.js`). |
| **Exp 9** | Node.js Built-ins & Event Emitter | Native `http` server on port 3000, `os` & `path` telemetry via `/api/system/metrics`, and system `EventEmitter` audit logging (`studentAdmitted`, `roomVacated`, `curfewAlert`) (`server.js`, `routes/systemRoutes.js`). |

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript ES6+, Chart.js, FontAwesome 6, Google Fonts (Outfit & Fira Code).
- **Backend:** Node.js, Express.js, Native HTTP Server (`http.createServer`), `express-session`, `cookie-parser`, `bcryptjs`, `cors`, `helmet`, `express-rate-limit`, `fast-xml-parser`.
- **Database:** MongoDB with Mongoose Schemas & Models (with automatic high-performance In-Memory Fallback if MongoDB daemon is not pre-started locally).
- **Testing & Quality Assurance:** Jest & Supertest.

---

## 📂 Complete Directory Structure

```
aura-hostel/
├── package.json
├── package-lock.json
├── .env.example
├── .env
├── .gitignore
├── README.md
├── server.js               (Express Server, HTTP, EventEmitter, Middlewares, Routes)
├── config/
│   └── db.js               (Mongoose MongoDB Connection + In-Memory Fallback Store)
├── models/
│   ├── User.js             (User Account Schema with bcrypt hashing)
│   ├── Student.js          (Student Roster Schema)
│   ├── Room.js             (Room Inventory Schema)
│   ├── Payment.js          (Fee Payment Transaction Schema)
│   ├── Complaint.js        (Maintenance Ticket Schema)
│   ├── Attendance.js       (Hostel Entry & Attendance Schema)
│   ├── Visitor.js          (Visitor Entry Log Schema)
│   ├── Notice.js           (Announcements & Notice Board Schema)
│   └── ActivityLog.js      (System Telemetry & Audit Schema)
├── middleware/
│   ├── auth.js             (Session & Role-Based Access Control RBAC)
│   ├── errorHandler.js     (Centralized Express Error Handling)
│   └── validateRequest.js  (Express-Validator wrapper)
├── routes/
│   ├── authRoutes.js       (Login, Register, Session check, Logout)
│   ├── dashboardRoutes.js  (Aggregated Summary Analytics APIs)
│   ├── studentRoutes.js    (Student CRUD APIs: GET, POST, PATCH, DELETE)
│   ├── roomRoutes.js       (Room Inventory, Allocate & Vacate APIs)
│   ├── paymentRoutes.js    (Fee Payments & Receipt Generation APIs)
│   ├── complaintRoutes.js  (Complaint Ticketing APIs)
│   ├── attendanceRoutes.js (Attendance & Curfew APIs)
│   ├── visitorRoutes.js    (Visitor Check-In/Check-Out APIs)
│   ├── noticeRoutes.js     (Notice Board Publishing APIs)
│   └── systemRoutes.js     (OS Metrics, XML Validator & EventEmitter Audit APIs)
├── services/
│   ├── roomService.js      (Room Allocation & Vacancy Math Service)
│   ├── paymentService.js   (Fee Payment Recording Service)
│   ├── notificationService.js (Notice Publishing Service)
│   ├── auditService.js     (Activity Audit Logging Service)
│   └── schemaValidationService.js (XML, DTD & XSD Validator Service)
├── scripts/
│   ├── seed.js             (Master Seed Script)
│   └── validateSchemas.js  (Standalone Schema Validation Script)
├── schemas/
│   ├── hostelRules.xml     (XML Policy Configuration File)
│   ├── hostelRules.dtd     (DTD Grammar Definition)
│   └── hostelRules.xsd     (XSD Typed Schema Definition)
├── tests/
│   ├── auth.test.js        (Jest Authentication Tests)
│   ├── students.test.js    (Jest Student API Tests)
│   └── rooms.test.js       (Jest Room Allocation Tests)
└── public/
    ├── index.html          (Full-Screen Dashboard SPA Shell)
    ├── login.html          (Standalone Glassmorphic Login Page)
    ├── css/
    │   ├── styles.css      (Core Glassmorphic Theme & Variables)
    │   ├── components.css  (Buttons, Badges, Modals, Toasts)
    │   ├── dashboard.css   (Stat Cards & Dashboard Widgets)
    │   └── responsive.css  (Mobile & Tablet Breakpoints)
    └── js/
        ├── app.js          (Main SPA Application Coordinator)
        ├── api.js          (Centralized Fetch API Wrapper)
        ├── auth.js         (Authentication Form Handler)
        ├── validation.js   (Client-Side Form Validation Engine)
        ├── charts.js       (Chart.js Dynamic Graphs Controller)
        ├── students.js     (Student Roster & CSV Export Helper)
        ├── rooms.js        (Room Visual Allocator Helper)
        ├── payments.js     (Payment Recording Helper)
        ├── complaints.js   (Complaint Ticketing Helper)
        └── notifications.js (Toast Notification Manager)
```

---

## ⚡ Step-by-Step Installation & Launch Guide

### Step 1: Open Terminal in Project Directory
```bash
cd aura-hostel
```

### Step 2: Install Node Dependencies
```bash
npm install
```

> **Windows PowerShell Execution Policy Note:** If PowerShell blocks running `npm`, execute via `cmd`:
> ```cmd
> cmd /c npm install
> ```

### Step 3: Seed Database with Sample Records (Optional)
```bash
npm run seed
```
*(Seeds 8 Hostel Rooms, 6 Default Students, and Demo Accounts)*

### Step 4: Launch Server
```bash
npm start
```
or
```bash
node server.js
```

### Step 5: Access Application in Browser
Open your browser and navigate to:
👉 https://lavanyamahesh675-collab.github.io/aura-hostel/

---

## 🔑 Pre-seeded Demo Accounts

| Role | Username / Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Warden** | `warden@aurahostel.com` (or `warden`) | `admin123` | Full Operational Control & Room Allocation |
| **Admin** | `admin@aurahostel.com` (or `admin`) | `admin123` | System Settings & Audit Logs |
| **Student** | `alex@aurahostel.com` (or `alex`) | `student123` | Personal Roster, Fee Status & Complaints |

---

## 🧪 Testing & Quality Assurance

To execute automated unit and integration tests:
```bash
npm test
```

To run standalone XML, DTD & XSD schema validation:
```bash
npm run validate-schemas
```

---

## 📡 Key REST API Contracts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & set signed session cookie |
| `GET` | `/api/auth/me` | Fetch current active user session |
| `GET` | `/api/students` | Retrieve student roster (supports search, block & fee status filters) |
| `POST` | `/api/students` | Admit new student, validate fields & allocate room bed |
| `DELETE` | `/api/students/:id` | Vacate student room & restore room capacity |
| `GET` | `/api/rooms/all` | Fetch room inventory & occupancy counts |
| `POST` | `/api/payments` | Record fee payment & update student fee status |
| `GET` | `/api/system/metrics` | Retrieve Node.js OS CPU, RAM, Uptime & resolved file paths |
| `GET` | `/api/system/validate-schema` | Execute DTD & XSD validation on `hostelRules.xml` |

---

## 🛡️ License
MIT License — AuraHostel ERP Engineering Team.
