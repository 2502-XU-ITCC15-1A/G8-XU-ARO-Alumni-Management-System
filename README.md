# XU-ARO Alumni Management System

A full-stack web application for Xavier University - Ateneo de Cagayan's Alumni Relations Office (XU-ARO). It provides alumni profile management, educational and work history tracking, alumni ID card application processing, and role-based portals for alumni, XU-ARO staff, and external book center personnel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Development](#local-development)
  - [Docker](#docker)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Scripts](#scripts)

---

## Features

- **Authentication** — Email/password login and Google OAuth 2.0, secured with JWT tokens
- **Alumni Profiles** — Manage personal info, contact details, and family information
- **Education & Work History** — Track multiple education records and work experiences per alumni
- **ID Card Applications** — End-to-end workflow from application submission to ID release, including payment receipt upload and admin approval stages
- **Role-Based Access Control** — Separate portals and protected routes for alumni, XU-ARO staff, and book center personnel
- **File Uploads** — Receipt images and signature files via Multer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router DOM 7, Vite 8, Bootstrap 5 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT, bcryptjs, Google OAuth 2.0 |
| File Uploads | Multer |
| Email | Nodemailer |
| Containerization | Docker, Docker Compose, Nginx |

---

## Project Structure

```
G8-XU-ARO-Alumni-Management-System/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # JWT auth, file upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── uploads/         # Uploaded files (gitignored)
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Layouts, sidebars, shared components
│   │   └── pages/       # admin/, alumni/, external/ portals
│   ├── public/
│   └── index.html
├── docker-compose.yml       # Development containers
├── docker-compose.prod.yml  # Production containers
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)
- A Google Cloud project with OAuth 2.0 credentials
- Docker & Docker Compose (optional)

### Environment Variables

**`backend/.env`**
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

**`frontend/.env`**
```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/2502-XU-ITCC15-1A/G8-XU-ARO-Alumni-Management-System.git
cd G8-XU-ARO-Alumni-Management-System

# 2. Install and start the backend (runs on http://localhost:5000)
cd backend
npm install
npm run dev

# 3. In a separate terminal, install and start the frontend (runs on http://localhost:5173)
cd frontend
npm install
npm run dev
```

### Docker

**Development**
```bash
docker-compose up
```

**Production**
```bash
docker-compose -f docker-compose.prod.yml up
```

The production setup uses a multi-stage frontend build served by Nginx, which also reverse-proxies API requests to the backend.

---

## User Roles

| Role | Description |
|---|---|
| `alumni` | Register, manage their own profile, education, work history, and apply for an ID card |
| `xu-aro` | XU-ARO staff — view and manage all alumni records, review and approve ID applications |
| `external` | Book center personnel — view approved applications and process ID printing/release |

---

## API Overview

All endpoints are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `/api/auth` | Register, login, Google OAuth |
| `/api/alumni` | Alumni profile CRUD |
| `/api/education` | Education history CRUD |
| `/api/work` | Work experience CRUD |
| `/api/IdApplication` | ID card application workflow |

Protected routes require an `Authorization: Bearer <token>` header.

---

## Scripts

**Backend (`backend/`)**

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with Nodemon (auto-reload) |

**Frontend (`frontend/`)**

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
