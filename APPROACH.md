# WebQ LMS Platform — Technical Approach

This document outlines the architectural design, technical implementation decisions, and future improvements for the WebQ Learning Management System (LMS) platform.

---

## 🏗️ Architecture & Decoupled Design

The platform uses a decoupled client-server architecture optimized for speed and portability:
1. **Frontend Client:** Built as a React Single Page Application (SPA) powered by Vite. Renders a premium interface designed with Vanilla CSS and Tailwind CSS, featuring smooth transitions and micro-animations.
2. **Backend Server:** Django with Django REST Framework (DRF) serving clean, stateless REST API endpoints.
3. **Database Layer:** Configured to dynamically switch environments. Local development uses SQLite for simplicity, while production utilizes Render PostgreSQL via `dj-database-url`.
4. **Deployment:** The frontend client is hosted on **Vercel** (`webq-my-courses.vercel.app`), and the Django backend is hosted on **Render** (`webq-my-courses.onrender.com`).

---

## ⚡ Key Engineering & Implementation Decisions

* **N+1 Query Elimination:** To prevent performance degradation during progress tracking, course completion statistics are pre-computed in the database. Instead of making $O(N)$ database requests inside loops, Django ORM annotations (`Count`) are used to aggregate total and completed materials in a single query.
* **Silent JWT Token Rotation:** Standard Django REST Framework simple JWT tokens are rotated seamlessly. An Axios response interceptor intercepts `401 Unauthorized` errors, requests a new access token using the refresh token, queues any concurrent requests, and replays them automatically without interrupting the student's session.
* **Self-Enrollment registration flow:** Upon user registration via the API, the system automatically enrolls the new student in all available courses, generating the necessary `Enrollment` models immediately so that courses are instantly accessible.
* **Static Assets:** The production backend utilizes WhiteNoise to compress and serve static files directly, bypassing the need for a separate Nginx config or AWS S3 bucket for base admin panel assets.

---

## 📈 Future Improvements

1. **Real-time notifications:** Upgrade from polling to real-time notification push events using Django Channels (WebSockets).
2. **Full Test Suite:** Add end-to-end testing with Cypress or Playwright for frontend routing, and Django `APITestCase` for backend views.
3. **Caching Layer:** Implement Redis caching for course syllabus views to reduce database lookup overhead.
