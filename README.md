# WebQ LMS Platform — High-Performance Learning Management System

WebQ LMS is a modern, high-performance Learning Management System (LMS) designed for students to track coursework, complete study materials, submit assignments, join live faculty sessions, search items globally, and view learning metrics.

---

## 🏗️ Architecture Overview

The system follows a decoupled client-server architecture:

```mermaid
graph TD
  A[React Single Page Application] -- JWT Auth / JSON --&gt; B[Django REST API Gateway]
  B -- ORM Query --&gt; C[(SQLite Database)]
  
  subgraph Client App
    A1[Global Navbar & Notifications Bell]
    A2[Global Search & Debouncer]
    A3[Student Workspace / Course Details]
    A4[Dashboard KPI & Analytics Cards]
  end

  subgraph Django Backend
    B1[Auth Views - Login/Register]
    B2[Course & Syllabus Outline Services]
    B3[Submissions & Evaluator Engine]
    B4[Notifications Dynamic Dispatcher]
  end
```

---

## 🛠️ Technology Stack

### Frontend Client
* **Core:** React 18, React Router v6, Context API for Global Auth State.
* **Styling:** Vanilla CSS, Tailwind CSS for premium responsive panels, CSS Keyframe Animations.
* **Network Client:** Axios instance with custom interceptors for token refresh, queues, and redirect handling.
* **Performance:** Code splitting with `React.lazy` and `Suspense`, reusable Error Boundaries.

### Backend REST Server
* **Core:** Django 5.x, Django REST Framework (DRF).
* **Authentication:** SimpleJWT (JSON Web Tokens) with automated access/refresh rotation.
* **Database:** SQLite (local development instance).
* **Performance:** Django ORM optimization via Count annotations, `select_related()`, and `prefetch_related()` relationships.

---

## 🚀 Key Features Implemented

1. **Dashboard KPI & Analytics (Phase 8):** Renders dynamic cards (Total Courses, Progress %, Lessons Completed, Pending Assignments, Upcoming Sessions), a *Continue Learning* resume button, Recent Activity timeline, and Upcoming Deadlines list.
2. **Syllabus & Modules Accordion (Phases 1-3):** Interactive coursework folder lists sorted chronologically. Supports PDF, Video, and Note resources with dynamic completion status indicators (✓ or ○).
3. **Assignments Submissions (Phase 5):** Complete student assignments portal displaying grades, instructor feedback, due dates, and dynamically updated status badges (Pending, Submitted, Submitted Late, Late).
4. **Live Classes Coordinator (Phase 6):** Chronological classes scheduler. Dynamically calculates status: 🟢 Live (pulsing indicator), 🔵 Upcoming, or ⚫ Completed. Clicking *Join Meeting* launches valid URLs or triggers placeholder alerts.
5. **Student Profile & Security (Phase 7):** Account details panel to edit profile photo URLs, names, and emails. Features a secure Change Password form validating inputs and current configurations.
6. **Global Search Engine (Phase 9):** Debounced input querying across courses, modules, materials, assignments, and live classes. Highlights keyword matching text and redirects directly to target pages.
7. **Navbar Notifications Alert Dropdown (Phase 10):** CENTRALIZED alert system grouping unread count badges. Dynamically updates database logs for new deadlines, updates, and live video starting markers.
8. **Performance Optimizations (Phase 11):**
   * **N+1 Query Elimination:** Django count annotations pre-compute progress data. Lookups reduced from $O(N)$ to $O(1)$.
   * **Silent JWT Refresh:** Interceptor traps 401s, silently requests refreshed tokens, queues concurrent queries, and retries them automatically.
   * **Code Splitting:** Major pages are lazy-loaded. Covered by `ErrorBoundary` to prevent crashes.

---

## 🔧 Installation & Setup

### 1. Prerequisites
* Python 3.10+
* Node.js 18+

### 2. Backend Server Configuration
Navigate to the `backend/` directory:
```bash
cd backend
```

Create a virtual environment and activate it:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate
```

Install python dependencies:
```bash
pip install -r requirements.txt
```

Run migrations and seed default mock values:
```bash
python manage.py migrate
python manage.py seed_data
```

Launch the development server at `http://127.0.0.1:8000/`:
```bash
python manage.py runserver
```

### 3. Frontend Client Configuration
Navigate to the `frontend/` directory:
```bash
cd ../frontend
```

Install node packages:
```bash
npm install
```

Start the Vite hot-reloading dev server:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🛡️ Environment Variables Guide

### Backend Server (`backend/.env`)
Create a `.env` file inside the Django root:
```env
DEBUG=True
SECRET_KEY=django-insecure-development-key-hash
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Frontend Client (`frontend/.env`)
Create a `.env` file inside the React root:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/
```

---

## 📖 API Documentation Reference

### 🔐 Authentication
* `POST` `/api/token/` — Login with username & password. Returns access/refresh tokens.
* `POST` `/api/token/refresh/` — Rotate access token using a valid refresh token.
* `POST` `/api/register/` — Register new student accounts.

### 📚 Course Workspace
* `GET` `/api/my-courses/` — List student's enrolled courses with progress counts ($O(1)$ query).
* `GET` `/api/my-courses/<id>/` — Get complete details, modules outline, classroom, and faculty profiles.
* `POST` `/api/materials/<id>/toggle/` — Toggle material completion status. Generates notifications.

### ✏️ Assignments & Submissions
* `POST` `/api/assignments/<id>/submit/` — Submit homework files. Triggers notifications.

### 🎥 Notifications & Search
* `GET` `/api/search/?q=<query>` — Global search query (courses, modules, sessions, etc.).
* `GET` `/api/notifications/` — Retrieve notifications list sorted by date. Runs live deadline scans.
* `POST` `/api/notifications/<id>/read/` — Mark alert as read.
* `POST` `/api/notifications/read-all/` — Mark all notifications as read.
