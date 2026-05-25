# Team Task Manager

A full-stack MVP web app where users can create projects, assign tasks, and track progress with role-based access control.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT + bcrypt
- Deployment: Railway

## Features

- Signup/Login
- Admin/Member roles
- Admin can create projects
- Admin can add members to projects
- Admin can create, assign, update and delete tasks
- Members can view assigned tasks and update task status
- Dashboard with total, todo, in-progress, done and overdue task counts

## Folder Structure

```txt
backend/
frontend/
README.md
```

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Add your MongoDB Atlas URI and JWT secret in `backend/.env`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Routes

### Auth

```txt
POST /api/auth/signup
POST /api/auth/login
```

### Projects

```txt
GET /api/projects
POST /api/projects
POST /api/projects/:id/members
```

### Tasks

```txt
GET /api/tasks
POST /api/tasks
PATCH /api/tasks/:id
DELETE /api/tasks/:id
```

### Dashboard

```txt
GET /api/dashboard
```

## Railway Deployment

### Backend

1. Push this project to GitHub.
2. Create a new Railway project.
3. Deploy from GitHub repo.
4. Set root directory as `backend`.
5. Add environment variables:

```txt
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_secret
CLIENT_URL=https://your-frontend-url
```

### Frontend

Deploy `frontend` on Railway, Vercel, or Netlify.

Set:

```txt
VITE_API_URL=https://your-backend-url/api
```

## Demo Credentials

Create these by signing up in the app:

```txt
Admin:
admin@test.com / admin123

Member:
member@test.com / member123
```


