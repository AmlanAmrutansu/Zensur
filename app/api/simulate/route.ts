import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { checkTrigger, calculatePayout } from "@/lib/decision-engine";
import { getWeatherSeverity } from "@/lib/weather";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const policy = await query(
    "SELECT * FROM policies WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  const pol = policy.rows[0];
  if (!pol) return NextResponse.json({ error: "No policy found" }, { status: 400 });

  const scenarios = [
    { label: "Heavy Rain Day", rainfall: 85, temperature: 22, aqi: 180, active_hours: 2, distance: 8 },
    { label: "Extreme Heat", rainfall: 0, temperature: 45, aqi: 250, active_hours: 3, distance: 12 },
    { label: "Severe Pollution", rainfall: 5, temperature: 30, aqi: 450, active_hours: 1, distance: 3 },
    { label: "Normal Day", rainfall: 2, temperature: 28, aqi: 80, active_hours: 8, distance: 40 },
    { label: "Mild Rain", rainfall: 30, temperature: 25, aqi: 120, active_hours: 5, distance: 20 },
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const past_income = Array.from({ length: 7 }, () => Math.round(Number(user.avg_income) * (0.8 + Math.random() * 0.4)));

  const weather = {
    rainfall: scenario.rainfall,
    temperature: scenario.temperature,
    humidity: 70,
    description: scenario.label.toLowerCase(),
    city: user.city,
  };

  const aqi = scenario.aqi;
  const trigger = checkTrigger(weather, aqi);
  const severity = getWeatherSeverity(weather.rainfall, weather.temperature, aqi);

  const result = calculatePayout({
    past_income,
    weather_severity: severity,
    working_hours: Number(user.working_hours),
    active_hours: scenario.active_hours,
    distance: scenario.distance,
    location_variance: Math.random() * 0.5,
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

  return NextResponse.json({ scenario: scenario.label, trigger, weather, aqi, ...result });
}
