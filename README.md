# University Research Opportunity Portal

[![Course](https://img.shields.io/badge/Course-Computer%20Networks%20(CN)-blue.svg)](#)
[![Assignment](https://img.shields.io/badge/Assignment-01-brightgreen.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20MySQL%20%7C%20Vanilla%20JS-orange.svg)](#)

A full-stack web application designed for university faculty to publish, update, manage, and track undergraduate and graduate research openings in one centralized portal.

---

## 🔗 GitHub Repository
**Repository URL:** `https://github.com/username/research-opportunity-portal`  
*(Replace `username` with your GitHub username upon publishing)*

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
9. [1-Minute Demonstration Video Checklist](#-1-minute-demonstration-video-checklist)
10. [Submission Checklist](#-submission-checklist)

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
- Clean, responsive dashboard designed with a modern typography and color system.
- Live statistics banner (Open positions, Closed positions, Total listings, Available student slots).
- Real-time search by keyword across titles, supervisors, departments, and skillsets.
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
- **API Testing:** Postman / Bruno Collection

---

## 📁 Project Structure

```text
CN assignment/
├── database/
│   ├── db.js                 # MySQL connection pool & automatic table bootstrap
│   └── schema.sql            # SQL table schema & initial seed data
├── postman/
│   └── University_Research_Opportunity_Portal.postman_collection.json
├── public/
│   ├── index.html            # Main web portal interface
│   ├── style.css             # Polished CSS design system
│   └── app.js                # Frontend REST API integration & UI logic
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules (node_modules, credentials)
├── package.json              # Project metadata & npm dependencies
├── README.md                 # Complete setup, documentation & submission instructions
└── server.js                 # Express server & REST route handlers
```

---

## 📋 Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v16.0 or higher) - [Download Node.js](https://nodejs.org/)
- **MySQL Server** (v8.0 or higher) - [Download MySQL](https://dev.mysql.com/downloads/installer/)
- **Git** - [Download Git](https://git-scm.com/)
- **Postman** or **Bruno** (for API testing)

---

## 🗄️ Database Setup

### Option 1: Automatic Setup via Server (Recommended)
1. Ensure your MySQL service is running.
2. In the `.env` file, enter your MySQL root password:
   ```env
   DB_PASSWORD=your_mysql_password
   ```
3. When you run `npm start`, the server automatically creates the database `research_portal_db`, the `opportunities` table, and seeds the initial 3 opportunities if empty!

### Option 2: Manual MySQL Import
Alternatively, import the schema using MySQL CLI:
```bash
mysql -u root -p < database/schema.sql
```
Or open [database/schema.sql](database/schema.sql) in **MySQL Workbench** / **phpMyAdmin** and execute the script.

---

## 🚀 Installation & Execution

### 1. Clone the repository
```bash
git clone https://github.com/username/research-opportunity-portal.git
cd research-opportunity-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and verify your settings:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=research_portal_db
```

### 4. Start the application
```bash
npm start
```
*For development auto-restart:*
```bash
npm run dev
```

### 5. Open in browser
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
- **Body:** (Any subset of editable fields)
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

## 🎥 1-Minute Demonstration Video Checklist
Record a video of approximately 60 seconds showing:
1. **[0:00 - 0:10]** Backend running in terminal (`npm start`) with MySQL connected.
2. **[0:10 - 0:25]** Frontend web page running in browser:
   - Displaying loaded research opportunities from database.
   - Creating a new opportunity using the modal form.
3. **[0:25 - 0:40]** Frontend actions:
   - Viewing full details in modal.
   - Updating an opportunity & toggling status (`Open` ↔ `Closed`).
   - Deleting an opportunity.
4. **[0:40 - 0:50]** Showing error handling:
   - Validation failure on submitting empty form (or 404 demonstration).
5. **[0:50 - 1:00]** Postman/Bruno API testing demonstration (sending requests & viewing `200`, `201`, `400`, `404`).

---

## 📦 Submission Checklist

Before submitting, verify that:
- [ ] No passwords, API keys, or `.env` files are pushed to GitHub.
- [ ] Meaningful incremental Git commits are present.
- [ ] The GitHub repository is public or accessible to the instructor.
- [ ] Postman collection JSON is present in `postman/`.
- [ ] Video recording is completed (~1 minute) and placed in the directory or linked in `README.md`.
- [ ] The submission ZIP archive is named according to your roll number, name, and class:
  ```text
  P24_0000_NAME_CLASS.zip
  ```
