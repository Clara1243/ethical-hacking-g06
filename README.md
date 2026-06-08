# 🎓 MyEduConnect (React + Vite)

Welcome to **EduUnity Connect**! This is a specialized, interactive educational web application and security range designed for demonstrating real-world software vulnerabilities, ethical hacking procedures, and robust cyber-defense programming.

This project is built using a modern frontend stack with **React 19**, **Vite 6**, **Tailwind CSS v4**, and **TypeScript**, with icons powered by **Lucide React** and flexible micro-animations powered by **Motion**.

---

## 🛠️ Prerequisites

Before setting up the project locally on your machine, ensure you have the following installed:

1. **Node.js** (v18.0.0 or higher is highly recommended)
   - To check your current Node version, run:
     ```bash
     node -v
     ```
2. **npm** (usually comes pre-bundled with Node.js)
3. **Visual Studio Code (VS Code)** (our recommended code editor)

---

## 🚀 Step-by-Step Local Setup

### Phase 1: Prerequisites & Tools Verification

Before starting, ensure your host machine has the following tools installed and running. 

#### 1. Docker Desktop (Required for Database)
The MySQL database runs entirely inside a Docker container.
* **Windows Installation (via CMD):** Run `winget install Docker.DockerDesktop` as Administrator, then restart your PC.
* **Verification:** Open Docker Desktop and wait until the status says **"Engine running"**.
* **Command Line Test:** Open Git Bash or CMD and run `docker compose version` to ensure the CLI is accessible.

#### 2. Node.js (Required for Frontend & Backend)
* **Installation:** Download the LTS version from the official Node.js website.
* **Verification:** Run `node -v` and `npm -v` in your terminal. Ensure Node is at least version 18+.

#### 3. Git
* **Verification:** Run `git --version` to ensure you can clone the repository.

---

### Phase 2: Repository Clone & Structure

1. Open your terminal (Git Bash recommended) and clone the repository:
   ```bash
   git clone [https://github.com/Clara1243/ethical-hacking-g06.git](https://github.com/Clara1243/ethical-hacking-g06.git)
   cd ethical-hacking-g06
   ```
2. Ensure your directory structure looks like this:
   ```
   ethical-hacking-g06/
   ├── docker-compose.yml       # Database container config
   ├── database/
   │   └── init.sql             # MySQL schema & vulnerable mock data
   ├── server/                  # Node.js Express backend
   │   └── server.js
   └── src/                     # React/Vite frontend
   ```

### Phase 2: Repository Clone & Structure

The database initializes automatically with the intentionally vulnerable tables and mock data required for the laboratory exercises.

1. Ensure Docker Desktop is running in the background.
2. In the root directory of the project, run the build command:
   ```bash
   docker compose up -d
   ```
3. Run:
   ```bash
   docker ps
   ```
   You should see the edu_unity_db container running on port 3306.

### Phase 4: Launch the Backend API (Node.js)

The backend handles the vulnerable routing (e.g., SQL Injection endpoints) and connects directly to the Docker database.

1. Open new terminal tab.
2. Navigate into the backend directory:
   ```bash
   cd server
   ```
3. Install required Node modules:
   ```bash
   npm install
   ```
4. Start server:
   ```bash
   node server.js
   ```
5. The terminal should show output, leave this terminal running:
   ```bash
   Backend API running on http://localhost:3000
   ```

