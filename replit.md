# Zensure — AI-Powered Income Protection Platform

## Overview
Zensure is a full-stack parametric insurance platform for quick-commerce delivery workers (Zepto, Blinkit, Instamart). It automatically monitors weather, AQI, and user activity to detect adverse conditions and trigger AI-powered income payouts — no manual claims, no forms.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 — Vanta black (#0A0A0A) / Burgundy (#7B1A2A) / Gold (#C9A84C), rounded-2xl/3xl cards, glass-morphism nav, gradient buttons, ambient radial glows
- **Database**: PostgreSQL via `pg` (Supabase-hosted, portable to any Postgres)
- **Auth**: Custom JWT (httpOnly cookies) + bcrypt — stateless, no session server
- **AI**: Groq `llama-3.1-8b-instant` for risk scoring + payout decisions (deterministic fallback)
- **Payments**: Razorpay (test mode; swap key prefix for production)
- **Weather**: OpenWeatherMap API
- **AQI**: WAQI API (aqicn.org)

## Architecture
```
Next.js App Router
├── app/                  — Frontend pages
├── app/api/              — API routes (backend)
│   ├── auth/             — register, login, logout, me
│   ├── ai/analyze/       — Groq AI unified endpoint
│   ├── dashboard/        — Full dashboard data
│   ├── activity/         — GPS shift tracking
│   ├── payout/           — Groq payout analysis
│   ├── simulate/         — Scenario simulator
│   ├── payment/          — Razorpay order creation
│   └── init-db/          — DB table initialization
├── lib/
│   ├── groq.ts           — Groq AI client (risk + payout analysis)
│   ├── ai.ts             — Deterministic fallback models
│   ├── decision-engine.ts — Core trigger + payout logic
│   ├── weather.ts        — OpenWeatherMap + WAQI integration
│   ├── db.ts             — PostgreSQL singleton pool
│   └── auth.ts           — JWT + bcrypt utilities
├── utils/supabase/       — Supabase client helpers (server, client, middleware)
├── schema.sql            — Full database schema (run in Supabase SQL Editor)
├── .env.example          — All required env vars documented
├── DEPLOY.md             — Manual deployment guide
└── middleware.ts         — Route protection (JWT cookie check)
```

## AI Pipeline
1. **Registration**: Groq analyzes city risk, income, hours → sets risk_score, premium, coverage
2. **Payout**: Groq cross-checks weather triggers, fraud score, activity data → approved/rejected + reasoning
3. **Fallback**: If Groq API unavailable, deterministic weighted models activate automatically

## Database Tables
- `users` — Profile + credentials
- `policies` — AI-scored coverage, premium, deductible, payout cap
- `activities` — Daily hours, distance, GPS points
- `income_history` — 7-day seed data for income prediction
- `triggers` — Weather/AQI events logged per trigger
- `payouts` — Full audit trail with fraud scores and AI reasoning

## Environment Variables Required
| Secret | Source |
|--------|--------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (Transaction pooler port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `WEATHER_API_KEY` | openweathermap.org |
| `AQI_API_KEY` | aqicn.org/data-platform/token |
| `RAZORPAY_KEY_ID` | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard |

## Running
```bash
npm run dev    # development — port 5000
npm run build  # production build
npm start      # production — port 5000
```

## Deployment (portable — no vendor lock-in)
See `DEPLOY.md` for full step-by-step instructions covering:
- Supabase database setup via `schema.sql`
- Vercel, Railway, Render, Fly.io deployment
- Environment variable configuration

The only file needed is `.env.local` — swap `DATABASE_URL` to change the Postgres provider.
