import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        city TEXT NOT NULL,
        avg_income NUMERIC NOT NULL DEFAULT 650,
        working_hours NUMERIC NOT NULL DEFAULT 8,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        premium NUMERIC NOT NULL,
        coverage NUMERIC NOT NULL,
        deductible NUMERIC NOT NULL,
        payout_cap NUMERIC NOT NULL,
        risk_score NUMERIC NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        active_hours NUMERIC NOT NULL DEFAULT 0,
        distance NUMERIC NOT NULL DEFAULT 0,
        location_variance NUMERIC NOT NULL DEFAULT 0,
        location_points JSONB DEFAULT '[]',
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS triggers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city TEXT NOT NULL,
        weather_data JSONB NOT NULL,
        aqi NUMERIC NOT NULL,
        trigger_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        expected_income NUMERIC NOT NULL,
        actual_income NUMERIC NOT NULL,
        loss NUMERIC NOT NULL,
        payout NUMERIC NOT NULL,
        status TEXT NOT NULL,
        rejection_reason TEXT,
        fraud_score NUMERIC,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS income_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (err) {
    console.error("DB init error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
