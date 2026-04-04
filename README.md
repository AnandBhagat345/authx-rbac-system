# AuthX – Role-Based Authentication & Access Control System

> A reusable authentication and authorization system built with Django REST Framework and JWT.

# AuthX RBAC System

A full-stack Role-Based Access Control (RBAC) system built using Django REST Framework and React. The project provides secure authentication, dynamic role assignment, permission-based access control, audit logging, email verification, password reset functionality, and admin-level user management.

---

## Features

* JWT Authentication (Access + Refresh Tokens)
* Role-Based Access Control (RBAC)
* Dynamic Permission Management
* Email Verification System
* Password Reset Flow
* Audit Logging
* User Search and Role Filtering
* Pagination for Scalable User Management
* Protected Frontend Routes
* Admin Dashboard for Role Assignment

---

## Architecture

```text
React Frontend
     ↓
Axios API Requests
     ↓
Django REST Framework API
     ↓
JWT Authentication Layer
     ↓
RBAC Engine (Roles + Permissions)
     ↓
Database (SQLite / PostgreSQL)
```

---

## Tech Stack

* Django
* Django REST Framework
* React
* Vite
* Simple JWT
* SQLite / PostgreSQL
* Axios

---

## API Endpoints

| Method | Endpoint                     | Purpose                |
| ------ | ---------------------------- | ---------------------- |
| POST   | /api/register/               | Register new user      |
| POST   | /api/token/                  | User login             |
| POST   | /api/token/refresh/          | Refresh JWT token      |
| POST   | /api/logout/                 | Logout user            |
| GET    | /api/users/                  | List users             |
| POST   | /api/users/{id}/assign-role/ | Assign role to user    |
| GET    | /api/audit-logs/             | View audit logs        |
| POST   | /api/password-reset/         | Request password reset |

---


## Installation

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Project Highlights

* Built custom User model with email-based authentication
* Implemented role-permission relationship using ManyToMany architecture
* Added permission-controlled API access
* Designed audit logging for sensitive actions
* Built scalable user management with filtering and pagination

---

## Future Improvements

* Swagger API Documentation
* Backend Unit Testing
* Docker Deployment
* Role Analytics Dashboard
* Activity Notifications

---

## Resume Value

This project demonstrates:

* Backend architecture design
* Authentication and authorization logic
* Full-stack integration
* Real-world admin system thinking
* Scalable API development


## Key Learning Outcomes

* Secure token handling
* Permission based frontend rendering
* Backend authorization control
* Audit trail implementation

---

## Author

Anand