### Phase 5: Launch Frontend UI (React/ Vite)
1. Open a third terminal tab.
2. Ensure you are in the root directory (ethical-hacking-g06/).
3. Install the frontend dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. The terminal will provide a local network link (local host used for API, so use other network links. E.g., [http://](http://100.105.41.72:3000/)). Ctrl+Click the link to open the platform in your browser.

### Phase 6: System Verification Test
1. Open the platform in your browser (http://localhost:5173).
2. On the login screen, enter the mock credentials (more credential details can be found in database/init.sql):
   ```plaintext
     Admin
     - username: admin
     - email: admin@eduunity.io
     - password: admin123
     Educator
     - username: helen vance
     - email: helen.vance@eduunity.io
     - password: helen123
     Student 1
     - username: alice smith
     - email: alice.smith@eduunity.io
     - password: alice123
   ```
4. Click Sign In.
(Note: If you successfully route to the Course Catalog, your Vite frontend has successfully talked to your Node.js backend, which successfully queried your Docker database. The environment is now fully staged for vulnerability testing.).

## 2. Recommended VS Code Extensions
For the best styling auto-completions, syntax highlights, and developer feedback, we suggest installing the following extensions from the VS Code Marketplace:
* **Tailwind CSS IntelliSense** (by Tailwind Labs) — Essential for class name autocomplete, previewing colors, and structural hover cards since the project is fully styled with Tailwind utility classes.
* **TypeScript Nightly** or built-in TypeScript compiler services — For real-time type verification, parameter tooltips, and imports assistance.
* **Prettier - Code Formatter** (by Prettier) — To maintain elegant formatting on save.

---

## 💻 Available Scripts Reference

You can execution the following npm commands inside the root directory directory:

| Command | Action | Description |
| :--- | :--- | :--- |
| `npm run dev` | **Start Dev Server** | Runs Vite's ultra-fast local development environment with instant-refresh modules on port **3000**. |
| `npm run build` | **Production Build** | Audits TypeScript and builds highly optimized, compiled static assets into the `/dist` directory. |
| `npm run preview` | **Preview Build** | Starts a lightweight local web server hosting your built static production assets for testing builds. |
| `npm run lint` | **TypeScript Check** | Triggers the TypeScript Compiler (`tsc`) to verify overall type safety without emitting build files. |
| `npm run clean` | **Clear Cache** | Purges any stale local outputs such as static build archives or runtime logs safely. |

---

## 📂 Repository File System Overview

Here is a quick directory tour to help you navigate files comfortably within VS Code:

```text
ethical-hacking-g06/
├── docker-compose.yml       # Docker config for the MySQL database
├── package.json             # Frontend dependencies (React, Vite, Tailwind)
├── vite.config.ts           # Vite config (Contains the /api proxy)
│
├── database/                # THE DATABASE
│   └── init.sql             # MySQL schema and mock data
│
├── src/                     # THE FRONTEND
│   ├── App.tsx              # Application state and routing
│   ├── types.ts             # TypeScript interfaces
│   └── components/          # UI Components
│       ├── Login.tsx        # Sends fetch() to /api/login
│       └── ...
│
└── server/                  # THE BACKEND
    ├── package.json         # Backend dependencies (express, mysql2, cors)
    └── server.js            # The actual API routes (/api/login, /api/register)
```

---

*(This tool is purely intended for educational, penetration testing, and ethical programming awareness. Secure your code, parameterize queries, and always validate user bounds!)*

---

## 🐳 Docker Deployment (Instructor Redeployment)

This section describes the containerised deployment used to fully redeploy the platform for lab assessment. All platform components run as Docker services on a single shared bridge network.

### Architecture

| Service | Container name | Host port | Internal DNS | Role |
|---------|---------------|-----------|--------------|------|
| Frontend (React/Vite) | EduUnity_frontend | 5173 | `frontend` | Web UI |
| Backend (Node/Express) | EduUnity_backend | 3000 | `backend` | API server |
| Database (MySQL) | MyEduConnect_db | 3306 | `db` | Data store |

Services communicate over the custom bridge network `platform-net`. Service discovery is handled by Docker DNS using the service names above.

### Prerequisites

- Docker Desktop (Engine running)
- Docker Compose V2 (`docker compose version`)

### Deploy

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

Verify services:

```bash
docker compose -f deploy/docker-compose.yml ps
docker compose -f deploy/docker-compose.yml exec backend getent hosts db
```

Expected: `backend` resolves `db` to the database container IP on `platform-net`.

Access points:

- Frontend UI: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Database: `localhost:3306` (MySQL root / `rootpassword`)

### Known Lab Vulnerabilities

The following network-layer weaknesses are intentionally present for controlled lab exercises only. Do not use this configuration outside the approved environment.

- Cleartext HTTP: Frontend talks to backend over plain HTTP (`http://backend:3000`). No TLS is configured.
- Unencrypted database connection: Backend connects to MySQL over plain TCP. No TLS is configured between `backend` and `db`.

