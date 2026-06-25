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
- **Database:** MongoDB
- **Itineraries:** OpenAI GPT-4o-mini (structured JSON)

## Setup

Requires Node 20+, MongoDB, and an OpenAI API key.

```bash
cd backend && npm install
cd ../frontend && npm install
```

**Backend** — copy `backend/.env.example` to `backend/.env`:

```
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trao-itinerary
JWT_SECRET=your-secret-at-least-16-chars
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=          # optional
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=    # same client ID as backend, if using Google login
```

Run both:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

App: http://localhost:3000 · API: http://localhost:3001

Smoke tests (backend must be running, uses OpenAI):

```bash
./backend/scripts/test-api.sh
```

## Google sign-in

1. Create a **Web application** OAuth client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. OAuth consent screen: **External** (not Internal).
3. Authorized JavaScript origins: `http://localhost:3000` (plus your production URL).
4. Add test users while the app is in Testing mode.
5. Put the client ID in both `GOOGLE_CLIENT_ID` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/google` | Google ID token login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/trips` | List trips |
| POST | `/api/trips` | Create + generate |
| GET | `/api/trips/:id` | Trip detail |
| POST | `/api/trips/:id/generate` | Regenerate full trip |
| POST | `/api/trips/:id/activities` | Add activity |
| DELETE | `/api/trips/:id/activities/:activityId` | Remove activity |
| POST | `/api/trips/:id/days/:day/regenerate` | Regenerate one day |
| PATCH | `/api/trips/:id/days/:day/activities/reorder` | Reorder day |
| POST | `/api/trips/:id/versions/:versionId/restore` | Restore saved version |
| POST | `/api/trips/:id/finalize` | Lock edits |
| POST | `/api/trips/:id/unfinalize` | Unlock edits |
| POST | `/api/trips/:id/share` | Enable share link |
| DELETE | `/api/trips/:id/share` | Revoke share link |
| GET | `/api/share/:token` | Public read-only trip |
| DELETE | `/api/trips/:id` | Delete trip |

## Deploy

Typical setup: Vercel (frontend) + Render (backend) + MongoDB Atlas.

Set `CORS_ORIGIN` to your frontend URL and `NEXT_PUBLIC_API_URL` to your backend URL in production.
