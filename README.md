# FEMS — Fire Extinguisher Management System

A full-stack web application for managing fire extinguishers, user assignments, inspections, notifications, and reports. Built as a **microservices monorepo** with a Next.js frontend and PostgreSQL database.

## Features

### Admin portal
- Dashboard with inventory and inspection statistics
- User management (invite users, assign roles)
- Extinguisher CRUD and assignment to users
- Schedule and request inspections
- Reports (inventory, compliance, maintenance)
- CSV export for extinguishers, users, and inspections

### Inspector portal
- View and accept inspection requests
- Complete inspections with pass/fail outcome
- View extinguisher details before completing work
- Inspection history with pagination and filters
- CSV export for assigned inspection work

### User portal
- Dashboard with assigned extinguisher stats
- View assigned extinguishers and request inspections
- Inspection history
- Profile and password management
- CSV export for assigned extinguishers and inspection requests

### System capabilities
- JWT authentication with OTP email verification
- Forgot / reset password flow
- In-app notifications and email alerts
- Automated cron jobs (every 5 minutes) for expiry warnings and inspection reminders
- Role-based access control (admin, inspector, user)
- API Gateway with Swagger documentation

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| API Gateway | Express, JWT, rate limiting |
| Microservices | Node.js / Express (auth, extinguisher, inspection, reporting, notification) |
| Database | PostgreSQL (multi-schema via Drizzle ORM) |
| Cache | Redis (OTP sessions) |
| Email | SMTP (Nodemailer) |

---

## Architecture

```
Browser (Next.js :3010)
        │
        ▼
API Gateway (:3000)
        │
        ├── Auth Service (:3001)        → auth schema
        ├── Extinguisher Service (:3002) → extinguisher schema
        ├── Inspection Service (:3003) → inspection schema
        ├── Reporting Service (:3004)   → read-only across schemas
        └── Notification Service (:3005) → notification schema + cron
                    │
                    ▼
            PostgreSQL (fems)
            Redis (:7001)
```

PostgreSQL uses **separate schemas** (not `public`):

- `auth` — users
- `extinguisher` — fire extinguishers
- `inspection` — inspections and maintenance records
- `notification` — in-app notifications and alert dedup log

---

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Redis** (local install or Docker)
- **npm**
- **pg_dump / psql** (optional, for database export/import)

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/aine1100/Ne-Rest-Practical.git
cd Ne-Rest-Practical
npm install
cd view && npm install && cd ..
```

### 2. Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Set at minimum:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`
- `SMTP_USER` / `SMTP_PASSWORD` — for OTP and notification emails
- `REDIS_HOST` / `REDIS_PORT` (default `7001`)

For the frontend, create `view/.env.local` (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Start Redis

Using Docker:

```bash
docker compose up -d
```

Or run Redis locally on port **7001**.

### 4. Database setup

Create the PostgreSQL database:

```sql
CREATE DATABASE fems;
```

Run migrations:

```bash
npm run db:migrate
```

Create the first admin via API (after backend is running):

```http
POST http://localhost:3000/api/auth/setup-admin
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@example.com",
  "password": "YourSecurePass123"
}
```

### 5. Run the application

**Backend** (gateway + all microservices):

```bash
npm run dev
```

**Frontend** (separate terminal):

```bash
cd view
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3010 |
| API Gateway | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api-docs |

---

## Database scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:generate` | Generate migration from schema changes |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:export` | Export DB to `database/dumps/fems.sql` |
| `npm run db:import` | Restore from `database/dumps/fems.sql` |

---

## Project structure

```
Rest/
├── gateway/              # API Gateway (auth, proxy, Swagger)
├── services/
│   ├── auth/             # Login, users, OTP, password reset
│   ├── extinguisher/     # Extinguisher CRUD and assignment
│   ├── inspection/       # Inspection workflow and maintenance
│   ├── reporting/        # Reports and CSV/PDF export
│   └── notification/     # Notifications, email, cron jobs
├── packages/db/          # Drizzle schema and migrations
├── shared/               # JWT, logger, Redis, shared constants
├── view/                 # Next.js frontend
├── scripts/              # DB export/import and utilities
├── database/dumps/       # Local SQL exports (gitignored)
└── logs/                 # Application logs (gitignored)
```

---

## User roles

| Role | Access |
|------|--------|
| **admin** | Full system management |
| **inspector** | Accept and complete inspections |
| **user** | View assigned extinguishers, request inspections |

---

## Inspection workflow

```
Requested → Accepted → Scheduled → Completed / Failed
                                 ↘ Overdue / Cancelled
```

- Users and admins can **request** inspections (date must be today or future)
- Admins can **schedule** inspections with an assigned inspector
- Inspectors **accept** requests and **complete** with findings (pass/fail)
- Only one open inspection per extinguisher at a time

---

## API overview

All authenticated requests use `Authorization: Bearer <token>`.

| Prefix | Service |
|--------|---------|
| `/api/auth` | Authentication |
| `/api/users` | User management |
| `/api/extinguishers` | Extinguishers |
| `/api/inspections` | Inspections |
| `/api/maintenance` | Maintenance records |
| `/api/reports` | Reports and exports |
| `/api/notifications` | Notifications |

Full API documentation: **http://localhost:3000/api-docs**

---

## Logs

Application logs are written to:

- `logs/combined.log` — all log levels
- `logs/error.log` — errors only

Set `LOG_TO_FILE=false` in `.env` to disable file logging.

---

## License

Private project — Ne-Rest Practical.
