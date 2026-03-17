# 🆘 CrisisConnect — Disaster Help & Resource Coordination Platform

> A web-based platform for coordinating disaster relief operations, built with the MERN stack.

**Course:** Full Stack Web Development (TCS-693)  
**Team:** T090  
**Phase:** 2 of 3

---

## 📖 About

CrisisConnect enables disaster management authorities and volunteer teams to coordinate relief operations through structured request management, volunteer assignment, and centralized monitoring. The platform is designed with bandwidth efficiency in mind — using lightweight components, minimal multimedia, and optimized data payloads — making it practical for low-connectivity disaster zones.

Victims are **indirect beneficiaries**; field responders, NGO workers, and on-field volunteers use the platform to submit and manage requests on their behalf.

---

## 🚀 Phase 2 — Feature Scope

### ✅ Features Implemented

| # | Module | Features | Notes |
|---|--------|----------|-------|
| 1 | **Authentication & Role Management** | Register, Login, JWT auth, bcrypt password hashing, role-based access (Admin/Volunteer), protected routes, logout | Uses email+password (not OTP/phone) for simplicity |
| 2 | **Help Request Management** | Create, Read, Update, Delete requests; 5 categories (Food, Water, Medical, Shelter, Rescue); priority levels (Normal/Critical); status workflow (Pending → Assigned → Completed); filter by status/category/priority; search by title/location/description | Full CRUD with comprehensive filtering |
| 3 | **Volunteer Assignment** | View all volunteers, assign volunteer to request, reassign volunteer, auto-update status to "Assigned", track volunteer assignments | Admin-only assignment; no automatic matching |
| 4 | **Dashboard & Monitoring** | Total/Pending/Assigned/Completed stats cards, priority distribution display, category breakdown with visual bars, recent 5 requests feed | CSS-based visualizations (no chart library needed) |
| 5 | **Map & Location** | Interactive Leaflet map, all requests displayed as markers, color-coded by priority (red=critical, blue=normal), click popup with request details, map legend | Uses predefined prototype coordinates centered on Delhi |
| 6 | **SMS Simulation** | API endpoint to receive structured SMS, parse `HELP [CATEGORY] [LOCATION]` format, auto-generate help request from SMS, SMS log storage and display, quick-example buttons for demo | Simulated via web UI form (no real SMS gateway) |

### ❌ Features Deferred to Phase 3

| # | Module | Reason for Deferral |
|---|--------|-------------------|
| 7 | **Offline & Sync** | Requires Service Worker, IndexedDB, and Background Sync API — significant frontend complexity. Core functionality needs to be stable before adding offline resilience layer. |
| 8 | **Bandwidth Optimization** | Features like API pagination, lazy loading, image compression, and compressed assets are polish-level improvements. The current lightweight design (no multimedia, minimal JS) already addresses bandwidth concerns at a basic level. |
| — | **WebSocket Real-time Updates** | Socket.io integration for live push updates adds backend complexity. Phase 2 uses manual refresh / re-fetch pattern instead. |
| — | **Resource Inventory Tracking** | Listed as "future work" in original proposal. Not part of core Phase 2 scope. |
| — | **Advanced Analytics & Charts** | Chart.js/Recharts integration deferred. Phase 2 uses simple CSS bar visualizations for category breakdowns. |
| — | **Automatic Volunteer Matching** | Algorithm to auto-match volunteers based on proximity/skills is a Phase 3 enhancement. Phase 2 uses manual admin assignment. |
| — | **Real Geocoding** | No external geocoding API calls. Phase 2 uses 10 predefined Delhi-area locations with dummy coordinates for the prototype. |

### 💡 Rationale

The Phase 2 scope focuses on **core operational functionality** — the minimum set of features that demonstrates a working disaster coordination system end-to-end:

1. **Auth** → proves role-based access control
2. **Requests CRUD** → proves structured request management
3. **Volunteer Assignment** → proves coordination capability  
4. **Dashboard** → proves centralized monitoring
5. **Map** → proves geographic visualization
6. **SMS Simulation** → proves low-network accessibility concept

Features like offline sync and bandwidth optimization, while important for production, are **infrastructure-level** improvements that build on top of a stable core. They are best implemented in Phase 3 once the core is validated and tested.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js (Vite), HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT (jsonwebtoken), bcryptjs |
| Map | Leaflet + react-leaflet |
| HTTP Client | Axios |
| Routing | React Router DOM |

---

## 📁 Project Structure

