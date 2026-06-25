# Trao

Trip planner with day-by-day itineraries, budget breakdowns, and hotel suggestions.

## Features

- Email/password and Google sign-in
- Create trips from destination, length, budget tier, and interests
- Edit activities, reorder days, regenerate a single day or the full trip
- Version history before regenerating (restore previous plans)
- Share read-only links (`/share/:token`)
- Finalize trips to lock edits

## Stack

- **Frontend:** Next.js, TypeScript, Tailwind → [Vercel](https://vercel.com)
- **Backend:** Express, TypeScript, Mongoose → [Render](https://render.com)
- **Database:** MongoDB Atlas
- **Itineraries:** OpenAI GPT-4o-mini

## Local setup

Requires Node 20+, MongoDB, and an OpenAI API key.

```bash
cd backend && npm install
cd ../frontend && npm install
```

**Backend** — `backend/.env` (copy from `backend/.env.example`):

```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trao-itinerary
JWT_SECRET=your-secret-at-least-16-chars
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=          # optional
```

**Frontend** — `frontend/.env.local` (copy from `frontend/.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=    # same as backend GOOGLE_CLIENT_ID
```

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

App: http://localhost:3000 · API: http://localhost:3001

## Deploy

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Database user + password.
3. Network access: allow `0.0.0.0/0` (Render uses dynamic IPs).
4. Copy the connection string into `MONGODB_URI`.

### 2. Backend on Render

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect the repo (uses `render.yaml`),  
   **or** **New Web Service** with:
   - **Root directory:** `backend`
   - **Build:** `npm install --include=dev && npm run build && npm prune --omit=dev`
   - **Start:** `npm start`
   - **Health check path:** `/health`
3. Set environment variables:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `OPENAI_API_KEY` | Your OpenAI key |
| `CORS_ORIGIN` | `https://YOUR-APP.vercel.app,https://*.vercel.app` |
| `GOOGLE_CLIENT_ID` | Optional, same as local |

4. Deploy and copy the service URL (e.g. `https://trao-api.onrender.com`).

`CORS_ORIGIN` accepts comma-separated URLs. Use `https://*.vercel.app` to allow Vercel preview deploys.

### 3. Frontend on Vercel

1. [vercel.com/new](https://vercel.com/new) → import the GitHub repo.
2. **Root directory:** `frontend`
3. Framework: Next.js (auto-detected).
4. Environment variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Render backend URL (no trailing slash) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as backend, if using Google login |

5. Deploy and copy the Vercel URL.

### 4. Post-deploy

1. Update Render `CORS_ORIGIN` with your real Vercel URL if you used a placeholder.
2. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add production URLs:
   - **Authorized JavaScript origins:** `https://YOUR-APP.vercel.app`
   - **Authorized redirect URIs:** `https://YOUR-APP.vercel.app`
3. Open `https://YOUR-APP.vercel.app` and create a test trip.

### Smoke test (production API)

```bash
curl https://YOUR-API.onrender.com/health
```

Should return `{"status":"ok"}`.

## Google sign-in

1. OAuth client type: **Web application**
2. Consent screen: **External** (not Internal)
3. Add localhost + production Vercel URL to authorized origins
4. Add test users while app is in Testing mode
5. Same client ID in `GOOGLE_CLIENT_ID` (backend) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend)

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/trips` | List trips |
| POST | `/api/trips` | Create + generate |
| GET | `/api/trips/:id` | Trip detail |
| POST | `/api/trips/:id/generate` | Regenerate full trip |
| POST | `/api/trips/:id/activities` | Add activity |
| DELETE | `/api/trips/:id/activities/:activityId` | Remove activity |
| POST | `/api/trips/:id/days/:day/regenerate` | Regenerate one day |
| PATCH | `/api/trips/:id/days/:day/activities/reorder` | Reorder day |
| POST | `/api/trips/:id/versions/:versionId/restore` | Restore version |
| POST | `/api/trips/:id/finalize` | Lock edits |
| POST | `/api/trips/:id/unfinalize` | Unlock edits |
| POST | `/api/trips/:id/share` | Enable share link |
| DELETE | `/api/trips/:id/share` | Revoke share link |
| GET | `/api/share/:token` | Public read-only trip |
| DELETE | `/api/trips/:id` | Delete trip |
