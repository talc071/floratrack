# FloraTrack

Digital plant care companion — React frontend + Node.js/Express API with MySQL persistence, Socket.IO real-time updates, and AI plant identification.

FloraTrack solves "plant forgetfulness" by giving every plant a profile, persistent care history in MySQL, real-time activity via Socket.IO, and AI-powered species identification through a secure backend proxy.

---

## Project Layout

```
Floratrack_submission2/
├── Floratrack_backend/          ← API + MySQL + Socket.IO + AI (port 3000)
│   ├── server.js
│   ├── src/
│   ├── config/
│   ├── models/
│   ├── migrations/
│   ├── seeders/
│   ├── controllers/
│   ├── routes/
│   ├── tests/
│   └── docs/
│       └── FloraTrack.postman_collection.json
└── Flora_Frontend/              ← React app (port 3001)
    └── src/
        ├── components/
        ├── pages/
        └── services/
```

---

## Prerequisites

- **Node.js v18+** and **npm**
- **MySQL 8+** running locally

```bash
node -v
npm -v
mysql --version
```

---

## Quick Start

Run these in **separate terminals** from this project folder.

### 1. MySQL database

```sql
CREATE DATABASE floratrack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or run the SQL migration:

```bash
cd Floratrack_backend
mysql -u root -p floratrack < migrations/001-init-schema.sql
```

### 2. Backend (Terminal 1)

```bash
cd Floratrack_backend
copy .env.example .env
npm install
npm run db:seed
npm start
```

- API: **http://localhost:3000**
- Socket.IO: **ws://localhost:3000**

Development with auto-restart:

```bash
npm run dev
```

### 3. Frontend (Terminal 2)

```bash
cd Flora_Frontend
copy .env.example .env
npm install
npm start
```

App: **http://localhost:3001**

---

## Environment Variables

### Backend (`Floratrack_backend/.env.example`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `3000`) |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name (`floratrack`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `CORS_ORIGIN` | Frontend URL (`http://localhost:3001`) |
| `PLANT_ID_API_KEY` | Plant.id v3 API key for AI identification (primary, optional) |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for AI identification (fallback 2, optional) |
| `GEMINI_API_KEY` | Google Gemini API key for AI identification (fallback 1, optional) |

### Frontend (`Flora_Frontend/.env.example`)

```env
PORT=3001
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_SOCKET_URL=http://localhost:3000
```

---

## Demo Accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| alice@floratrack.com | admin123 | admin |
| bob@floratrack.com | manager123 | manager |
| carol@floratrack.com | user123 | user |

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Email + password authentication |
| `/` | Dashboard | Plant overview, live activity feed, watering alerts, cards, stats, table |
| `/plants/add` | Add Plant | Form + AI species identification (via secure backend) |
| `/plants/:id` | Plant Profile | Details, edit/delete (role-based), care log timeline, shared users |
| `/calendar` | Care Calendar | Monthly watering schedule |
| `/settings` | Settings | Display name, email, theme, language, notifications |

### Frontend structure

```
Flora_Frontend/src/
├── components/     Navbar, Footer, PlantCard, DataTable, LiveNotifications
├── pages/          Login, Dashboard, AddPlant, PlantProfile, Calendar, Settings
└── services/       api, auth, plants, careLogs, settings, socket
```

---

## Features (Assignment 4)

- **MySQL + Sequelize ORM** — persistent users, admins, plants, care logs, and plant-sharing junction table
- **Real-time Socket.IO** — live plant activity feed on the dashboard (open two tabs to demo)
- **AI identification** — upload a plant photo on Add Plant; backend proxies to Gemini securely
- **Full CRUD** — create, read, update, delete plants (edit/delete on plant profile for admin/manager)
- **Relational queries** — plant history with owner, shared users, and care logs via ORM JOINs

---

## ORM & Database Schema

**ORM:** Sequelize with **mysql2**

### Models & Relationships

| Model | Description |
|-------|-------------|
| `User` | Regular app users with roles (`admin`, `manager`, `user`) |
| `Admin` | Separate admin profile linked to a User (1:1) |
| `Plant` | Main domain resource — plant profiles |
| `CareLog` | Watering/fertilizing history per plant |
| `UserPlant` | Junction table for M:N plant sharing between users |
| `UserSettings` | Per-user display preferences |

### Relationships

- **1:N** — `User` → `Plant` (ownership)
- **1:N** — `Plant` → `CareLog` (care history)
- **M:N** — `User` ↔ `Plant` through `UserPlant` (shared access)
- **1:1** — `User` → `Admin` (admin profile)
- **1:1** — `User` → `UserSettings`