```
web_dev_pbl/
├── server/                     # Backend (Express + MongoDB)
│   ├── server.js               # Entry point
│   ├── .env                    # Environment variables
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js             # JWT verification + role checking
│   ├── models/
│   │   ├── User.js             # User schema (admin/volunteer)
│   │   ├── HelpRequest.js      # Help request schema
│   │   └── SMSLog.js           # SMS log schema
│   └── routes/
│       ├── auth.js             # Register, Login, Get current user
│       ├── requests.js         # CRUD + assign + filter
│       ├── volunteers.js       # List volunteers + assignments
│       ├── dashboard.js        # Stats and analytics
│       └── sms.js              # SMS parsing + logging
│
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx            # Entry point
│   │   ├── App.jsx             # Router + layout
│   │   ├── index.css           # Global styles (dark theme)
│   │   ├── api.js              # Axios config with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Navigation bar
│   │   │   ├── ProtectedRoute.jsx # Auth guard
│   │   │   ├── StatsCard.jsx    # Dashboard stat card
│   │   │   └── RequestCard.jsx  # Request list item
│   │   └── pages/
│   │       ├── Login.jsx        # Login page
│   │       ├── Register.jsx     # Registration page
│   │       ├── Dashboard.jsx    # Admin dashboard
│   │       ├── Requests.jsx     # Request management
│   │       ├── MapView.jsx      # Leaflet map view
│   │       └── SMSSimulator.jsx # SMS simulation tool
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Running

### Prerequisites
- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **MongoDB** Community Edition — [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional, for cloning)

---

### Step 1: Install & Start MongoDB

<details>
<summary><strong>🪟 Windows</strong></summary>

**Option A — Installed as a Service (recommended):**
If you checked "Install MongoDB as a Service" during installation, MongoDB starts automatically with Windows. No action needed.

**Option B — Start manually:**
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
```
> Adjust the version number (`7.0`) to match your installed version. Check `C:\Program Files\MongoDB\Server\` to see which version folder exists.

**Verify it's running:**
```cmd
mongosh
```
You should see a `>` prompt. Type `exit` to close.

</details>

<details>
<summary><strong>🍎 macOS</strong></summary>

**Install via Homebrew:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Start MongoDB:**
```bash
brew services start mongodb-community
```

**Verify it's running:**
```bash
mongosh
```
You should see a `>` prompt. Type `exit` to close.

**To stop later:**
```bash
brew services stop mongodb-community
```

</details>

---

### Step 2: Start the Backend Server

<details>
<summary><strong>🪟 Windows (Command Prompt or PowerShell)</strong></summary>

```cmd
cd server
npm install
npm run dev
```

</details>

<details>
<summary><strong>🍎 macOS / Linux (Terminal)</strong></summary>

```bash
cd server
npm install
npm run dev
```

</details>

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

> If you see `ECONNREFUSED 127.0.0.1:27017`, MongoDB is not running. Go back to Step 1.

---

### Step 3: Start the Frontend (in a new terminal)

<details>
<summary><strong>🪟 Windows</strong></summary>

```cmd
cd client
npm install
npm run dev
```

</details>

<details>
<summary><strong>🍎 macOS / Linux</strong></summary>

```bash
cd client
npm install
npm run dev
```

</details>

Frontend starts on `http://localhost:5173`

---

### Step 4: Using the Application

1. Open `http://localhost:5173` in your browser
2. **Register an Admin account** first (select "Admin" from the Role dropdown)
3. Log in and explore the Dashboard, create Help Requests, and view the Map
4. **To test volunteer assignment:** open an incognito/private window and register a **Volunteer** account
5. As Admin: assign the volunteer to a request from the Requests page
6. Try the **SMS Simulator** to create requests via structured text input (e.g., `HELP MEDICAL downtown`)
7. Open the **Map View** to see all requests plotted geographically

> **Tip:** Both the server and client must be running simultaneously in separate terminals.

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/requests` | ✅ | List requests (filterable) |
| POST | `/api/requests` | ✅ | Create request |
| GET | `/api/requests/:id` | ✅ | Get single request |
| PUT | `/api/requests/:id` | ✅ | Update request |
| DELETE | `/api/requests/:id` | Admin | Delete request |
| PUT | `/api/requests/:id/assign` | Admin | Assign volunteer |
| GET | `/api/volunteers` | ✅ | List all volunteers |
| GET | `/api/volunteers/:id/assignments` | ✅ | Volunteer's assignments |
| GET | `/api/dashboard/stats` | ✅ | Dashboard statistics |
| POST | `/api/sms/incoming` | — | Receive & parse SMS |
| GET | `/api/sms/logs` | ✅ | View SMS logs |

---

## 📝 SMS Format

The SMS simulation accepts structured messages in this format:

```
HELP [CATEGORY] [LOCATION_DESCRIPTION]
```

**Examples:**
- `HELP MEDICAL downtown near hospital`
- `HELP FOOD central market area`
- `HELP RESCUE river side flooding`
- `HELP WATER north district school`
- `HELP SHELTER east railway station`

**Supported categories:** `FOOD`, `WATER`, `MEDICAL`, `SHELTER`, `RESCUE`

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Create/edit/delete requests, assign volunteers, view all data, access dashboard |
| **Volunteer** | View assigned requests, update request status (mark completed), view map |

---

## 🗓️ Phase 3 Roadmap

Features planned for the final phase:

- [ ] Offline data entry with IndexedDB + sync on reconnect
- [ ] Service Worker for caching and background sync
- [ ] API pagination for large datasets
- [ ] Lazy loading of components
- [ ] Asset compression and optimization
- [ ] Socket.io for real-time push updates
- [ ] Advanced analytics with charts
- [ ] Automatic volunteer matching algorithm
- [ ] Resource inventory tracking
- [ ] Comprehensive unit & integration tests

---

## 📄 License

Academic project — TCS-693 Full Stack Web Development.
