# Zensure — AI-Powered Income Protection Platform

## Overview
Zensure is a full-stack parametric insurance platform for quick-commerce delivery workers (Zepto, Blinkit, Instamart). It automatically monitors weather, AQI, and user activity to detect adverse conditions and trigger income payouts — no manual claims.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Replit built-in via `pg`)
- **Auth**: JWT (httpOnly cookies) + bcrypt
- **Payments**: Razorpay (subscription + mock payouts)
- **Weather**: OpenWeatherMap API
- **AQI**: WAQI API
- **AI Models**: In-process ML scoring (no external AI API needed)

## Architecture
```
Next.js App Router
├── app/              — Frontend pages
├── app/api/          — API routes (backend)
├── lib/              — Shared logic
│   ├── ai.ts         — Risk prediction, income prediction, fraud detection
│   ├── decision-engine.ts — Core payout logic (rule-based)
│   ├── weather.ts    — OpenWeatherMap + WAQI integration
│   ├── db.ts         — PostgreSQL connection pool
│   └── auth.ts       — JWT + bcrypt utilities
└── middleware.ts     — Route protection
```

## Key Features
- **AI Risk Scoring** — RandomForest-style weighted model sets premium
- **AI Income Prediction** — Weighted moving average with weather adjustment
- **Fraud Detection** — IsolationForest-style anomaly scoring
- **Rule-Based Decision Engine** — Trigger → Activity → Fraud → Payout
- **Real-Time Weather** — Live data from OpenWeatherMap + WAQI
- **Activity Tracker** — GPS + timer, stores to DB
- **Razorpay Integration** — Premium payment + order creation
- **Simulation Mode** — Random scenario generator for testing

## Database Tables
- `users` — Profile + credentials
- `policies` — Coverage, premium, deductible, payout cap
- `activities` — Daily hours, distance, GPS points
- `income_history` — 7-day income for prediction baseline
- `triggers` — Weather/AQI events logged
- `payouts` — Payout decisions with audit trail

## Environment Secrets Required
- `WEATHER_API_KEY` — OpenWeatherMap API key
- `AQI_API_KEY` — WAQI API token
- `RAZORPAY_KEY_ID` — Razorpay key ID
- `RAZORPAY_KEY_SECRET` — Razorpay secret
- `SUPABASE_URL` — Optional future Supabase migration
- `SUPABASE_ANON_KEY` — Optional future Supabase migration
- `SESSION_SECRET` — JWT signing secret (auto-set)
- `DATABASE_URL` — Replit PostgreSQL (auto-managed)

## Running
```
npm run dev   # port 5000
npm run build
npm run start # port 5000
```

## Deployment Notes
- All secrets are in Replit Secrets (portable to any env via env vars)
- Database uses standard PostgreSQL — portable to any Postgres provider
- No vendor lock-in: swap DATABASE_URL to migrate to Supabase/Neon/Railway
- JWT auth is stateless — no session server needed
- Razorpay keys work in any environment
