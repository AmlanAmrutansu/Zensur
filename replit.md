# Zensure — Replit Project

## Overview
Zensure is an AI-powered parametric income protection platform for quick-commerce delivery workers (Zepto, Blinkit, Instamart). It automatically detects adverse conditions (weather, AQI, platform outages) and compensates workers for income loss without manual claims.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Runtime**: Node.js 20
- **Package Manager**: npm

## Project Structure
- `app/` — Next.js App Router pages and layouts
- `app/layout.tsx` — Root layout with metadata
- `app/page.tsx` — Home page
- `app/globals.css` — Global styles with Tailwind

## Running the App
The app runs on port 5000 via the "Start application" workflow:
```
npm run dev
```

## Scripts
- `dev` — Next.js dev server on port 5000 (0.0.0.0)
- `build` — Production build
- `start` — Production server on port 5000 (0.0.0.0)
- `lint` — ESLint

## Replit Configuration
- Port: 5000 (required for Replit webview)
- Host: 0.0.0.0 (required for Replit proxy)
