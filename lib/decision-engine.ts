import { predictIncome, detectFraud } from "./ai";

export interface WeatherData {
  rainfall: number;
  temperature: number;
  description: string;
}

export interface TriggerResult {
  triggered: boolean;
  reasons: string[];
  weather: WeatherData;
  aqi: number;
}

export interface PayoutResult {
  expected_income: number;
  actual_income: number;
  loss: number;
  payout: number;
  status: "approved" | "rejected" | "no_loss";
  rejection_reason?: string;
  fraud_score?: number;
}

export function checkTrigger(weather: WeatherData, aqi: number): TriggerResult {
  const reasons: string[] = [];

  if (weather.rainfall > 70) reasons.push(`Heavy rainfall: ${weather.rainfall}mm`);
  if (weather.temperature > 42) reasons.push(`Extreme heat: ${weather.temperature}°C`);
  if (aqi > 400) reasons.push(`Hazardous AQI: ${aqi}`);

  return {
    triggered: reasons.length > 0,
    reasons,
    weather,
    aqi,
  };
}

export function estimateActualIncome(active_hours: number, distance: number): number {
  const base_rate = 65;
  const distance_bonus = distance * 4;
  return Math.round(active_hours * base_rate + distance_bonus);
}

export function calculatePayout(params: {
  past_income: number[];
  weather_severity: number;
  working_hours: number;
  active_hours: number;
  distance: number;
  location_variance: number;
  deductible: number;
  payout_cap: number;
}): PayoutResult {
  const {
    past_income, weather_severity, working_hours,
    active_hours, distance, location_variance,
    deductible, payout_cap,
  } = params;

  const expected_income = predictIncome({ past_income, weather_severity, working_hours });
  const actual_income = estimateActualIncome(active_hours, distance);
  const loss = Math.max(expected_income - actual_income, 0);

  if (loss <= 0) {
    return { expected_income, actual_income, loss: 0, payout: 0, status: "no_loss" };
  }

  const activity_drop = loss / expected_income;
  const intent_score = active_hours * 0.5 + distance * 0.3;

  if (intent_score < 2.0) {
    return {
      expected_income, actual_income, loss, payout: 0,
      status: "rejected",
      rejection_reason: "Insufficient work activity detected",
    };
  }

  const income_pattern = expected_income > 0 ? actual_income / expected_income : 1;
  const { fraud_score, is_fraud } = detectFraud({
    active_hours, distance, location_variance,
    income_pattern,
  });

  if (is_fraud) {
    return {
      expected_income, actual_income, loss, payout: 0,
      status: "rejected",
      rejection_reason: "Anomalous activity pattern detected",
      fraud_score,
    };
  }

  if (activity_drop < 0.15) {
    return { expected_income, actual_income, loss, payout: 0, status: "no_loss" };
  }

  const raw_payout = loss - deductible;
  if (raw_payout <= 0) {
    return { expected_income, actual_income, loss, payout: 0, status: "no_loss" };
  }

  const payout = Math.min(raw_payout, payout_cap);

  return { expected_income, actual_income, loss, payout, status: "approved", fraud_score };
}
