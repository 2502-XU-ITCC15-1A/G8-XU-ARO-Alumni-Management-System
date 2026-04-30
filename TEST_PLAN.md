# Test Plan — G8-XU-ARO Alumni Management System

---

## 1. Test Plan Information

| Field                  | Details                                          |
|------------------------|--------------------------------------------------|
| **Project / Activity Name** | G8-XU-ARO Alumni Management System         |
| **System / Service Tested** | Full-Stack Web Application (Backend API + React Frontend) |
| **Prepared by**        | Gwyn Dayot                                       |
| **Date**               | 2026-04-29                                       |
| **Environment**        | Local Development — Windows 11, Node.js + MongoDB, Vite Dev Server |

---

## 2. Objective

To verify that all core features of the Alumni Management System function correctly end-to-end, including user authentication (JWT and Google OAuth), alumni profile management, education and work history CRUD operations, and the multi-stage university ID application workflow across three user roles: Alumni, Admin, and Book Center.

---

## 3. Test Scope

**Included:**
- User registration, login, and Google OAuth authentication
- Role-based access control (Alumni, Admin, Book Center)
- Alumni profile creation, retrieval, and update
- Education record CRUD operations
- Work history CRUD operations
- ID application submission, file upload, and status lifecycle
- Admin review and status transitions (pending → approved → printing → released)
- Book Center processing view
- Input validation and error handling on API endpoints
- JWT token protection on private routes

**Excluded:**
- Load / performance testing
- Cross-browser compatibility beyond Chrome
- Mobile responsiveness testing
- Email delivery (Nodemailer) in production environment
- Database backup and recovery procedures

---

## 4. Test Environment

| Item                   | Details                                          |
|------------------------|--------------------------------------------------|
| **Operating System**   | Windows 11 Home Single Language                  |
| **Backend Runtime**    | Node.js with Express 5.2.1                       |
| **Frontend Tooling**   | React 19 + Vite Dev Server                       |
| **Database**           | MongoDB (local or Atlas cluster)                 |
| **Tools Used**         | Browser (Chrome), Postman / Thunder Client, VS Code Terminal |
| **Network Setup**      | Localhost — Backend on port 5000, Frontend on port 5173 |
| **Auth Method**        | JWT Bearer tokens; Google OAuth 2.0              |

---

## 5. Test Cases

### 5.1 Authentication

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Register a new alumni account | POST `/api/auth/register` with valid name, email, password, role=alumni | 201 response; user created in DB | | |
| TC-02 | Register with duplicate email | POST `/api/auth/register` with an already-registered email | 400 error — "Email already in use" | | |
| TC-03 | Register with missing fields | POST `/api/auth/register` omitting password | 400 validation error returned | | |
| TC-04 | Login with valid credentials | POST `/api/auth/login` with correct email & password | 200 response with JWT token | | |
| TC-05 | Login with wrong password | POST `/api/auth/login` with incorrect password | 401 Unauthorized error | | |
| TC-06 | Google OAuth login | POST `/api/auth/google` with valid Google ID token | 200 response with JWT token; user created if new | | |
| TC-07 | Access protected route without token | GET `/api/alumni/me` with no Authorization header | 401 Unauthorized | | |
| TC-08 | Access protected route with valid token | GET `/api/alumni/me` with `Bearer <token>` header | 200 with alumni profile data | | |
| TC-09 | Access protected route with expired token | GET `/api/alumni/me` with expired JWT | 401 Unauthorized | | |

---

### 5.2 Alumni Profile Management

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-10 | Create alumni profile | POST `/api/alumni` with auth token and full profile payload | 201; profile saved in DB | | |
| TC-11 | Get own profile | GET `/api/alumni/me` with valid alumni token | 200 with own profile JSON | | |
| TC-12 | Update own profile | PUT `/api/alumni/me` with updated fields | 200; updated fields persisted in DB | | |
| TC-13 | Admin retrieves all alumni profiles | GET `/api/alumni` with admin token | 200 array of all profiles | | |
| TC-14 | Admin deletes an alumni profile | DELETE `/api/alumni/:id` with admin token | 200; profile removed from DB | | |
| TC-15 | Alumni cannot delete another user's profile | DELETE `/api/alumni/:id` with non-admin alumni token | 403 Forbidden | | |

---

