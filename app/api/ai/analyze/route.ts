/**
 * POST /api/ai/analyze
 * Unified AI analysis endpoint — exposes Groq risk & payout analysis.
 * mode: "risk"   → analyzeRisk(...)
 * mode: "payout" → analyzePayout(...)
 */
import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { analyzeRisk, analyzePayout } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  try {
    const body = await req.json();
    const { mode, ...payload } = body;

    if (mode === "risk") {
      const result = await analyzeRisk({
        city: payload.city ?? user.city,
        avg_income: Number(payload.avg_income ?? user.avg_income),
        working_hours: Number(payload.working_hours ?? user.working_hours),
      });
      return NextResponse.json(result);
    }

    if (mode === "payout") {
      const result = await analyzePayout(payload);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid mode. Use 'risk' or 'payout'." }, { status: 400 });
  } catch (err) {
    console.error("AI analyze error:", err);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
