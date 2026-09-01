# Teams Agent Admin Panel

Admin app for Microsoft Teams to manage a custom LLM agent's permissions, skill files, and tool integrations.

## Features

- **Permissions** – Grant/revoke agent access at team or individual user level
- **Skills Upload** – Upload JSON skill/manifest files scoped to a team
- **Integrations** – Toggle and configure Wiki, Jira, Confluence, ServiceNow, GitHub, SharePoint (config-only: URLs + API keys)
- **Full CRUD** on all resources
- **Fluent UI** – matches Teams look & feel
- **MongoDB** persistence

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Fluent UI v9, Teams JS SDK |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Hosting | Local development |

## Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017`)
- npm 9+

## Quick Start

```bash
# 1. Clone and install
cd teams-agent-admin
cp .env.example .env          # edit if your Mongo URI differs
npm install                   # root devDeps (concurrently)
npm run install:all           # server + client deps

# 2. Start dev servers (backend on :3001, frontend on :3000)
npm run dev
```

Open http://localhost:3000 in a browser.

## Deploy to Vercel (Server + Client)

This repo should be deployed as **two Vercel projects** from the same Git repository.

### 1) Deploy backend (`server/`)

1. In Vercel, import this repository and set **Root Directory** to `server`.
2. Keep framework preset as **Other**.
3. Add environment variable:
	- `MONGODB_URI` (MongoDB Atlas URI)
4. Deploy.

The backend includes:
- `server/api/index.js` for Vercel serverless runtime.
- `server/vercel.json` that routes all requests to the serverless handler.

After deploy, copy your backend URL (example: `https://teams-agent-admin-server.vercel.app`).

### 2) Deploy frontend (`client/`)

1. Create another Vercel project from the same repository.
2. Set **Root Directory** to `client`.
3. Framework preset: **Create React App**.
4. Add environment variables:
	- `REACT_APP_AAD_CLIENT_ID`
	- `REACT_APP_AAD_TENANT_ID`
5. In `client/vercel.json`, replace `https://YOUR_BACKEND_VERCEL_DOMAIN` with your backend URL.
6. Deploy.

`client/vercel.json` does two things:
- Rewrites `/api/*` calls to your backend deployment.
- Rewrites all app routes to `index.html` for React Router.

### 3) Redeploy frontend after rewrite update

Once the backend URL is set in `client/vercel.json`, redeploy the frontend project so `/api/*` points to the correct backend.

### 4) Validate

1. Open frontend URL and sign in.
2. Confirm API calls under `/api/*` succeed in browser network tab.
3. Check Vercel logs for backend and verify MongoDB connects.

## Sideload into Teams

1. Replace `{{TEAMS_APP_ID}}` in `manifest/manifest.json` with a new GUID.
2. Add 192×192 `color.png` and 32×32 `outline.png` icons to `manifest/`.
3. Zip the `manifest/` folder contents.
4. In Teams → Apps → Upload a custom app → upload the zip.

## API Endpoints

### Permissions (`/api/permissions`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:teamId` | List permissions for a team |
| POST | `/` | Create/upsert a permission |
| PUT | `/:id` | Update granted status |
| DELETE | `/:id` | Delete a permission |

### Skills (`/api/skills`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:teamId` | List skills for a team |
| POST | `/:teamId/upload` | Upload a JSON skill file |
| GET | `/detail/:id` | Get a single skill |
| PUT | `/:id` | Update skill content |
| DELETE | `/:id` | Delete a skill |

### Integrations (`/api/integrations`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:teamId` | List integrations (auto-creates defaults) |
| PUT | `/:id` | Toggle / update config |
| DELETE | `/:id` | Delete an integration |

## Project Structure

```
teams-agent-admin/
├── manifest/           # Teams app manifest + icons
├── server/
│   └── src/
│       ├── index.js          # Express entry point
│       ├── db.js             # MongoDB connection
│       ├── models/           # Mongoose schemas
│       └── routes/           # REST API routes
├── client/
│   ├── public/
│   └── src/
│       ├── App.jsx           # Main app with tab navigation
│       └── pages/            # Permissions, Skills, Integrations
├── .env.example
└── package.json              # Root scripts (concurrently)
```
