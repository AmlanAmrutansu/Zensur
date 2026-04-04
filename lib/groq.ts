/**
 * Groq AI client — wraps Groq's OpenAI-compatible API.
 * Model: llama-3.1-8b-instant (free, fast, generous rate limits).
 * Falls back gracefully to deterministic scoring if the API is unavailable.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function groqChat(messages: GroqMessage[], temperature = 0.1): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      max_tokens: 512,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

// ─── Risk Scoring ────────────────────────────────────────────────────────────

export interface RiskInput {
  city: string;
  avg_income: number;
  working_hours: number;
}

export interface RiskResult {
  risk_score: number;       // 0–1
  risk_label: string;       // "Low" | "Medium" | "High"
  reasoning: string;
  premium_multiplier: number;
}

export async function analyzeRisk(input: RiskInput): Promise<RiskResult> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `You are an actuarial AI for Zensure, a parametric income-protection platform for 
gig delivery workers in Indian cities (Zepto, Blinkit, Instamart).

Evaluate the insurance risk for a new worker registration and return ONLY valid JSON with these fields:
{
  "risk_score": <float 0.0–1.0>,
  "risk_label": "<Low|Medium|High>",
  "reasoning": "<1 sentence explanation>",
  "premium_multiplier": <float 0.8–1.5>
}

Factors: city weather volatility, income stability, exposure hours.
City risk reference (approximate): Mumbai 0.75, Delhi 0.70, Chennai 0.65, Kolkata 0.60, Bangalore 0.55, Ahmedabad 0.55, Hyderabad 0.50, Pune 0.50.`,
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];

  try {
    const raw = await groqChat(messages);
    const parsed = JSON.parse(raw) as RiskResult;
    parsed.risk_score = Math.min(Math.max(Number(parsed.risk_score), 0), 1);
    parsed.premium_multiplier = Math.min(Math.max(Number(parsed.premium_multiplier), 0.8), 1.5);
    return parsed;
  } catch (err) {
    console.error("Groq risk analysis failed, using fallback:", err);
    return fallbackRisk(input);
  }
}

// ─── Payout Decision ─────────────────────────────────────────────────────────

export interface PayoutInput {
  expected_income: number;
  actual_income: number;
  loss: number;
  active_hours: number;
  distance: number;
  location_variance: number;
  weather: { rainfall: number; temperature: number; description: string };
  aqi: number;
  trigger_reasons: string[];
  deductible: number;
  payout_cap: number;
  fraud_score: number;
}

export interface PayoutDecision {
  payout: number;
  status: "approved" | "rejected" | "no_loss";
  rejection_reason?: string;
  reasoning: string;
  confidence: number;
}

export async function analyzePayout(input: PayoutInput): Promise<PayoutDecision> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `You are the AI payout engine for Zensure, a parametric income-protection system for 
Indian gig delivery workers. Analyze a payout request and return ONLY valid JSON:
{
  "payout": <integer ≥ 0>,
  "status": "<approved|rejected|no_loss>",
  "rejection_reason": "<string or null>",
  "reasoning": "<1–2 sentence explanation>",
  "confidence": <float 0.0–1.0>
}

Rules:
1. If fraud_score > 0.7 → reject, payout = 0.
2. If active_hours < 1.5 and distance < 5 → reject for insufficient activity.
3. If loss <= 0 → no_loss, payout = 0.
4. payout = max(0, min(loss - deductible, payout_cap)).
5. Only approve if trigger_reasons is non-empty and loss > deductible.`,
    },
    {
      role: "user",
      content: JSON.stringify(input),
    },
  ];

  try {
    const raw = await groqChat(messages);
    const parsed = JSON.parse(raw) as PayoutDecision;
    parsed.payout = Math.max(0, Math.min(Math.round(Number(parsed.payout)), input.payout_cap));
    return parsed;
  } catch (err) {
    console.error("Groq payout analysis failed, using fallback:", err);
    return fallbackPayout(input);
  }
}

// ─── Fallbacks (deterministic) ────────────────────────────────────────────────

function fallbackRisk(input: RiskInput): RiskResult {
  const city_risk: Record<string, number> = {
    mumbai: 0.75, delhi: 0.70, chennai: 0.65, kolkata: 0.60,
    bangalore: 0.55, ahmedabad: 0.55, hyderabad: 0.50, pune: 0.50,
  };
  const c = city_risk[input.city.toLowerCase()] ?? 0.55;
  const income_risk = input.avg_income < 500 ? 0.8 : input.avg_income < 700 ? 0.6 : 0.4;
  const hours_risk = input.working_hours > 9 ? 0.7 : input.working_hours > 7 ? 0.5 : 0.35;
  const risk_score = Math.min(c * 0.4 + income_risk * 0.35 + hours_risk * 0.25, 1);
  const risk_label = risk_score > 0.65 ? "High" : risk_score > 0.45 ? "Medium" : "Low";
  return {
    risk_score: Math.round(risk_score * 100) / 100,
    risk_label,
    reasoning: "Deterministic fallback used — Groq unavailable.",
    premium_multiplier: 0.9 + risk_score * 0.4,
  };
}

function fallbackPayout(input: PayoutInput): PayoutDecision {
  if (input.fraud_score > 0.7) {
    return { payout: 0, status: "rejected", rejection_reason: "Anomalous activity pattern", reasoning: "Fraud score too high.", confidence: 0.9 };
  }
  if (input.active_hours < 1.5 && input.distance < 5) {
    return { payout: 0, status: "rejected", rejection_reason: "Insufficient work activity", reasoning: "Not enough tracked activity.", confidence: 0.85 };
  }
  if (input.loss <= 0 || input.trigger_reasons.length === 0) {
    return { payout: 0, status: "no_loss", reasoning: "No qualifying loss detected.", confidence: 0.95 };
  }
  const raw = input.loss - input.deductible;
  if (raw <= 0) return { payout: 0, status: "no_loss", reasoning: "Loss within deductible.", confidence: 0.9 };
  const payout = Math.min(Math.round(raw), input.payout_cap);
  return { payout, status: "approved", reasoning: "Adverse conditions verified, loss confirmed.", confidence: 0.8 };
}
