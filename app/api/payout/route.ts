import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { fetchWeather, fetchAqi, getWeatherSeverity } from "@/lib/weather";
import { checkTrigger } from "@/lib/decision-engine";
import { detectFraud, predictIncome } from "@/lib/ai";
import { analyzePayout } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const policyRes = await query(
    "SELECT * FROM policies WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  if (!policyRes.rows[0]) {
    return NextResponse.json({ error: "No active policy found" }, { status: 400 });
  }
  const pol = policyRes.rows[0];

  const activityRes = await query(
    "SELECT * FROM activities WHERE user_id = $1 AND date = CURRENT_DATE",
    [user.id]
  );
  const activity = activityRes.rows[0] ?? { active_hours: 0, distance: 0, location_variance: 0 };

  const incomeRes = await query(
    "SELECT amount FROM income_history WHERE user_id = $1 ORDER BY date DESC LIMIT 7",
    [user.id]
  );
  const past_income = incomeRes.rows.map((r: { amount: number }) => Number(r.amount));

  const [weather, aqiData] = await Promise.all([
    fetchWeather(user.city),
    fetchAqi(user.city),
  ]);

  const trigger = checkTrigger(weather, aqiData.aqi);

  if (!trigger.triggered) {
    return NextResponse.json({
      eligible: false,
      reason: "No adverse weather or air-quality conditions detected today",
      weather,
      aqi: aqiData.aqi,
    });
  }

  const severity   = getWeatherSeverity(weather.rainfall, weather.temperature, aqiData.aqi);
  const active_hours       = Number(activity.active_hours);
  const distance           = Number(activity.distance);
  const location_variance  = Number(activity.location_variance);
  const deductible         = Number(pol.deductible);
  const payout_cap         = Number(pol.payout_cap);

  const expected_income = predictIncome({
    past_income,
    weather_severity: severity,
    working_hours: Number(user.working_hours),
  });

  // Estimate actual earnings from tracked activity
  const actual_income = Math.round(active_hours * 65 + distance * 4);
  const loss = Math.max(expected_income - actual_income, 0);

  const income_pattern = expected_income > 0 ? actual_income / expected_income : 1;
  const { fraud_score } = detectFraud({ active_hours, distance, location_variance, income_pattern });

  // ── Groq AI payout decision ──────────────────────────────────────────────
  const decision = await analyzePayout({
    expected_income,
    actual_income,
    loss,
    active_hours,
    distance,
    location_variance,
    weather,
    aqi: aqiData.aqi,
    trigger_reasons: trigger.reasons,
    deductible,
    payout_cap,
    fraud_score,
  });

  // Persist result
  await query(
    `INSERT INTO payouts (user_id, expected_income, actual_income, loss, payout, status, rejection_reason, fraud_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user.id, expected_income, actual_income, loss,
     decision.payout, decision.status, decision.rejection_reason ?? null, fraud_score]
  );

  await query(
    `INSERT INTO triggers (city, weather_data, aqi, trigger_type)
     VALUES ($1, $2, $3, $4)`,
    [user.city, JSON.stringify(weather), aqiData.aqi, trigger.reasons.join(", ")]
  );

  return NextResponse.json({
    eligible: true,
    trigger,
    weather,
    aqi: aqiData.aqi,
    expected_income,
    actual_income,
    loss,
    payout: decision.payout,
    status: decision.status,
    rejection_reason: decision.rejection_reason,
    reasoning: decision.reasoning,
    confidence: decision.confidence,
    fraud_score,
  });
}
