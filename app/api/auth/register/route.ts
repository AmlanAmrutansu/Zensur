import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { predictRisk, calculatePremium } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, city, avg_income, working_hours } = body;

    if (!name || !email || !password || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);
    const income = Number(avg_income) || 650;
    const hours = Number(working_hours) || 8;

    const result = await query(
      `INSERT INTO users (name, email, password_hash, city, avg_income, working_hours)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, city, avg_income, working_hours`,
      [name, email, password_hash, city, income, hours]
    );
    const user = result.rows[0];

    const risk_score = predictRisk({ city, avg_income: income, working_hours: hours });
    const { premium, coverage, deductible, payout_cap } = calculatePremium(risk_score, income);

    await query(
      `INSERT INTO policies (user_id, premium, coverage, deductible, payout_cap, risk_score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, premium, coverage, deductible, payout_cap, risk_score]
    );

    for (let i = 7; i >= 1; i--) {
      const variation = 0.85 + Math.random() * 0.3;
      await query(
        `INSERT INTO income_history (user_id, amount, date) VALUES ($1, $2, CURRENT_DATE - ($3 * INTERVAL '1 day'))`,
        [user.id, Math.round(income * variation), i]
      );
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({ user, risk_score, premium, coverage });
    response.cookies.set("token", token, {
      httpOnly: true, secure: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
