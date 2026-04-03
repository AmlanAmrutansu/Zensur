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
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] animate-pulse" />
        <div className="text-[#3A3632] text-xs">Loading…</div>
      </div>
    </div>
  );
  if (!data) return null;

  const { user, policy, activities, recent_payouts, weather, aqi, trigger } = data;
  const todayActivity = activities[0];
  const riskPct = policy ? Math.round(policy.risk_score * 100) : 0;
  const riskColor = riskPct > 65 ? "text-[#E07070]" : riskPct > 40 ? "text-[#C9A84C]" : "text-emerald-400";
  const riskBg = riskPct > 65 ? "bg-red-500/10 border-red-500/20" : riskPct > 40 ? "bg-[#C9A84C]/10 border-[#C9A84C]/20" : "bg-emerald-500/10 border-emerald-500/20";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">
      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[400px] h-[300px] rounded-full bg-[#7B1A2A] opacity-[0.04] blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center shadow-md shadow-[#7B1A2A]/30">
            <span className="text-[#C9A84C] font-bold text-xs">Z</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Zensure</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/tracker" className="px-3 py-1.5 text-xs text-[#7A7268] hover:text-[#F0ECE4] hover:bg-white/5 rounded-lg transition-all duration-200">Tracker</Link>
          <Link href="/payout" className="px-3 py-1.5 text-xs text-[#7A7268] hover:text-[#F0ECE4] hover:bg-white/5 rounded-lg transition-all duration-200">Payout</Link>
          <div className="w-px h-4 bg-white/5 mx-1" />
          <button onClick={logout} className="px-3 py-1.5 text-xs text-[#3A3632] hover:text-[#7A7268] rounded-lg transition-all duration-200">Sign out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* Trigger alert */}
        {trigger.triggered && (
          <div className="rounded-2xl bg-[#7B1A2A]/10 border border-[#7B1A2A]/25 p-5 flex items-start gap-4 animate-fade-up">
            <div className="w-8 h-8 rounded-full bg-[#7B1A2A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">⚠</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#F0ECE4] mb-1">Adverse conditions in {user.city}</div>
              <div className="text-xs text-[#7A7268] mb-3">{trigger.reasons.join(" · ")}</div>
              <Link href="/payout" className="inline-flex items-center gap-1.5 text-xs bg-[#7B1A2A] hover:bg-[#8F2035] text-white px-3 py-1.5 rounded-full transition-all duration-200">
                Check payout eligibility <span className="text-[#C9A84C]">→</span>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between pt-2">
          <div>
            <div className="text-xs text-[#C9A84C] font-medium tracking-widest uppercase mb-1">Dashboard</div>
            <h1 className="font-display text-3xl text-[#F0ECE4]">Hi, {user.name.split(" ")[0]}</h1>
            <p className="text-[#7A7268] text-xs mt-1">{user.city} · {user.working_hours}h/day · ₹{user.avg_income} avg</p>
          </div>
          <button onClick={simulate} disabled={simulating}
            className="text-xs border border-white/8 hover:border-[#C9A84C]/30 text-[#7A7268] hover:text-[#C9A84C] px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-40">
            {simulating ? "Running…" : "Simulate day"}
          </button>
        </div>

        {/* Sim result */}
        {simResult && (
          <div className={`rounded-2xl border p-5 animate-fade-up ${simResult.status === "approved" ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/3 border-white/6"}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-[#7A7268] uppercase tracking-widest">Simulation</span>
              <span className="text-xs text-[#C9A84C]">— {simResult.scenario}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Expected", value: `₹${simResult.expected_income}`, color: "" },
                { label: "Actual", value: `₹${simResult.actual_income}`, color: "" },
                { label: "Loss", value: `₹${simResult.loss}`, color: "text-[#E07070]" },
                { label: "Payout", value: `₹${simResult.payout}`, color: simResult.payout > 0 ? "text-emerald-400" : "text-[#7A7268]" },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs text-[#7A7268] mb-1">{item.label}</div>
                  <div className={`font-display text-xl ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                simResult.status === "approved" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                simResult.status === "rejected" ? "border-red-500/30 text-[#E07070] bg-red-500/10" :
                "border-white/10 text-[#7A7268]"
              }`}>{simResult.status}</span>
              {simResult.trigger.triggered && <span className="text-xs text-[#7A7268]">{simResult.trigger.reasons.join(", ")}</span>}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-2xl border p-5 ${riskBg}`}>
            <div className="text-xs text-[#7A7268] mb-2">Risk score</div>
            <div className={`font-display text-2xl mb-1 ${riskColor}`}>{riskPct}%</div>
            <div className="text-xs text-[#3A3632]">{riskPct > 65 ? "High risk" : riskPct > 40 ? "Medium risk" : "Low risk"}</div>
          </div>
          <div className="rounded-2xl bg-[#111111] border border-white/5 p-5">
            <div className="text-xs text-[#7A7268] mb-2">Weekly premium</div>
            <div className="font-display text-2xl text-[#F0ECE4] mb-1">₹{policy?.premium ?? "—"}</div>
            <div className="text-xs text-[#3A3632]">Coverage ₹{policy?.coverage ?? "—"}</div>
          </div>
          <div className={`rounded-2xl border p-5 ${weather.temperature > 40 ? "bg-orange-500/5 border-orange-500/15" : "bg-[#111111] border-white/5"}`}>
            <div className="text-xs text-[#7A7268] mb-2">Temperature</div>
            <div className={`font-display text-2xl mb-1 ${weather.temperature > 40 ? "text-orange-400" : "text-[#F0ECE4]"}`}>
              {weather.temperature}°C
            </div>
            <div className="text-xs text-[#3A3632] capitalize">{weather.description}</div>
          </div>
          <div className={`rounded-2xl border p-5 ${aqi.aqi > 300 ? "bg-red-500/5 border-red-500/15" : aqi.aqi > 150 ? "bg-[#C9A84C]/5 border-[#C9A84C]/15" : "bg-[#111111] border-white/5"}`}>
            <div className={`text-xs mb-2 ${aqi.aqi > 300 ? "text-[#E07070]" : aqi.aqi > 150 ? "text-[#C9A84C]" : "text-[#7A7268]"}`}>AQI</div>
            <div className={`font-display text-2xl mb-1 ${aqi.aqi > 300 ? "text-[#E07070]" : aqi.aqi > 150 ? "text-[#C9A84C]" : "text-[#F0ECE4]"}`}>
              {aqi.aqi}
            </div>
            <div className="text-xs text-[#3A3632]">
              {aqi.aqi > 400 ? "Hazardous" : aqi.aqi > 300 ? "Very unhealthy" : aqi.aqi > 150 ? "Unhealthy" : "Moderate"}
            </div>
          </div>
        </div>

        {/* Activity + Payouts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="text-xs text-[#7A7268] uppercase tracking-widest font-medium">Today&apos;s activity</div>
              <Link href="/tracker" className="text-xs text-[#C9A84C] hover:text-[#D4B86A] transition-colors">
                {todayActivity ? "Update →" : "Start →"}
              </Link>
            </div>
            {todayActivity ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#7A7268]">Active hours</span>
                    <span className="font-medium">{Number(todayActivity.active_hours).toFixed(1)}h</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7B1A2A] to-[#C9A84C] rounded-full transition-all duration-500"
                      style={{width: `${Math.min((Number(todayActivity.active_hours) / 10) * 100, 100)}%`}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#7A7268]">Distance</span>
                    <span className="font-medium">{Number(todayActivity.distance).toFixed(1)} km</span>
                  </div>
                  <div className="h-1.5 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#7B1A2A] to-[#C9A84C] rounded-full transition-all duration-500"
                      style={{width: `${Math.min((Number(todayActivity.distance) / 60) * 100, 100)}%`}} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">📍</div>
                <div className="text-xs text-[#3A3632] mb-4">No activity logged yet today</div>
                <Link href="/tracker" className="inline-flex text-xs bg-[#7B1A2A]/20 hover:bg-[#7B1A2A]/30 border border-[#7B1A2A]/30 text-[#C9A84C] px-4 py-2 rounded-full transition-all duration-200">
                  Start tracking
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
            <div className="text-xs text-[#7A7268] uppercase tracking-widest font-medium mb-5">Recent payouts</div>
            {recent_payouts.length > 0 ? (
              <div className="space-y-2">
                {recent_payouts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${p.status === "approved" ? "bg-emerald-400" : p.status === "rejected" ? "bg-[#E07070]" : "bg-[#3A3632]"}`} />
                      <span className="text-xs text-[#7A7268] capitalize">{p.status}</span>
                    </div>
                    <span className={`font-display text-base ${p.payout > 0 ? "text-emerald-400" : "text-[#3A3632]"}`}>
                      ₹{p.payout}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">💸</div>
                <div className="text-xs text-[#3A3632]">No payouts yet</div>
              </div>
            )}
          </div>
        </div>

        {/* Policy card */}
        <div className="rounded-2xl bg-[#111111] border border-white/5 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-xs text-[#7A7268] uppercase tracking-widest font-medium mb-1">Policy</div>
              <div className="font-display text-xl text-[#F0ECE4]">Income Protection Plan</div>
            </div>
            {policy && (
              <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">Active</span>
            )}
          </div>

          {policy && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Weekly premium", value: `₹${policy.premium}` },
                  { label: "Coverage", value: `₹${policy.coverage}` },
                  { label: "Deductible", value: `₹${policy.deductible}` },
                  { label: "Payout cap", value: `₹${policy.payout_cap}` },
                ].map(item => (
                  <div key={item.label} className="bg-[#0A0A0A] rounded-xl p-4">
                    <div className="text-xs text-[#7A7268] mb-1.5">{item.label}</div>
                    <div className="font-display text-lg text-[#F0ECE4]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/payout" className="inline-flex items-center gap-1.5 text-xs bg-[#7B1A2A] hover:bg-[#8F2035] text-white px-5 py-2.5 rounded-full font-medium transition-all duration-200 shadow-lg shadow-[#7B1A2A]/25 hover:scale-105">
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
                      key: order.key_id, amount: order.amount, currency: order.currency,
                      name: "Zensure", description: "Weekly Income Protection Premium",
                      order_id: order.order_id,
                      handler: () => alert("Payment successful! Policy renewed."),
                      theme: { color: "#7B1A2A" },
                    };
                    // @ts-expect-error Razorpay from CDN
                    new window.Razorpay(options).open();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs border border-white/8 hover:border-[#C9A84C]/30 text-[#7A7268] hover:text-[#C9A84C] px-5 py-2.5 rounded-full transition-all duration-200"
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
