# Zensure — Manual Deployment Guide

## 1. Clone & install

```bash
git clone <your-repo-url>
cd zensure
npm install
```

## 2. Set up Supabase database

1. Go to [supabase.com](https://supabase.com) → create a project.
2. Open **SQL Editor** → **New query** → paste the entire contents of `schema.sql` → click **Run**.
3. All tables are created idempotently (safe to re-run).

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local` (see comments in file for where to get each key).

Key values for Supabase:
- `DATABASE_URL`: **Settings → Database → Connection string → Transaction pooler** (port 6543)
- `NEXT_PUBLIC_SUPABASE_URL`: **Settings → API → Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: **Settings → API → anon public** key

## 4. Run locally

```bash
npm run dev          # http://localhost:3000
```

## 5. Build & start in production

```bash
npm run build
npm start            # default port 3000
```

To use a custom port:
```bash
PORT=8080 npm start
```

Or edit `package.json` scripts:
```json
"start": "next start -p 8080 -H 0.0.0.0"
```

## 6. Deploy to Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set all env vars in **Vercel Dashboard → Settings → Environment Variables**.

> Use the **Transaction pooler** DATABASE_URL (port 6543) for Vercel — it's serverless-compatible.

## 7. Deploy to Railway / Render / Fly.io

These platforms support persistent Node.js processes.
- Use the **Session pooler** DATABASE_URL (port 5432) for better performance.
- Set `NODE_ENV=production` and all env vars from `.env.example`.

## 8. API endpoints reference

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user, runs Groq risk scoring |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Clear session |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/dashboard` | Full dashboard data |
| POST | `/api/activity` | Save tracked shift |
| POST | `/api/payout` | Run Groq payout analysis |
| POST | `/api/simulate` | Simulate a day scenario |
| POST | `/api/ai/analyze` | Direct Groq AI endpoint (`mode: "risk"|"payout"`) |
| POST | `/api/init-db` | Initialize DB tables (call once after deploy) |
| POST | `/api/payment/create-order` | Create Razorpay order |

## 9. First-time database setup via API

After deploying, call once:
```bash
curl -X POST https://your-domain.com/api/init-db
```

This creates all tables (idempotent, safe to re-run).

## 10. Architecture notes

- **Auth**: Custom JWT via httpOnly cookies — no Supabase Auth used.
- **Database**: PostgreSQL via `pg` — works with Supabase, Neon, Railway, or any Postgres.
- **AI**: Groq `llama-3.1-8b-instant` for risk scoring + payout decisions. Falls back to deterministic models if Groq is unavailable.
- **Payments**: Razorpay (test mode by default). Swap key prefix `rzp_test_` → `rzp_live_` for production.
- **No vendor lock-in**: All config via env vars. Swap Supabase for any Postgres with one env var change.
