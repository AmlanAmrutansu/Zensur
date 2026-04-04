import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { fetchWeather, fetchAqi, getWeatherSeverity } from "@/lib/weather";
import { checkTrigger, calculatePayout } from "@/lib/decision-engine";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const policy = await query(
    "SELECT * FROM policies WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  if (!policy.rows[0]) {
    return NextResponse.json({ error: "No active policy" }, { status: 400 });
  }

  const pol = policy.rows[0];

  const activity = await query(
    "SELECT * FROM activities WHERE user_id = $1 AND date = CURRENT_DATE",
    [user.id]
  );
  const todayActivity = activity.rows[0] ?? { active_hours: 0, distance: 0, location_variance: 0 };

  const incomeHistory = await query(
    "SELECT amount FROM income_history WHERE user_id = $1 ORDER BY date DESC LIMIT 7",
    [user.id]
  );
  const past_income = incomeHistory.rows.map((r: { amount: number }) => Number(r.amount));

  const [weather, aqiData] = await Promise.all([
    fetchWeather(user.city),
    fetchAqi(user.city),
  ]);

  const trigger = checkTrigger(weather, aqiData.aqi);

  if (!trigger.triggered) {
    return NextResponse.json({
      eligible: false,
      reason: "No adverse conditions detected today",
      weather,
      aqi: aqiData.aqi,
    });
  }

  const severity = getWeatherSeverity(weather.rainfall, weather.temperature, aqiData.aqi);

  const result = calculatePayout({
    past_income,
    weather_severity: severity,
    working_hours: Number(user.working_hours),
    active_hours: Number(todayActivity.active_hours),
    distance: Number(todayActivity.distance),
    location_variance: Number(todayActivity.location_variance),
    deductible: Number(pol.deductible),
    payout_cap: Number(pol.payout_cap),
  });

  await query(
    `INSERT INTO payouts (user_id, expected_income, actual_income, loss, payout, status, rejection_reason, fraud_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      user.id, result.expected_income, result.actual_income, result.loss,
      result.payout, result.status, result.rejection_reason ?? null, result.fraud_score ?? null,
    ]
  );

  await query(
    `INSERT INTO triggers (city, weather_data, aqi, trigger_type)
     VALUES ($1, $2, $3, $4)`,
    [user.city, JSON.stringify(weather), aqiData.aqi, trigger.reasons.join(", ")]
  );

  return NextResponse.json({
    eligible: true,
    trigger,
    ...result,
    weather,
    aqi: aqiData.aqi,
  });
}
