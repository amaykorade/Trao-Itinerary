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

- **Frontend:** Next.js, TypeScript, Tailwind
- **Backend:** Express, TypeScript, Mongoose
- **Hosting:** [Render](https://render.com) (two Web Services)
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

## Deploy on Render

Both services are defined in [`render.yaml`](render.yaml). You can deploy with a Blueprint or create two Web Services manually.

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and password.
3. Network access: allow `0.0.0.0/0` (Render uses dynamic IPs).
4. Copy the connection string for `MONGODB_URI`.

### 2. Blueprint (recommended)

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → connect the repo.
3. Render creates **trao-api** (backend) and **trao-web** (frontend) from `render.yaml`.
4. Fill in the prompted secrets when the Blueprint syncs.

### 3. Backend service (`trao-api`)

| Setting | Value |
|---------|--------|
| Root directory | `backend` |
| Build command | `npm install --include=dev && npm run build && npm prune --omit=dev` |
| Start command | `npm start` |
| Health check path | `/health` |

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars) |
| `OPENAI_API_KEY` | Your OpenAI key |
| `CORS_ORIGIN` | `https://trao-web.onrender.com` (your frontend Render URL) |
| `GOOGLE_CLIENT_ID` | Optional, same as local |

`CORS_ORIGIN` accepts comma-separated URLs. Example with a custom domain:

```
https://trao-web.onrender.com,https://yourdomain.com
```

Deploy the backend first and note the URL (e.g. `https://trao-api.onrender.com`).

### 4. Frontend service (`trao-web`)

| Setting | Value |
|---------|--------|
| Root directory | `frontend` |
| Build command | `npm install --include=dev && npm run build && npm prune --omit=dev` |
| Start command | `npm start` |

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `https://trao-api.onrender.com` (no trailing slash) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Optional, same as backend |

`NEXT_PUBLIC_*` variables are baked in at build time. After the backend URL is final, set `NEXT_PUBLIC_API_URL` and **redeploy** the frontend if the first build used a placeholder.

### 5. Post-deploy

1. Set backend `CORS_ORIGIN` to your live frontend URL (`https://trao-web.onrender.com`).
2. Redeploy the backend if you changed `CORS_ORIGIN`.
3. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add:
   - **Authorized JavaScript origins:** `https://trao-web.onrender.com`
   - **Authorized redirect URIs:** `https://trao-web.onrender.com`
4. Open the frontend URL and create a test trip.

### Smoke tests

```bash
curl https://trao-api.onrender.com/health
# {"status":"ok"}

curl -I https://trao-web.onrender.com
# HTTP 200
```

Free-tier services spin down after inactivity; the first request after idle can take ~30 seconds.

## Rate limits (production)

To protect the OpenAI API key and server resources:

| Limit | Value |
|-------|--------|
| AI generations per user | 15 / hour (create trip, full regenerate, day regenerate) |
| Trips per user | 20 max |
| Auth attempts per IP | 20 / 15 min |
| General API requests | 300 / 15 min per user |

Limits are disabled in local development (`NODE_ENV=development`). OpenAI calls also use `max_tokens` caps on responses.

## Google sign-in

1. OAuth client type: **Web application**
2. Consent screen: **External** (not Internal)
3. Authorized origins: `http://localhost:3000` and `https://trao-web.onrender.com`
4. Add test users while the app is in Testing mode
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
