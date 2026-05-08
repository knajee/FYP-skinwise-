# SkinWISE 2.0 — Setup Guide

> This file tracks all credentials, API keys, and environment variables you need to configure.
> Each section marks which prompt/step introduced the requirement.

---

## 1. Environment Variables

Create a `.env.local` file in the `frontend/` directory with these values:

```env
# ─── Backend API ───
# Your FastAPI backend URL (default: localhost:8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# ─── Google OAuth (Step 2 — Auth) ───
# Get these from Google Cloud Console → APIs & Services → Credentials
# Create an OAuth 2.0 Client ID (Web application type)
# Authorized redirect URI: http://localhost:8000/api/v1/auth/google/callback
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# ─── Future Steps (placeholders, not needed yet) ───
# NEXT_PUBLIC_WEATHER_API_KEY=
# NEXT_PUBLIC_SENTRY_DSN=
```

### How to get Google OAuth credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (dev)
7. Add authorized redirect URIs:
   - `http://localhost:8000/api/v1/auth/google/callback` (backend handles the callback)
8. Copy the **Client ID** into your `.env.local`

---

## 2. Backend Requirements

The frontend expects these backend endpoints to exist (built in later prompts):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/register` | POST | Register with email/password |
| `/api/v1/auth/login` | POST | Login, returns JWT in httpOnly cookie |
| `/api/v1/auth/google` | GET | Initiates Google OAuth redirect |
| `/api/v1/auth/google/callback` | GET | Google OAuth callback |
| `/api/v1/auth/me` | GET | Get current user profile |
| `/api/v1/auth/logout` | POST | Clear auth cookie |

The backend should set a cookie named `skinwise_token` (httpOnly, secure, sameSite=lax).

---

## 3. Package Dependencies

All packages are installed via npm. If you clone fresh, run:
```bash
cd frontend
npm install
```

---

## 4. Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

- Login page: `http://localhost:3000/login`
- Register page: `http://localhost:3000/register`
- Dashboard (protected): `http://localhost:3000/dashboard`

---

## Notes

- Auth pages currently use **placeholder functions** that console.log and resolve after 1.5s. Real API integration comes in Prompt 3 (Zustand store + API layer).
- Route protection via middleware checks for `skinwise_token` cookie — without a backend setting this cookie, all protected routes will redirect to `/login`.
- The old `app/auth/page.tsx` (single-page auth from v1) still exists but is superseded by the new `(auth)` route group. It can be safely deleted after migration is confirmed.
