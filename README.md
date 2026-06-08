# 🎓 EduUnity Connect — Cyber Range Sandbox (React + Vite)

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

Follow these simple steps to configure and boot up the frontend dashboard inside VS Code:

### 1. Open the Project in VS Code
1. Download or clone this project repository into a directory of your choice.
2. Launch **VS Code**.
3. Go to **File** ➔ **Open Folder...** (or `Cmd+O` on macOS / `Ctrl+O` on Windows) and select the root directory containing the `package.json` file.

### 2. Recommended VS Code Extensions
For the best styling auto-completions, syntax highlights, and developer feedback, we suggest installing the following extensions from the VS Code Marketplace:
* **Tailwind CSS IntelliSense** (by Tailwind Labs) — Essential for class name autocomplete, previewing colors, and structural hover cards since the project is fully styled with Tailwind utility classes.
* **TypeScript Nightly** or built-in TypeScript compiler services — For real-time type verification, parameter tooltips, and imports assistance.
* **Prettier - Code Formatter** (by Prettier) — To maintain elegant formatting on save.

### 3. Open the Integrated Terminal
You can run all terminal tasks directly within your editor:
* Press `` Ctrl + ` `` (control + backtick) or go to **Terminal** ➔ **New Terminal** in the top menu bar.

### 4. Install Dependencies
Run the command below in the newly opened terminal panel to install all necessary packages, compilers, and dependencies into a local `node_modules` directory:
```bash
npm install
```

### 5. Configure Your Local Environment Variables
If you need custom variables (such as special sandbox flags, database endpoints, or API keys), create a `.env` file based on `.env.example`:
```bash
# Copy the example file to a local active file
cp .env.example .env
```
*(The template is pre-configured to work straight out of the box out of offline states using local caching models, so you can skip variable declarations for simple static offline plays!)*

### 6. Start the Local Interactive Dev Server
With all developer files ready, boot the quick-reload development server:
```bash
npm run dev
```

Once executed successfully, your terminal will provide the target address. By default, Vite is specified to route on:
👉 **`http://localhost:3000`**

Open this address in your favorite modern browser to begin playing!

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
│   └── init.sql             # MySQL schema and vulnerable mock data
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

## 🎯 Navigating the Vulnerability Labs

When running **MyEduConnect** locally, you can preview three distinct penetration testing scenarios:

1. **Indirect Object Reference (IDOR) - Profile & Billing Leads:**
   * Open the **Address Bar** simulation component at the top of the viewport.
   * Manually change the URL query parameters (e.g., modifying `?email=admin@eduunity.io` or `?receipt_id=1041` with different numeric credentials) to trigger profile takeovers and examine peer financial transactions instantly.

2. **Unrestricted Arbitrary File Upload (RCE Web Shells):**
   * Jump into the application as an **Educator** or log in with the instructor credentials.
   * Navigate to a course syllabus control board.
   * Upload malicious/executable files like `.php` or `.sh` scripts.
   * Launch the interactive **Web Shell Simulator** terminal to run common Linux payloads like `whoami`, `ls -la`, or `cat secrets.json`.

3. **Cross-Site Scripting (XSS):**
   * Write unsanitized html markup inside review commentary fields to see raw document injections on subsequent client views.

---

*(This tool is purely intended for educational, penetration testing, and ethical programming awareness. Secure your code, parameterize queries, and always validate user bounds!)*
