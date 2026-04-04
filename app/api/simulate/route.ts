import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";
import { query } from "@/lib/db";
import { checkTrigger } from "@/lib/decision-engine";
import { getWeatherSeverity } from "@/lib/weather";
import { detectFraud, predictIncome } from "@/lib/ai";
import { analyzePayout } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await getUserFromToken(token);
  if (!user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const policyRes = await query(
    "SELECT * FROM policies WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [user.id]
  );
  const pol = policyRes.rows[0];
  if (!pol) return NextResponse.json({ error: "No policy found" }, { status: 400 });

  const scenarios = [
    { label: "Heavy Rain Day",    rainfall: 85, temperature: 22, aqi: 180, active_hours: 2,  distance: 8  },
    { label: "Extreme Heat",      rainfall: 0,  temperature: 45, aqi: 250, active_hours: 3,  distance: 12 },
    { label: "Severe Pollution",  rainfall: 5,  temperature: 30, aqi: 450, active_hours: 1,  distance: 3  },
    { label: "Normal Day",        rainfall: 2,  temperature: 28, aqi: 80,  active_hours: 8,  distance: 40 },
    { label: "Mild Rain",         rainfall: 30, temperature: 25, aqi: 120, active_hours: 5,  distance: 20 },
    { label: "Combined Hazards",  rainfall: 75, temperature: 40, aqi: 380, active_hours: 2,  distance: 6  },
  ];

  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const past_income = Array.from(
    { length: 7 },
    () => Math.round(Number(user.avg_income) * (0.8 + Math.random() * 0.4))
  );

  const weather = {
    rainfall: scenario.rainfall,
    temperature: scenario.temperature,
    humidity: 70,
    description: scenario.label.toLowerCase(),
    city: user.city,
  };

  const aqi      = scenario.aqi;
  const trigger  = checkTrigger(weather, aqi);
  const severity = getWeatherSeverity(weather.rainfall, weather.temperature, aqi);

  const active_hours      = scenario.active_hours;
  const distance          = scenario.distance;
  const location_variance = Math.random() * 0.5;
  const deductible        = Number(pol.deductible);
  const payout_cap        = Number(pol.payout_cap);

  const expected_income = predictIncome({
    past_income,
    weather_severity: severity,
    working_hours: Number(user.working_hours),
  });

  const actual_income  = Math.round(active_hours * 65 + distance * 4);
  const loss           = Math.max(expected_income - actual_income, 0);
  const income_pattern = expected_income > 0 ? actual_income / expected_income : 1;
  const { fraud_score } = detectFraud({ active_hours, distance, location_variance, income_pattern });

  const decision = await analyzePayout({
    expected_income,
    actual_income,
    loss,
    active_hours,
    distance,
    location_variance,
    weather,
    aqi,
    trigger_reasons: trigger.reasons,
    deductible,
    payout_cap,
    fraud_score,
  });

  await query(
    `INSERT INTO payouts (user_id, expected_income, actual_income, loss, payout, status, rejection_reason, fraud_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [user.id, expected_income, actual_income, loss,
     decision.payout, decision.status, decision.rejection_reason ?? null, fraud_score]
  );

  return NextResponse.json({
    scenario: scenario.label,
    trigger,
    weather,
    aqi,
    expected_income,
    actual_income,
    loss,
    payout: decision.payout,
    status: decision.status,
    rejection_reason: decision.rejection_reason,
    reasoning: decision.reasoning,
    fraud_score,
  });
}