### 5.3 Education Records

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-16 | Add education record | POST `/api/education` with school, degree, graduation year | 201; record saved linked to logged-in user | | |
| TC-17 | Retrieve own education records | GET `/api/education` with valid token | 200 array of education entries | | |
| TC-18 | Update education record | PUT `/api/education/:id` with updated fields | 200; record updated in DB | | |
| TC-19 | Delete education record | DELETE `/api/education/:id` with valid token | 200; record removed | | |
| TC-20 | Add education without auth | POST `/api/education` with no token | 401 Unauthorized | | |

---

### 5.4 Work History

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-21 | Add work record | POST `/api/work` with company, position, contact info | 201; work record saved | | |
| TC-22 | Retrieve work records | GET `/api/work` with valid token | 200 array of work entries | | |
| TC-23 | Update work record | PUT `/api/work/:id` with modified position | 200; change persisted | | |
| TC-24 | Delete work record | DELETE `/api/work/:id` | 200; record removed | | |
| TC-25 | Add work record without auth | POST `/api/work` with no token | 401 Unauthorized | | |

---

### 5.5 ID Application Workflow

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-26 | Alumni submits ID application | POST `/api/IdApplication` with all required fields and alumni token | 201; application created with status=pending | | |
| TC-27 | Alumni views own applications | GET `/api/IdApplication/my` with alumni token | 200 array of own applications | | |
| TC-28 | Submit application without required fields | POST `/api/IdApplication` missing graduation year | 400 validation error | | |
| TC-29 | Upload payment receipt | POST `/api/IdApplication/upload/:id` with image file | 200; receipt path saved to application | | |
| TC-30 | Upload non-image file | POST `/api/IdApplication/upload/:id` with a .pdf file | 400 error — invalid file type | | |
| TC-31 | Admin approves application | PUT `/api/IdApplication/:id` body `{status: "approved"}` with admin token | 200; status updated to approved | | |
| TC-32 | Admin sets status to printing | PUT `/api/IdApplication/:id` body `{status: "printing"}` | 200; status updated to printing | | |
| TC-33 | Book Center sets status to released | PUT `/api/IdApplication/:id` body `{status: "released"}` with book_center token | 200; status updated to released | | |
| TC-34 | Alumni cannot change application status | PUT `/api/IdApplication/:id` body `{status: "approved"}` with alumni token | 403 Forbidden | | |
| TC-35 | Admin retrieves all applications | GET `/api/IdApplication` with admin token | 200 array of all applications | | |
| TC-36 | Admin deletes application | DELETE `/api/IdApplication/:id` with admin token | 200; application removed from DB | | |

---

### 5.6 Role-Based Access Control

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-37 | Alumni cannot access admin dashboard route | Navigate to `/admin/dashboard` as alumni user | Redirect to alumni dashboard or 403 page | | |
| TC-38 | Book Center cannot access alumni records | Navigate to `/admin/alumni-records` as book_center user | Redirect or 403 page | | |
| TC-39 | Unauthenticated user redirected to login | Navigate to any protected page without session | Redirect to login page | | |
| TC-40 | Admin can view all three role-based views | Login as admin and navigate admin-only pages | All admin pages load without errors | | |

---

### 5.7 Frontend UI Flows

| Test Case ID | Description | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-41 | Alumni completes registration and onboarding | Open app → Register → Fill profile → Save | Profile saved; dashboard loads with correct data | | |
| TC-42 | Alumni fills and submits ID application form | Login → Go to ID Application → Fill form → Submit | Success message; application appears in "My Applications" | | |
| TC-43 | Admin reviews and approves an application | Login as admin → Open application → Change status → Save | Status badge updates to "Approved" in UI | | |
| TC-44 | Book Center marks ID as released | Login as book_center → Find approved application → Mark released | Status updates to "Released" | | |
| TC-45 | Login form shows error on bad credentials | Enter wrong password → Submit | Error message displayed below form | | |

---

## 6. Summary

| Category              | Total Cases | Pass | Fail | Not Run |
|-----------------------|-------------|------|------|---------|
| Authentication        | 9           |      |      |         |
| Alumni Profile        | 6           |      |      |         |
| Education Records     | 5           |      |      |         |
| Work History          | 5           |      |      |         |
| ID Application        | 11          |      |      |         |
| Role-Based Access     | 4           |      |      |         |
| Frontend UI Flows     | 5           |      |      |         |
| **Total**             | **45**      |      |      |         |
