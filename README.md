# University Research Opportunity Portal

[![Course](https://img.shields.io/badge/Course-Computer%20Networks%20(CN)-blue.svg)](#)
[![Assignment](https://img.shields.io/badge/Assignment-01-brightgreen.svg)](#)
[![Student](https://img.shields.io/badge/Student-H.%20Abdullah%20%7C%20P22--9238-purple.svg)](#)
[![Class](https://img.shields.io/badge/Class-BCS--5C-orange.svg)](#)

A full-stack web application developed for university faculty members to post, view, update, and manage research opportunities in one place, backed by a REST API and MySQL database.

---

## 👤 Student Information
- **Name:** H. Abdullah
- **Roll Number:** P22-9238
- **Section / Class:** BCS-5C
- **Course:** Computer Networks (CN)
- **Institution:** National University of Computer & Emerging Sciences (FAST-NUCES), Peshawar Campus
- **Semester:** Fall-2026

---

## 🔗 Submission Links
- **GitHub Repository:** `https://github.com/M-Abdullah-99/research-opportunity-portal`
- **Demonstration Video:** `demonstration_video.mp4` (Included directly in the submission ZIP, 42 seconds)

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [Project Structure](#-project-structure)
4. [Prerequisites](#-prerequisites)
5. [Database Setup](#-database-setup)
6. [Installation & Execution](#-installation--execution)
7. [REST API Documentation](#-rest-api-documentation)
8. [Postman / Bruno Testing](#-postman--bruno-testing)
9. [One-Minute Demonstration Video](#-one-minute-demonstration-video)
10. [Submission Package Checklist](#-submission-package-checklist)

---

## ✨ Key Features

### Backend (REST API)
- Full **CRUD** implementation:
  - `POST /api/opportunities`: Create new research opportunity.
  - `GET /api/opportunities`: Retrieve all research opportunities.
  - `GET /api/opportunities/:id`: Retrieve single opportunity by ID.
  - `PUT /api/opportunities/:id`: Update existing opportunity details.
  - `DELETE /api/opportunities/:id`: Remove opportunity from database.
- Standard HTTP status codes: `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`.
- Server-side data validation and sanitized MySQL parameterized queries.

### Frontend (Client Interface)
- Responsive dashboard designed with modern typography and color tokens.
- Live statistics banner (Open positions, Closed positions, Total listings, Available student slots).
- Real-time search across titles, supervisors, departments, and skillsets.
- Quick filter by opportunity status (`Open` / `Closed`) and Department.
- Detail inspection modal.
- Create & Edit modals with instant client-side validation.
- Direct status toggling (`Open` ↔ `Closed`).
- Safe deletion with modal confirmation.
- Animated toast notifications for success and error feedback.

---

## 🛠 Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL 8.0+
- **Frontend:** Semantic HTML5, CSS3 (Modern Responsive Flexbox/Grid), Vanilla JavaScript (ES6+)
- **API Testing:** Postman Collection (v2.1.0)

---

## 📁 Project Structure

```text
P22_9238_H_Abdullah_BCS_5C/
├── database/
│   ├── db.js                 # MySQL connection pool & automatic table bootstrap
│   └── schema.sql            # SQL table schema & initial seed data
├── postman/
│   └── University_Research_Opportunity_Portal.postman_collection.json
├── public/
│   ├── index.html            # Main web portal interface
│   ├── style.css             # CSS design system
│   └── app.js                # Frontend REST API integration & UI logic
├── demonstration_video.mp4   # 42-second demo video of portal & API
├── .env.example              # Environment variables template (no credentials)
├── .gitignore                # Git ignore rules (node_modules, credentials)
├── package.json              # Project metadata & npm dependencies
├── README.md                 # Complete setup, documentation & student details
└── server.js                 # Express server & REST route handlers
```

---

## 📋 Prerequisites
Ensure you have the following installed:
- **Node.js** (v16.0 or higher)
- **MySQL Server** (v8.0 or higher)
- **Git**
- **Postman** or **Bruno** (for API testing)

---

## 🗄️ Database Setup

### Option 1: Automatic Setup via Server (Recommended)
1. Ensure your MySQL service (`MySQL8045`) is running.
2. Configure `.env` with your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=Root@1234
   DB_NAME=research_portal_db
   ```
3. Run `npm start`. The server automatically creates the database `research_portal_db`, the `opportunities` table, and seeds the initial 3 opportunities if empty!

### Option 2: Manual MySQL Import
Alternatively, import the schema using MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
```
Or open [database/schema.sql](database/schema.sql) in **MySQL Workbench** and execute the script.

---

## 🚀 Installation & Execution

### 1. Install dependencies
```bash
npm install
```

### 2. Start the server
```bash
npm start
```

### 3. Open in browser
Visit **`http://localhost:5000`** in your browser.

---

## 📡 REST API Documentation

### Opportunity Object Model
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto-increment |
| `title` | `VARCHAR(255)` | Research project title |
| `description` | `TEXT` | Detailed project scope & responsibilities |
| `area` | `VARCHAR(100)` | Research domain (e.g., Computer Networks, AI) |
| `faculty_name` | `VARCHAR(150)` | Faculty supervisor's name |
| `department` | `VARCHAR(100)` | Department name |
| `required_skills` | `TEXT` | Required skills / tools (comma-separated) |
| `available_positions` | `INT` | Number of student openings (> 0) |
| `deadline` | `DATE` | Application deadline (`YYYY-MM-DD`) |
| `status` | `ENUM('Open', 'Closed')` | Opportunity status (default: `'Open'`) |

---

### Endpoints

#### 1. Retrieve All Opportunities
- **URL:** `GET /api/opportunities`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [ ... ]
  }
  ```

#### 2. Retrieve Single Opportunity
- **URL:** `GET /api/opportunities/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": { "id": 1, "title": "Autonomous Drone Navigation via Edge AI", ... }
  }
  ```
- **Response `404 Not Found`**:
  ```json
  {
    "success": false,
    "message": "Research opportunity with ID 999 not found."
  }
  ```

#### 3. Create Opportunity
- **URL:** `POST /api/opportunities`
- **Body:**
  ```json
  {
    "title": "Quantum Key Distribution in Campus Networks",
    "description": "Simulate quantum cryptography protocols over optical fiber campus links.",
    "area": "Network Security",
    "faculty_name": "Dr. Sarah Ahmed",
    "department": "Computer Science",
    "required_skills": "Python, Qiskit, NetworkX",
    "available_positions": 2,
    "deadline": "2026-12-01",
    "status": "Open"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Research opportunity created successfully.",
    "data": { "id": 4, ... }
  }
  ```
- **Response `400 Bad Request`**:
  ```json
  {
    "success": false,
    "message": "Validation failed.",
    "errors": ["Title is required and must be non-empty."]
  }
  ```

#### 4. Update Opportunity
- **URL:** `PUT /api/opportunities/:id`
- **Body:**
  ```json
  {
    "available_positions": 4,
    "status": "Closed"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Research opportunity updated successfully.",
    "data": { ... }
  }
  ```

#### 5. Delete Opportunity
- **URL:** `DELETE /api/opportunities/:id`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Research opportunity with ID 4 deleted successfully."
  }
  ```

---

## 🧪 Postman / Bruno Testing

1. Open **Postman** (or **Bruno**).
2. Click **Import** and choose the exported file:  
   `postman/University_Research_Opportunity_Portal.postman_collection.json`
3. The collection contains the **8 required demonstration test cases**:
   1. `POST` Create Opportunity #1
   2. `POST` Create Opportunity #2
   3. `POST` Create Opportunity #3
   4. `GET` Retrieve All Research Opportunities
   5. `GET` Retrieve One Opportunity by ID
   6. `PUT` Update an Existing Opportunity
   7. `PUT` Change Status (`Open` to `Closed`)
   8. `DELETE` Delete an Opportunity
   9. `GET` Request Deleted Opportunity (Demonstrates `404 Not Found`)
   10. `POST` Request with Invalid/Missing Data (Demonstrates `400 Bad Request`)

---

## 🎥 One-Minute Demonstration Video
The demonstration video (`demonstration_video.mp4`) is included directly inside the submission archive. It demonstrates:
- Backend server running and connecting to MySQL.
- Frontend web portal fetching records.
- Creating a new opportunity via modal form.
- Viewing full details of an opportunity.
- Updating status (`Open` to `Closed`).
- Deleting an opportunity with confirmation.
- Form validation on required fields.
- Postman REST API execution (`200 OK` and `404 Not Found`).

---

## 📦 Submission Package Checklist

- [x] Complete frontend and backend source code (`server.js`, `public/`, `database/`)
- [x] Database schema & setup files (`database/schema.sql`, `database/db.js`)
- [x] Exported Postman collection (`postman/`)
- [x] `README.md` with setup and student information
- [x] Demonstration video (`demonstration_video.mp4` — 42s duration)
- [x] No sensitive passwords or `.env` files committed
- [x] ZIP file named as required: `P22_9238_H_Abdullah_BCS_5C.zip`
