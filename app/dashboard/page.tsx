"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardData {
  user: { name: string; city: string; avg_income: number; working_hours: number };
  policy: { premium: number; coverage: number; deductible: number; payout_cap: number; risk_score: number; status: string } | null;
  activities: { active_hours: number; distance: number; date: string }[];
  recent_payouts: { payout: number; status: string; loss: number; created_at: string }[];
  income_history: { amount: number; date: string }[];
  weather: { temperature: number; rainfall: number; humidity: number; description: string };
  aqi: { aqi: number };
  weather_severity: number;
  trigger: { triggered: boolean; reasons: string[] };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<null | {
    scenario: string; payout: number; status: string;
    expected_income: number; actual_income: number; loss: number;
    trigger: { triggered: boolean; reasons: string[] }
  }>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard");
    if (res.status === 401) { router.push("/login"); return; }
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  async function simulate() {
    setSimulating(true);
    setSimResult(null);
    const res = await fetch("/api/simulate", { method: "POST" });
    if (res.ok) { setSimResult(await res.json()); load(); }
    setSimulating(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-[#3E3A36] text-sm" style={{fontFamily:"system-ui,sans-serif"}}>Loading dashboard…</div>
    </div>
  );
  if (!data) return null;

  const { user, policy, activities, recent_payouts, weather, aqi, trigger } = data;
  const todayActivity = activities[0];
  const riskPct = policy ? Math.round(policy.risk_score * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">

      {/* Sticky nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F] sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs">Z</span>
          </div>
          <span className="font-serif text-sm tracking-wide">Zensure</span>
        </div>
        <div className="flex items-center gap-5" style={{fontFamily:"system-ui,sans-serif"}}>
          <Link href="/tracker" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] transition-colors">Tracker</Link>
          <Link href="/payout" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] transition-colors">Payout</Link>
          <span className="text-[#1F1F1F]">|</span>
          <button onClick={logout} className="text-xs text-[#3E3A36] hover:text-[#7A7268] transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Trigger Alert */}
        {trigger.triggered && (
          <div className="border border-[#7B1A2A] bg-[#1F0C10] px-6 py-4 flex items-start gap-4">
            <div className="w-1 bg-[#7B1A2A] self-stretch flex-shrink-0"></div>
            <div>
              <div className="text-[#F0ECE4] text-sm font-medium mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Adverse conditions detected in {user.city}</div>
              <div className="text-[#7A7268] text-xs mb-3" style={{fontFamily:"system-ui,sans-serif"}}>{trigger.reasons.join(" · ")}</div>
              <Link href="/payout" className="text-xs text-[#C9A84C] hover:underline" style={{fontFamily:"system-ui,sans-serif"}}>
                Check payout eligibility →
              </Link>
            </div>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[#C9A84C] text-xs tracking-widest uppercase mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Dashboard</div>
            <h1 className="font-serif text-3xl">{user.name.split(" ")[0]}</h1>
            <div className="text-[#7A7268] text-xs mt-1" style={{fontFamily:"system-ui,sans-serif"}}>
              {user.city} · {user.working_hours}h / day · ₹{user.avg_income} avg
            </div>
          </div>
          <button onClick={simulate} disabled={simulating}
            className="text-xs border border-[#1F1F1F] hover:border-[#C9A84C] text-[#7A7268] hover:text-[#C9A84C] px-4 py-2 transition-all disabled:opacity-40"
            style={{fontFamily:"system-ui,sans-serif"}}>
            {simulating ? "Running…" : "Simulate day"}
          </button>
        </div>

        {/* Simulation result */}
        {simResult && (
          <div className={`border px-6 py-5 ${simResult.status === "approved" ? "border-[#2D5E30] bg-[#0A1A0B]" : "border-[#1F1F1F] bg-[#111111]"}`}>
            <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-4" style={{fontFamily:"system-ui,sans-serif"}}>
              Simulation — {simResult.scenario}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Expected", value: `₹${simResult.expected_income}`, color: "" },
                { label: "Actual", value: `₹${simResult.actual_income}`, color: "" },
                { label: "Loss", value: `₹${simResult.loss}`, color: "text-[#C87070]" },
                { label: "Payout", value: `₹${simResult.payout}`, color: simResult.payout > 0 ? "text-[#7DC47D]" : "text-[#7A7268]" },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-[#7A7268] text-xs mb-1" style={{fontFamily:"system-ui,sans-serif"}}>{item.label}</div>
                  <div className={`font-serif text-xl ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className={`text-xs px-2 py-0.5 border ${
                simResult.status === "approved" ? "border-[#2D5E30] text-[#7DC47D]" :
                simResult.status === "rejected" ? "border-[#3D1820] text-[#C87070]" :
                "border-[#1F1F1F] text-[#7A7268]"
              }`} style={{fontFamily:"system-ui,sans-serif"}}>{simResult.status.toUpperCase()}</span>
              {simResult.trigger.triggered && (
                <span className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>{simResult.trigger.reasons.join(", ")}</span>
              )}
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1F1F1F]">
          {[
            {
              label: "Risk score",
              value: `${riskPct}%`,
              sub: riskPct > 65 ? "High risk" : riskPct > 40 ? "Medium risk" : "Low risk",
              color: riskPct > 65 ? "text-[#C87070]" : riskPct > 40 ? "text-[#C9A84C]" : "text-[#7DC47D]",
            },
            {
              label: "Weekly premium",
              value: `₹${policy?.premium ?? "—"}`,
              sub: `Coverage ₹${policy?.coverage ?? "—"}`,
              color: "text-[#F0ECE4]",
            },
            {
              label: "Temperature",
              value: `${weather.temperature}°C`,
              sub: weather.description,
              color: weather.temperature > 40 ? "text-[#C87070]" : "text-[#F0ECE4]",
            },
            {
              label: "Air quality",
              value: `${aqi.aqi}`,
              sub: aqi.aqi > 400 ? "Hazardous" : aqi.aqi > 300 ? "Very unhealthy" : aqi.aqi > 150 ? "Unhealthy" : "Moderate",
              color: aqi.aqi > 300 ? "text-[#C87070]" : aqi.aqi > 150 ? "text-[#C9A84C]" : "text-[#F0ECE4]",
            },
          ].map(tile => (
            <div key={tile.label} className="bg-[#0A0A0A] px-5 py-5">
              <div className="text-[#7A7268] text-xs mb-2 capitalize" style={{fontFamily:"system-ui,sans-serif"}}>{tile.label}</div>
              <div className={`font-serif text-2xl mb-1 ${tile.color}`}>{tile.value}</div>
              <div className="text-[#3E3A36] text-xs capitalize" style={{fontFamily:"system-ui,sans-serif"}}>{tile.sub}</div>
            </div>
          ))}
        </div>

        {/* Activity + Payouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1F1F1F]">

          <div className="bg-[#0A0A0A] p-6">
            <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-5" style={{fontFamily:"system-ui,sans-serif"}}>Today&apos;s activity</div>
            {todayActivity ? (
              <div>
                <div className="flex justify-between py-3 border-b border-[#1F1F1F]">
                  <span className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>Active hours</span>
                  <span className="font-serif text-base">{Number(todayActivity.active_hours).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>Distance covered</span>
                  <span className="font-serif text-base">{Number(todayActivity.distance).toFixed(1)} km</span>
                </div>
                <Link href="/tracker" className="text-xs text-[#C9A84C] hover:underline mt-2 inline-block" style={{fontFamily:"system-ui,sans-serif"}}>
                  Update activity →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[#3E3A36] mb-5" style={{fontFamily:"system-ui,sans-serif"}}>No activity recorded today. Start tracking to stay eligible for payouts.</p>
                <Link href="/tracker" className="text-xs border border-[#7B1A2A] text-[#C9A84C] px-4 py-2 hover:bg-[#1F0C10] transition-colors inline-block" style={{fontFamily:"system-ui,sans-serif"}}>
                  Start tracking
                </Link>
              </div>
            )}
          </div>

          <div className="bg-[#0A0A0A] p-6">
            <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-5" style={{fontFamily:"system-ui,sans-serif"}}>Recent payouts</div>
            {recent_payouts.length > 0 ? (
              <div className="space-y-0">
                {recent_payouts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[#1F1F1F] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-4 ${p.status === "approved" ? "bg-[#7DC47D]" : p.status === "rejected" ? "bg-[#C87070]" : "bg-[#3E3A36]"}`}></div>
                      <span className="text-xs text-[#7A7268] capitalize" style={{fontFamily:"system-ui,sans-serif"}}>{p.status}</span>
                    </div>
                    <span className={`font-serif text-base ${p.payout > 0 ? "text-[#7DC47D]" : "text-[#3E3A36]"}`}>
                      ₹{p.payout}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>No payouts recorded yet.</p>
            )}
          </div>
        </div>

        {/* Policy */}
        <div className="border border-[#1F1F1F] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Policy</div>
              <div className="font-serif text-xl">Income Protection Plan</div>
            </div>
            {policy && (
              <span className="text-xs border border-[#2D5E30] text-[#7DC47D] px-3 py-1" style={{fontFamily:"system-ui,sans-serif"}}>Active</span>
            )}
          </div>

          {policy && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1F1F1F] mb-6">
                {[
                  { label: "Weekly premium", value: `₹${policy.premium}` },
                  { label: "Coverage", value: `₹${policy.coverage}` },
                  { label: "Deductible", value: `₹${policy.deductible}` },
                  { label: "Payout cap", value: `₹${policy.payout_cap}` },
                ].map(item => (
                  <div key={item.label} className="bg-[#0A0A0A] px-5 py-4">
                    <div className="text-xs text-[#7A7268] mb-1" style={{fontFamily:"system-ui,sans-serif"}}>{item.label}</div>
                    <div className="font-serif text-lg">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4" style={{fontFamily:"system-ui,sans-serif"}}>
                <Link href="/payout" className="text-xs bg-[#7B1A2A] hover:bg-[#8F2035] text-[#F0ECE4] px-5 py-2.5 transition-colors inline-flex items-center gap-2">
                  Check payout <span className="text-[#C9A84C]">→</span>
                </Link>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/payment/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount: policy.premium }),
                    });
                    const order = await res.json();
                    if (!order.order_id) return alert("Payment setup failed");
                    const options = {
                      key: order.key_id,
                      amount: order.amount,
                      currency: order.currency,
                      name: "Zensure",
                      description: "Weekly Income Protection Premium",
                      order_id: order.order_id,
                      handler: () => alert("Payment successful! Policy renewed."),
                      theme: { color: "#7B1A2A" },
                    };
                    // @ts-expect-error Razorpay from CDN
                    new window.Razorpay(options).open();
                  }}
                  className="text-xs border border-[#1F1F1F] hover:border-[#C9A84C] text-[#7A7268] hover:text-[#C9A84C] px-5 py-2.5 transition-all"
                >
                  Pay premium ₹{policy.premium}
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
