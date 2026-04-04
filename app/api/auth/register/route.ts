import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { analyzeRisk } from "@/lib/groq";
import { calculatePremium } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, city, avg_income, working_hours } = body;

    if (!name || !email || !password || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const income = Math.max(200, Math.min(5000, Number(avg_income) || 650));
    const hours  = Math.max(4,   Math.min(16,   Number(working_hours) || 8));

    const result = await query(
      `INSERT INTO users (name, email, password_hash, city, avg_income, working_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, city, avg_income, working_hours`,
      [name, email.toLowerCase(), password_hash, city, income, hours]
    );
    const user = result.rows[0];

    // ── Groq AI risk scoring (with deterministic fallback) ──────────────
    const riskResult = await analyzeRisk({ city, avg_income: income, working_hours: hours });
    const { premium, coverage, deductible, payout_cap } = calculatePremium(riskResult.risk_score, income);

    await query(
      `INSERT INTO policies (user_id, premium, coverage, deductible, payout_cap, risk_score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, premium, coverage, deductible, payout_cap, riskResult.risk_score]
    );

    // ── Seed 7 days of income history for AI prediction baseline ────────
    for (let i = 7; i >= 1; i--) {
      const variation = 0.85 + Math.random() * 0.3;
      await query(
        `INSERT INTO income_history (user_id, amount, date)
         VALUES ($1, $2, CURRENT_DATE - ($3 * INTERVAL '1 day'))`,
        [user.id, Math.round(income * variation), i]
      );
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      user,
      risk_score: riskResult.risk_score,
      risk_label: riskResult.risk_label,
      risk_reasoning: riskResult.reasoning,
      premium,
      coverage,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
