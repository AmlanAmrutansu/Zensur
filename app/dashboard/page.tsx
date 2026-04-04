"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Activity, TrendingUp, CloudRain, Thermometer, Wind,
  IndianRupee, Zap, AlertTriangle, CheckCircle2, XCircle,
  LogOut, ChevronRight, Wallet, BarChart3, Clock, Navigation,
} from "lucide-react";

interface DashboardData {
  user: { name: string; city: string; avg_income: number; working_hours: number };
  policy: { premium: number; coverage: number; deductible: number; payout_cap: number; risk_score: number } | null;
  activities: { active_hours: number; distance: number; date: string }[];
  recent_payouts: { payout: number; status: string; created_at: string }[];
  weather: { temperature: number; rainfall: number; humidity: number; description: string };
  aqi: { aqi: number };
  trigger: { triggered: boolean; reasons: string[] };
}

interface SimResult {
  scenario: string; payout: number; status: string;
  expected_income: number; actual_income: number; loss: number;
  trigger: { triggered: boolean; reasons: string[] };
  reasoning?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<SimResult | null>(null);

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
    if (res.ok) { const d = await res.json(); setSimResult(d); load(); }
    setSimulating(false);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
          <Shield size={18} className="text-emerald-400" />
        </div>
        <span className="text-zinc-600 text-xs">Loading dashboard…</span>
      </div>
    </div>
  );
  if (!data) return null;

  const { user, policy, activities, recent_payouts, weather, aqi, trigger } = data;
  const todayActivity = activities[0];
  const riskPct = policy ? Math.round(policy.risk_score * 100) : 0;
  const aqiNum = aqi.aqi;
  const aqiLabel = aqiNum > 400 ? "Hazardous" : aqiNum > 300 ? "Very Unhealthy" : aqiNum > 150 ? "Unhealthy" : "Moderate";
  const aqiColor = aqiNum > 300 ? "text-red-400" : aqiNum > 150 ? "text-amber-400" : "text-emerald-400";

  const potentialPayout = policy ? Math.min(
    Math.max(Math.round(user.avg_income * 0.7) - policy.deductible, 0),
    policy.payout_cap
  ) : 0;

  const riskColor = riskPct > 65 ? "text-red-400" : riskPct > 45 ? "text-amber-400" : "text-emerald-400";
  const riskBg    = riskPct > 65 ? "bg-red-500/10 border-red-500/20" : riskPct > 45 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20";

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[400px] rounded-full bg-emerald-500/4 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-blue-500/4 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Zensure</span>
          </div>

          {/* Status header — weather + AQI glowing badges */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="badge-blue gap-1.5">
              <Thermometer size={11} />
              {weather.temperature}°C
            </span>
            <span className="badge-blue gap-1.5">
              <CloudRain size={11} />
              {weather.rainfall}mm
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1 border ${aqiNum > 300 ? "bg-red-500/12 border-red-500/25 text-red-400" : aqiNum > 150 ? "bg-amber-500/12 border-amber-500/25 text-amber-400" : "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"}`}>
              <Wind size={11} />
              AQI {aqiNum}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/tracker" className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all min-h-[40px]">
              <Activity size={13} /> Tracker
            </Link>
            <Link href="/payout" className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-all min-h-[40px]">
              <Wallet size={13} /> Payout
            </Link>
            <button onClick={logout} className="ml-1 p-2 text-zinc-600 hover:text-zinc-400 rounded-lg hover:bg-zinc-800/60 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5 relative z-10">

        {/* Trigger alert */}
        {trigger.triggered && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={15} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-amber-300 text-sm mb-0.5">Adverse conditions in {user.city}</div>
              <div className="text-xs text-zinc-500">{trigger.reasons.join(" · ")}</div>
            </div>
            <Link href="/payout" className="btn-emerald px-4 py-2 text-xs flex items-center gap-1.5 flex-shrink-0">
              Check payout <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {/* Top row: greeting + hero payout card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 glass-card border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-1">Welcome back</p>
                <h1 className="text-2xl font-extrabold tracking-tight">{user.name.split(" ")[0]}</h1>
                <p className="text-xs text-zinc-500 mt-0.5">{user.city} · {user.working_hours}h/day</p>
              </div>
              <button
                onClick={simulate} disabled={simulating}
                className="btn-emerald px-4 py-2.5 text-xs flex items-center gap-2 animate-glow-emerald"
              >
                {simulating ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Simulating…</>
                ) : (
                  <><Zap size={13} />Simulate day</>
                )}
              </button>
            </div>

            {/* Mobile weather strip */}
            <div className="flex sm:hidden items-center gap-2 flex-wrap">
              <span className="badge-blue"><Thermometer size={11} />{weather.temperature}°C</span>
              <span className="badge-blue"><CloudRain size={11} />{weather.rainfall}mm</span>
              <span className={aqiNum > 300 ? "badge-red" : aqiNum > 150 ? "badge-amber" : "badge-emerald"}>
                <Wind size={11} />AQI {aqiNum} · {aqiLabel}
              </span>
            </div>
          </div>

          {/* Hero payout card */}
          <div className="glass-card border border-emerald-500/20 bg-emerald-500/5 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee size={13} className="text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Potential Payout</span>
            </div>
            <div className="text-4xl font-extrabold text-emerald-400 tracking-tight animate-number-pop">
              ₹{potentialPayout.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-zinc-600 mt-2">If triggered today</div>
            <Link href="/payout" className="mt-4 btn-emerald py-2.5 px-4 text-xs flex items-center justify-center gap-1.5">
              Run analysis <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Simulation result */}
        {simResult && (
          <div className={`glass-card border p-5 animate-fade-in ${simResult.status === "approved" ? "border-emerald-500/25 bg-emerald-500/5" : "border-zinc-800"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={14} className="text-emerald-400" />
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Simulation — {simResult.scenario}</span>
              <span className={`ml-auto text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                simResult.status === "approved" ? "badge-emerald" :
                simResult.status === "rejected" ? "badge-red" : "badge-amber"
              }`}>{simResult.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Expected", value: `₹${simResult.expected_income}`, color: "text-white" },
                { label: "Actual",   value: `₹${simResult.actual_income}`,   color: "text-white" },
                { label: "Loss",     value: `₹${simResult.loss}`,             color: "text-red-400" },
                { label: "Payout",   value: `₹${simResult.payout}`,           color: simResult.payout > 0 ? "text-emerald-400" : "text-zinc-500" },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-xs text-zinc-500 mb-1">{item.label}</div>
                  <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            {simResult.reasoning && (
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 animate-fade-in">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5">
                  <Zap size={11} className="text-blue-400" /> AI Reasoning
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{simResult.reasoning}</p>
              </div>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`stat-card border ${riskBg}`}>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={13} className={riskColor} />
              <span className="text-xs text-zinc-500 font-medium">Risk Score</span>
            </div>
            <div className={`text-2xl font-extrabold ${riskColor} mb-1`}>{riskPct}%</div>
            <div className="text-xs text-zinc-600">{riskPct > 65 ? "High risk" : riskPct > 45 ? "Medium risk" : "Low risk"}</div>
          </div>

          <div className="stat-card border border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-blue-400" />
              <span className="text-xs text-zinc-500 font-medium">Premium</span>
            </div>
            <div className="text-2xl font-extrabold text-white mb-1">₹{policy?.premium ?? "—"}</div>
            <div className="text-xs text-zinc-600">per week</div>
          </div>

          <div className={`stat-card border ${weather.temperature > 40 ? "bg-amber-500/8 border-amber-500/20" : "border-zinc-800"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Thermometer size={13} className={weather.temperature > 40 ? "text-amber-400" : "text-zinc-400"} />
              <span className="text-xs text-zinc-500 font-medium">Temperature</span>
            </div>
            <div className={`text-2xl font-extrabold mb-1 ${weather.temperature > 40 ? "text-amber-400" : "text-white"}`}>
              {weather.temperature}°C
            </div>
            <div className="text-xs text-zinc-600 capitalize">{weather.description}</div>
          </div>

          <div className={`stat-card border ${aqiNum > 300 ? "bg-red-500/8 border-red-500/20" : aqiNum > 150 ? "bg-amber-500/8 border-amber-500/20" : "border-zinc-800"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Wind size={13} className={aqiColor} />
              <span className="text-xs text-zinc-500 font-medium">AQI</span>
            </div>
            <div className={`text-2xl font-extrabold mb-1 ${aqiColor}`}>{aqiNum}</div>
            <div className="text-xs text-zinc-600">{aqiLabel}</div>
          </div>
        </div>

        {/* Activity + Payouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Activity */}
          <div className="glass-card border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-dot" />
                  <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
                </div>
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Live Tracking</span>
              </div>
              <Link href="/tracker" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                {todayActivity ? "Update" : "Start"} <ChevronRight size={12} />
              </Link>
            </div>

            {todayActivity ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Clock size={11} />Active hours</span>
                    <span className="font-bold text-white">{Number(todayActivity.active_hours).toFixed(1)}h</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill-blue" style={{width:`${Math.min((Number(todayActivity.active_hours)/10)*100,100)}%`}} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500 flex items-center gap-1.5"><Navigation size={11} />Distance</span>
                    <span className="font-bold text-white">{Number(todayActivity.distance).toFixed(1)} km</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill-blue" style={{width:`${Math.min((Number(todayActivity.distance)/60)*100,100)}%`}} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity size={28} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-xs text-zinc-600 mb-4">No shift logged today</p>
                <Link href="/tracker" className="btn-blue px-5 py-2.5 text-xs inline-flex items-center gap-2">
                  <Activity size={12} /> Start tracking
                </Link>
              </div>
            )}
          </div>

          {/* Payouts */}
          <div className="glass-card border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 size={13} className="text-emerald-400" />
                <span className="text-xs text-zinc-400 font-semibold uppercase tracking-widest">Recent Payouts</span>
              </div>
              <Link href="/payout" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight size={12} />
              </Link>
            </div>

            {recent_payouts.length > 0 ? (
              <div className="space-y-2">
                {recent_payouts.slice(0, 4).map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
                    <div className="flex items-center gap-2.5">
                      {p.status === "approved" ? <CheckCircle2 size={13} className="text-emerald-400" /> :
                       p.status === "rejected" ? <XCircle size={13} className="text-red-400" /> :
                       <div className="w-3 h-3 rounded-full border border-zinc-600" />}
                      <span className="text-xs text-zinc-500 capitalize">{p.status}</span>
                    </div>
                    <span className={`text-sm font-bold ${p.payout > 0 ? "text-emerald-400" : "text-zinc-600"}`}>
                      ₹{p.payout}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Wallet size={28} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-xs text-zinc-600">No payouts yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Policy card */}
        {policy && (
          <div className="glass-card border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                  <Shield size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Income Protection Plan</div>
                  <div className="text-xs text-zinc-500">Active policy</div>
                </div>
              </div>
              <span className="badge-emerald"><CheckCircle2 size={11} />Active</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Weekly premium", value: `₹${policy.premium}`, icon: IndianRupee },
                { label: "Coverage",       value: `₹${policy.coverage}`,  icon: Shield },
                { label: "Deductible",     value: `₹${policy.deductible}`,icon: TrendingUp },
                { label: "Payout cap",     value: `₹${policy.payout_cap}`,icon: Wallet },
              ].map(item => (
                <div key={item.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs text-zinc-500 mb-1.5">{item.label}</div>
                  <div className="font-bold text-base text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/payout" className="btn-emerald px-5 py-2.5 text-sm flex items-center gap-2">
                <Zap size={13} /> Check payout
              </Link>
              <button
                onClick={async () => {
                  const res = await fetch("/api/payment/create-order", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: policy.premium }),
                  });
                  const order = await res.json();
                  if (!order.order_id) return alert("Payment setup failed");
                  // @ts-expect-error Razorpay CDN
                  new window.Razorpay({
                    key: order.key_id, amount: order.amount, currency: order.currency,
                    name: "Zensure", description: "Weekly Income Protection Premium",
                    order_id: order.order_id,
                    handler: () => alert("Premium paid — policy renewed!"),
                    theme: { color: "#10b981" },
                  }).open();
                }}
                className="btn-ghost px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <IndianRupee size={13} /> Pay ₹{policy.premium} premium
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