### Complex relational query

`GET /plants/:id/history` returns the plant with owner, shared users (JOIN through `UserPlant`), and care logs — all via Sequelize `include`.

---

## WebSocket (Socket.IO)

Real-time plant activity notifications sync across browser tabs.

### Custom events

| Event | Direction | Description |
|-------|-----------|-------------|
| `dashboard:subscribe` | Client → Server | Join the live dashboard room |
| `dashboard:subscribed` | Server → Client | Subscription confirmation |
| `plant:subscribe` | Client → Server | Subscribe to a specific plant |
| `plant:subscribed` | Server → Client | Plant subscription confirmation |
| `plant:created` | Server → Client | New plant added |
| `plant:updated` | Server → Client | Plant updated |
| `plant:deleted` | Server → Client | Plant deleted |
| `careLog:created` | Server → Client | Care action logged |

**Demo:** Open the dashboard in two browser tabs. Log watering or add a plant in one tab — the other tab shows live notifications and refreshes.

---

## AI Integration

**Endpoint:** `POST /api/ai/identify` (multipart form, field: `image`)

- Frontend sends image to Express backend only — **API keys are never exposed to the browser**
- Backend tries providers in order: **Plant.id → Gemini → Claude → mock fallback**
- Set `PLANT_ID_API_KEY` in `Floratrack_backend/.env` for Plant.id v3 (primary — returns species, confidence, watering, care details)
- Set `GEMINI_API_KEY` in `Floratrack_backend/.env` for Gemini (`gemini-1.5-flash`) as first fallback
- Set `ANTHROPIC_API_KEY` in `Floratrack_backend/.env` for Claude (`claude-sonnet-4-6`) as second fallback
- Returns standardized JSON with species, confidence, watering frequency, and care instructions
- Returns `503 AI_UNAVAILABLE` if neither API key is configured
- Response includes a `source` field: `"claude"`, `"gemini"`, or `"fallback"`

On **Add Plant**, upload a photo and click **Identify Plant**.

### Getting API Keys

