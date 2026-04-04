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
  const [simResult, setSimResult] = useState<null | { scenario: string; payout: number; status: string; expected_income: number; actual_income: number; loss: number; trigger: { triggered: boolean; reasons: string[] } }>(null);

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
    if (res.ok) {
      const d = await res.json();
      setSimResult(d);
      load();
    }
    setSimulating(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading dashboard...</div>
    </div>
  );

  if (!data) return null;

  const { user, policy, activities, recent_payouts, weather, aqi, trigger } = data;
  const todayActivity = activities[0];
  const riskPct = policy ? Math.round(policy.risk_score * 100) : 0;
  const riskColor = riskPct > 65 ? "text-red-400" : riskPct > 40 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#0D2040] sticky top-0 bg-[#050A14]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xs">Z</div>
          <span className="font-bold">Zensure</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tracker" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Activity Tracker</Link>
          <Link href="/payout" className="text-xs text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Payout</Link>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-white px-3 py-1.5 transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {trigger.triggered && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <div>
              <div className="font-semibold text-red-300 text-sm mb-1">Adverse Conditions Detected</div>
              <div className="text-xs text-red-400">{trigger.reasons.join(" · ")}</div>
              <Link href="/payout" className="inline-block mt-2 text-xs bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md transition-colors">Check Payout Eligibility →</Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Hi, {user.name.split(" ")[0]} 👋</h1>
            <p className="text-gray-500 text-xs mt-0.5">{user.city} · {user.working_hours}h/day · ₹{user.avg_income}/day avg</p>
          </div>
          <button
            onClick={simulate} disabled={simulating}
            className="text-xs bg-[#0D1E35] hover:bg-[#112244] border border-[#1E3A5F] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {simulating ? "Simulating..." : "🎲 Simulate Day"}
          </button>
        </div>

        {simResult && (
          <div className={`border rounded-xl p-4 ${simResult.status === "approved" ? "bg-green-900/20 border-green-700/50" : "bg-gray-800/30 border-gray-700/50"}`}>
            <div className="text-xs font-mono text-gray-400 mb-2">SIMULATION — {simResult.scenario}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="text-gray-500 text-xs">Expected</div><div className="font-semibold">₹{simResult.expected_income}</div></div>
              <div><div className="text-gray-500 text-xs">Actual</div><div className="font-semibold">₹{simResult.actual_income}</div></div>
              <div><div className="text-gray-500 text-xs">Loss</div><div className="font-semibold text-red-400">₹{simResult.loss}</div></div>
              <div><div className="text-gray-500 text-xs">Payout</div><div className={`font-semibold ${simResult.payout > 0 ? "text-green-400" : "text-gray-400"}`}>₹{simResult.payout}</div></div>
            </div>
            <div className="mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${simResult.status === "approved" ? "bg-green-800/50 text-green-300" : simResult.status === "rejected" ? "bg-red-800/50 text-red-300" : "bg-gray-800/50 text-gray-300"}`}>
                {simResult.status.toUpperCase()}
              </span>
              {simResult.trigger.triggered && <span className="ml-2 text-gray-400">{simResult.trigger.reasons.join(", ")}</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Risk Score</div>
            <div className={`text-2xl font-bold ${riskColor}`}>{riskPct}%</div>
            <div className="text-xs text-gray-600 mt-0.5">{riskPct > 65 ? "High" : riskPct > 40 ? "Medium" : "Low"}</div>
          </div>
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Weekly Premium</div>
            <div className="text-2xl font-bold">₹{policy?.premium ?? "—"}</div>
            <div className="text-xs text-gray-600 mt-0.5">Coverage: ₹{policy?.coverage ?? "—"}</div>
          </div>
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-1">Temperature</div>
            <div className="text-2xl font-bold">{weather.temperature}°C</div>
            <div className="text-xs text-gray-600 mt-0.5 capitalize">{weather.description}</div>
          </div>
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-4">
            <div className={`text-xs mb-1 ${aqi.aqi > 300 ? "text-red-400" : aqi.aqi > 150 ? "text-yellow-400" : "text-gray-500"}`}>AQI</div>
            <div className={`text-2xl font-bold ${aqi.aqi > 300 ? "text-red-400" : aqi.aqi > 150 ? "text-yellow-400" : ""}`}>{aqi.aqi}</div>
            <div className="text-xs text-gray-600 mt-0.5">{aqi.aqi > 400 ? "Hazardous" : aqi.aqi > 300 ? "Very Unhealthy" : aqi.aqi > 150 ? "Unhealthy" : "Moderate"}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-5">
            <div className="text-sm font-semibold mb-4">Today&apos;s Activity</div>
            {todayActivity ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Active Hours</span>
                  <span className="text-sm font-medium">{Number(todayActivity.active_hours).toFixed(1)}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Distance</span>
                  <span className="text-sm font-medium">{Number(todayActivity.distance).toFixed(1)} km</span>
                </div>
                <div className="mt-3">
                  <Link href="/tracker" className="text-xs text-blue-400 hover:text-blue-300">Update Activity →</Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-gray-600 text-xs mb-3">No activity logged today</div>
                <Link href="/tracker" className="text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors">Start Tracking</Link>
              </div>
            )}
          </div>

          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-5">
            <div className="text-sm font-semibold mb-4">Recent Payouts</div>
            {recent_payouts.length > 0 ? (
              <div className="space-y-2.5">
                {recent_payouts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === "approved" ? "bg-green-400" : p.status === "rejected" ? "bg-red-400" : "bg-gray-500"}`}></span>
                      <span className="text-xs text-gray-400 capitalize">{p.status}</span>
                    </div>
                    <span className={`text-sm font-medium ${p.payout > 0 ? "text-green-400" : "text-gray-500"}`}>
                      ₹{p.payout}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-600 text-center py-4">No payouts yet</div>
            )}
          </div>
        </div>

        <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold">Policy Details</div>
            {policy && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-800/40">Active</span>}
          </div>
          {policy ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Weekly Premium", value: `₹${policy.premium}` },
                { label: "Coverage", value: `₹${policy.coverage}` },
                { label: "Deductible", value: `₹${policy.deductible}` },
                { label: "Payout Cap", value: `₹${policy.payout_cap}` },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                  <div className="font-semibold text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-600">No policy found</div>
          )}
          {policy && (
            <div className="mt-4 pt-4 border-t border-[#0D2040]">
              <Link href="/payout" className="text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors mr-3">Check Payout</Link>
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
                    theme: { color: "#2563eb" },
                  };
                  // @ts-expect-error Razorpay is loaded from CDN
                  new window.Razorpay(options).open();
                }}
                className="text-xs border border-[#1E3A5F] hover:bg-[#0D1E35] px-4 py-2 rounded-lg transition-colors"
              >
                Pay Premium ₹{policy.premium}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
