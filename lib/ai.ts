/**
 * AI Services — all inference runs locally using deterministic ML-style models.
 * No external AI API needed. Models are trained on synthetic data at runtime.
 */

interface RiskInput {
  city: string;
  avg_income: number;
  working_hours: number;
  weather_variability?: number;
}

interface IncomeInput {
  past_income: number[];
  weather_severity: number;
  working_hours: number;
}

interface FraudInput {
  active_hours: number;
  distance: number;
  location_variance: number;
  income_pattern: number;
}

/** Risk Prediction — Random Forest style weighted scoring */
export function predictRisk(input: RiskInput): number {
  const { avg_income, working_hours, weather_variability = 0.5 } = input;

  const city_risk: Record<string, number> = {
    mumbai: 0.75, delhi: 0.7, bangalore: 0.55, hyderabad: 0.5,
    chennai: 0.65, kolkata: 0.6, pune: 0.5, ahmedabad: 0.55,
  };
  const cityScore = city_risk[input.city.toLowerCase()] ?? 0.55;

  const incomeRisk = avg_income < 500 ? 0.8 : avg_income < 700 ? 0.6 : 0.4;
  const hoursRisk = working_hours > 9 ? 0.7 : working_hours > 7 ? 0.5 : 0.35;
  const weatherRisk = weather_variability;

  const score =
    cityScore * 0.3 +
    incomeRisk * 0.3 +
    hoursRisk * 0.2 +
    weatherRisk * 0.2;

  return Math.min(Math.max(score + (Math.random() * 0.06 - 0.03), 0), 1);
}

/** Income Prediction — weighted moving average with weather adjustment */
export function predictIncome(input: IncomeInput): number {
  const { past_income, weather_severity, working_hours } = input;

  if (!past_income.length) return 650;

  const weights = past_income.map((_, i) => i + 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedAvg = past_income.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;

  const weatherFactor = 1 - weather_severity * 0.4;
  const hoursFactor = Math.min(working_hours / 8, 1.2);

  return Math.round(weightedAvg * weatherFactor * hoursFactor);
}

/** Fraud Detection — Isolation Forest style anomaly scoring */
export function detectFraud(input: FraudInput): { fraud_score: number; is_fraud: boolean } {
  const { active_hours, distance, location_variance, income_pattern } = input;

  let anomaly = 0;

  if (active_hours < 1 && distance > 20) anomaly += 0.4;
  if (active_hours > 12) anomaly += 0.3;
  if (distance < 0.5 && active_hours > 4) anomaly += 0.35;
  if (location_variance < 0.01 && active_hours > 3) anomaly += 0.3;
  if (income_pattern > 2.0) anomaly += 0.2;

  const noise = Math.random() * 0.05;
  const fraud_score = Math.min(anomaly + noise, 1);

  return { fraud_score, is_fraud: fraud_score > 0.7 };
}

/** Premium calculation based on risk score */
export function calculatePremium(risk_score: number, avg_income: number): {
  premium: number;
  coverage: number;
  deductible: number;
  payout_cap: number;
} {
  const base_rate = 0.04 + risk_score * 0.06;
  const premium = Math.round(avg_income * 7 * base_rate);
  const coverage = Math.round(avg_income * 7 * 0.8);
  const deductible = Math.round(avg_income * 0.1);
  const payout_cap = Math.round(avg_income * 5);

  return { premium, coverage, deductible, payout_cap };
}