| Provider | Console | Key variable |
|----------|---------|--------------|
| Plant.id v3 | [web.plant.id](https://web.plant.id) → API Access | `PLANT_ID_API_KEY` |
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) → API Keys | `GEMINI_API_KEY` |
| Anthropic Claude | [console.anthropic.com](https://console.anthropic.com) → API Keys | `ANTHROPIC_API_KEY` |

---

## API Response Format

All responses use a consistent JSON envelope:

**Success**
```json
{ "success": true, "data": {}, "error": null }
```

**Error**
```json
{ "success": false, "data": null, "error": { "code": "ERROR_CODE", "message": "...", "details": {} } }
```

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/users` | — | List all users |
| GET | `/users/:id` | — | Get user by ID |
| GET | `/users/:userId/plants` | — | Plants owned by user |
| POST | `/users` | admin, manager | Create user |
| PUT | `/users/:id` | admin, manager | Update user |
| DELETE | `/users/:id` | admin | Delete user |
| GET | `/plants` | — | List plants (filter: `userId`, `healthStatus`, `location`) |
| GET | `/plants/:id` | — | Get plant |
| GET | `/plants/:id/history` | — | Plant + owner + shared users + care logs (JOIN) |
| POST | `/plants` | any role | Create plant |
| PUT | `/plants/:id` | admin, manager | Update plant |
| DELETE | `/plants/:id` | admin | Delete plant |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | — | Logout |
| GET | `/api/users/me` | x-user-id | Current user |
| GET | `/api/settings` | x-user-id | Get settings |
| PUT | `/api/settings` | x-user-id | Update settings |
| POST | `/api/care-logs` | any role | Log watering/fertilizing |
| POST | `/api/ai/identify` | any role | AI plant identification |

Headers for protected routes: `x-user-role`, `x-user-id`

---

## Postman Collection

Import [Floratrack_backend/docs/FloraTrack.postman_collection.json](Floratrack_backend/docs/FloraTrack.postman_collection.json) into Postman.

Covers Users, Plants, Auth, Settings, Care Logs, AI, and relational query endpoints. Backend must be running on `http://localhost:3000`.

---

## Running Tests

Automated tests map to [Flora_Frontend/checklist_tast.txt](Flora_Frontend/checklist_tast.txt). Requires MySQL running with seeded data.

```bash
# Backend (20 tests)
cd Floratrack_backend
npm test
```

```bash
# Frontend checklist (3 tests)
cd Flora_Frontend
npm run test:checklist
```

**Backend test coverage:** persistence/ORM, CRUD, relationships, Socket.IO, AI security, API JSON envelopes, project structure.

**Frontend test coverage:** AI routes through backend only, no provider secrets in source, env-based API URLs.

---

## Known Limitations

- Authentication uses header-based roles (`x-user-role`, `x-user-id`) after login — no JWT/session cookies
- Passwords stored in plain text for demo purposes only
- AI identification requires a valid `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`; without either the endpoint returns `503`
- MySQL must be running before starting the server or seed script
- Real-time events broadcast to all dashboard subscribers (no per-user filtering)
- Edit/delete plant UI requires admin or manager role (matches backend authorization)

---

## Submission Checklist (Screenshots)

1. MySQL connected — server startup log or `/health` + DB query
2. CRUD operation — create/update/delete plant via UI or Postman
3. ORM relational query — `GET /plants/1/history` showing owner + shared users + logs
4. WebSocket — two browser tabs showing live activity feed
5. AI — upload photo on Add Plant page, show identification result
6. Database — migration output or MySQL Workbench table view

**Before final ZIP submission:**
- Exclude `node_modules/` and production `.env` files
- Include `.env.example`, Postman collection, demo video, and 6 screenshots

---

## Deployment (AWS RDS + Render)

The project is configured for deployment with **AWS RDS** (MySQL database) and **Render** (backend + frontend). A `render.yaml` at the project root defines both services automatically.

### Prerequisites

- AWS account with an RDS MySQL 8 instance running (endpoint, credentials ready)
- Render account connected to your GitHub repository
- Code pushed to GitHub

### Step 1 — AWS RDS Setup

Create an RDS MySQL 8 instance with **Public access: Yes** and open inbound port `3306` (`0.0.0.0/0`) in its security group.

After creation you will have:
- **Endpoint** — e.g. `floratrack.xxxx.eu-north-1.rds.amazonaws.com` → use as `DB_HOST`
- **Master username** → use as `DB_USER`
- **Master password** → use as `DB_PASSWORD`

### Step 2 — Push to GitHub

```bash
git add .
git commit -m "add deployment config"
git push
```

### Step 3 — Deploy on Render

1. Go to [render.com](https://render.com) → **New → Blueprint**
2. Connect your GitHub repository — Render reads `render.yaml` and creates both services
3. In the **floratrack-backend** service, set these secret environment variables:

| Variable | Value |
|----------|-------|
| `DB_PASSWORD` | Your RDS master password |
| `CORS_ORIGIN` | `https://floratrack-frontend.onrender.com` (set after frontend deploys) |
| `PLANT_ID_API_KEY` | Your Plant.id API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `GEMINI_API_KEY` | Your Gemini API key |

4. In the **floratrack-frontend** service, set:

| Variable | Value |
|----------|-------|
| `REACT_APP_API_BASE_URL` | `https://floratrack-backend.onrender.com` |
| `REACT_APP_SOCKET_URL` | `https://floratrack-backend.onrender.com` |

### Step 4 — First deploy: schema creation

`DB_SYNC=true` is set in `render.yaml` for the first deploy — Sequelize will automatically create all tables in RDS.

After the first successful deploy:
1. In Render dashboard → floratrack-backend → Environment
2. Change `DB_SYNC` from `true` to `false`
3. Click **Save Changes** (triggers a redeploy)

### Step 5 — Seed demo data (optional)

In Render dashboard → floratrack-backend → **Shell** tab:

```bash
npm run db:seed
```

### Live URLs (after deployment)

| Service | URL |
|---------|-----|
| Frontend | `https://floratrack-frontend.onrender.com` |
| Backend API | `https://floratrack-backend.onrender.com` |
| Health check | `https://floratrack-backend.onrender.com/health` |

---

## Assignment 4 Compliance

| Requirement | Status |
|-------------|--------|
| MySQL + Sequelize ORM | Implemented |
| User, Admin, Plant, Junction models | Implemented |
| 1:N and M:N relationships | Implemented |
| Full CRUD via ORM | Implemented |
| Complex JOIN query | `GET /plants/:id/history` |
| Socket.IO (3+ custom events) | 7 custom events |
| Secure backend AI proxy | `POST /api/ai/identify` |
| Standardized JSON responses | All endpoints |
| Migrations + seed | `migrations/`, `seeders/` |
| `.env.example` | Included |
| Postman collection | Updated |
