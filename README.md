# XU-ARO Alumni Management System

**Version:** 1.0.0-beta.1

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
- **Real-Time Notifications** — In-app notifications delivered over Socket.io
- **Email Notifications** — Automated emails via Nodemailer for application status updates

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
| Real-Time | Socket.io |
| Containerization | Docker, Docker Compose, Nginx |

---

## Project Structure

```
G8-XU-ARO-Alumni-Management-System/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route handler logic
│   ├── middleware/      # JWT auth, admin guard, file upload
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── utils/           # Email service (Nodemailer)
│   ├── uploads/         # Uploaded files (gitignored)
│   ├── seedStaff.js     # Script to seed initial staff accounts
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

- [Node.js 20+](https://nodejs.org/) and npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works) or a local MongoDB instance
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials configured for **Web application**
- Docker & Docker Compose (optional, for containerized setup)

### Environment Variables

Create `.env` files in both `backend/` and `frontend/` before starting the app.

**`backend/.env`**
```env
# Database
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_jwt_secret_key

# Server (optional — defaults to 5000)
PORT=5000
FRONTEND_URL=http://localhost:5173

# Google OAuth (for alumni/staff login via Google)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Gmail OAuth (for email notifications — uses OAuth2, not app passwords)
GMAIL_CLIENT_ID=your_gmail_oauth_client_id
GMAIL_CLIENT_SECRET=your_gmail_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_oauth_refresh_token
EMAIL_USER=your_gmail_address@gmail.com

# Google Drive Backup (optional — enables automated daily database snapshots)
DRIVE_CLIENT_ID=your_drive_oauth_client_id
DRIVE_CLIENT_SECRET=your_drive_oauth_client_secret
DRIVE_REFRESH_TOKEN=your_drive_oauth_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
```

> **Note:** `GMAIL_*` and `DRIVE_*` credentials can be the same Google Cloud project credentials. The Google Drive backup feature is optional — the server will log a warning on startup if the credentials are missing but will still function normally.

**`frontend/.env`**

The frontend does not require any environment variables for local development. All API calls are proxied through the backend.

---

### Local Development (Step-by-Step)

#### 1. Clone the repository

```bash
git clone https://github.com/2502-XU-ITCC15-1A/G8-XU-ARO-Alumni-Management-System.git
cd G8-XU-ARO-Alumni-Management-System
```

#### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env` using the template above, then start the development server:

```bash
npm run dev
```

The backend will start at **http://localhost:5000**. You should see `MongoDB Connected Successfully` in the console.

#### 3. Seed the initial staff accounts

In a new terminal, while the backend is running (or with `MONGO_URI` available):

```bash
cd backend
node seedStaff.js
```

This creates the two default staff accounts:

| Role | Email | Password |
|---|---|---|
| XU-ARO Staff | `aro@xu.edu.ph` | `aro@2026` |
| Book Center | `bookcenter@xu.edu.ph` | `bookcenter@2026` |

> Change these credentials after first login in a production environment.

#### 4. Set up the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:5173**.

#### 5. Access the application

Open **http://localhost:5173** in your browser. You can log in with the seeded staff accounts or register a new alumni account.

---

### Docker

**Development** (mounts source for live reload)
```bash
docker-compose up
```

**Production** (multi-stage build, served by Nginx)
```bash
docker-compose -f docker-compose.prod.yml up
```

The production setup uses a multi-stage frontend build served by Nginx, which also reverse-proxies API requests to the backend.

> Both Docker setups require the `.env` files in `backend/` and `frontend/` to be present before running.

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
| `/api/notifications` | In-app notification management |
| `/api/users` | User account management (admin) |
| `/api/book-center` | Book center / external portal operations |

Protected routes require an `Authorization: Bearer <token>` header.

---

## Scripts

**Backend (`backend/`)**

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with Nodemon (auto-reload) |
| `node seedStaff.js` | Seed initial XU-ARO staff accounts |

**Frontend (`frontend/`)**

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
