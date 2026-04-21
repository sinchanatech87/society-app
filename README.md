# 🏢 Society Management System

Full-stack web app for managing a housing society (19 Flats + 5 Shops).
Built with **React + TypeScript** (frontend) and **Node.js + Express** (backend).

---

## Project Structure

```
society-app/
├── frontend/               React + TypeScript (Vite)
│   └── src/
│       ├── api/            Axios API client
│       ├── components/     Layout, Sidebar, shared UI
│       ├── context/        AuthContext (JWT)
│       └── pages/          Dashboard, Members, Maintenance, Payments,
│                           Notices, Complaints, Reports, Settings, Ledger
├── backend/                Node.js + Express
│   └── src/
│       ├── config/         Database (Sequelize)
│       ├── models/         All DB models + associations
│       ├── middleware/      JWT auth + audit logger
│       ├── controllers/    Auth, Members, Maintenance, Payments, etc.
│       └── routes/         All API routes
└── database/
    └── setup.sql           Create tables + seed demo data
```

---

## Quick Start

### 1. Database Setup
```bash
mysql -u root -p < database/setup.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env        # fill in your DB credentials
npm install
npm run dev                 # runs on http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173
```

---

## Demo Login Credentials

| Role  | Username              | Password     |
|-------|-----------------------|--------------|
| Admin | admin@society.com     | Society@123  |
| Member| ramesh@society.com    | Society@123  |

---

## Features

### Admin
- Dashboard with collection stats and pending dues
- Add / Edit / Deactivate members
- Generate monthly maintenance cycles
- Record and edit payments
- View member-wise ledger (billed vs paid vs balance)
- Create / delete notices
- Update complaint status (Open → In Progress → Resolved)
- Reports: monthly collection trend + outstanding dues

### Member
- View dashboard with personal dues
- View maintenance ledger
- View society notices
- Raise and track complaints

---

## API Endpoints

| Method | Path                              | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Login                    |
| GET    | /api/members                      | List members             |
| POST   | /api/members                      | Add member               |
| PUT    | /api/members/:id                  | Update member            |
| PATCH  | /api/members/:id                  | Toggle active status     |
| POST   | /api/maintenance/generate         | Generate maintenance     |
| GET    | /api/maintenance                  | List cycles              |
| GET    | /api/maintenance/member/:id/ledger| Member ledger            |
| GET    | /api/payments                     | List payments            |
| POST   | /api/payments                     | Add payment              |
| PUT    | /api/payments/:id                 | Edit payment             |
| GET    | /api/notices                      | List notices             |
| POST   | /api/notices                      | Create notice            |
| DELETE | /api/notices/:id                  | Delete notice            |
| GET    | /api/complaints                   | List complaints (admin)  |
| POST   | /api/complaints                   | Raise complaint (member) |
| PATCH  | /api/complaints/:id               | Update status (admin)    |
| GET    | /api/reports/maintenance          | Monthly collection report|
| GET    | /api/reports/dues                 | Outstanding dues report  |

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, TypeScript, Vite, Axios   |
| Backend  | Node.js, Express 4                  |
| Database | MySQL / PostgreSQL + Sequelize ORM  |
| Auth     | JWT (jsonwebtoken + bcryptjs)       |
| UI       | Custom CSS (no UI framework)        |
| Toasts   | react-hot-toast                     |

---

## Phase 2 Roadmap (from PRD)
- [ ] Online payment gateway (Razorpay)
- [ ] WhatsApp / SMS alerts
- [ ] Mobile app (React Native)
- [ ] Visitor management
- [ ] Vendor & expense tracking
