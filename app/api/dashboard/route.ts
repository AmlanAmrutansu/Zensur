import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { fetchWeather, fetchAqi, getWeatherSeverity } from "@/lib/weather";
import { checkTrigger } from "@/lib/decision-engine";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const [policy, activities, payouts, incomeHistory, weather, aqiData] = await Promise.all([
    query("SELECT * FROM policies WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", [user.id]),
    query(
      "SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 7",
      [user.id]
    ),
    query(
      "SELECT * FROM payouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
      [user.id]
    ),
    query(
      "SELECT * FROM income_history WHERE user_id = $1 ORDER BY date DESC LIMIT 7",
      [user.id]
    ),
    fetchWeather(user.city),
    fetchAqi(user.city),
  ]);

  const severity = getWeatherSeverity(weather.rainfall, weather.temperature, aqiData.aqi);
  const triggerResult = checkTrigger(weather, aqiData.aqi);

  return NextResponse.json({
    user,
    policy: policy.rows[0] ?? null,
    activities: activities.rows,
    recent_payouts: payouts.rows,
    income_history: incomeHistory.rows,
    weather,
    aqi: aqiData,
    weather_severity: severity,
    trigger: triggerResult,
  });
}
