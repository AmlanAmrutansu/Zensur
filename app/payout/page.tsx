"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield, Zap, CheckCircle2, XCircle, CloudRain, Thermometer,
  Wind, ChevronLeft, AlertTriangle, Brain, IndianRupee, TrendingDown, Activity,
} from "lucide-react";

interface PayoutResult {
  eligible: boolean;
  reason?: string;
  status?: string;
  trigger?: { triggered: boolean; reasons: string[] };
  weather?: { rainfall: number; temperature: number; description: string };
  aqi?: number;
  expected_income?: number;
  actual_income?: number;
  loss?: number;
  payout?: number;
  rejection_reason?: string;
  fraud_score?: number;
  reasoning?: string;
  confidence?: number;
}

export default function PayoutPage() {
  const router = useRouter();
  const [result, setResult] = useState<PayoutResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) router.push("/login");
    setChecking(false);
  }, [router]);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  async function checkPayout() {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/payout", { method: "POST" });
    if (res.status === 401) { router.push("/login"); return; }
    setResult(await res.json());
    setLoading(false);
  }

  if (checking) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[130px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Zensure</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors min-h-[40px] px-3 rounded-lg hover:bg-zinc-800/60">
            <ChevronLeft size={13} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10 relative z-10">
        <div className="mb-8 animate-fade-up">
          <div className="badge-emerald mb-3">
            <Brain size={11} /> AI Decision Engine
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Payout Analysis</h1>
          <p className="text-zinc-500 text-xs leading-relaxed">
            7-step check: trigger detection → income prediction → activity validation → fraud detection → deductible → payout cap → AI decision.
          </p>
        </div>

        {!result && (
          <div className="glass-card border border-zinc-800 p-8 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <Zap size={26} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-extrabold mb-2">Run payout check</h2>
            <p className="text-zinc-500 text-xs mb-7 leading-relaxed max-w-xs mx-auto">
              Groq AI cross-checks live weather, your AQI, tracked activity, and fraud indicators to calculate your payout in seconds.
            </p>
            <button onClick={checkPayout} disabled={loading}
              className="btn-emerald px-10 py-4 text-base inline-flex items-center gap-2.5 animate-glow-emerald">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>
              ) : (
                <><Zap size={16} />Run analysis</>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-in">

            {/* Conditions */}
            {result.weather && (
              <div className="glass-card border border-zinc-800 p-5">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Live conditions</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: CloudRain,   label: "Rainfall",    value: `${result.weather.rainfall}mm`, warn: (result.weather.rainfall ?? 0) > 70, color: "text-blue-400" },
                    { icon: Thermometer, label: "Temperature", value: `${result.weather.temperature}°C`, warn: (result.weather.temperature ?? 0) > 42, color: "text-amber-400" },
                    { icon: Wind,        label: "AQI",         value: `${result.aqi}`, warn: (result.aqi ?? 0) > 400, color: "text-red-400" },
                  ].map(c => (
                    <div key={c.label} className={`rounded-xl p-3.5 text-center border ${c.warn ? "bg-red-500/10 border-red-500/20" : "bg-zinc-900/60 border-zinc-800"}`}>
                      <c.icon size={16} className={`mx-auto mb-1.5 ${c.warn ? "text-red-400" : "text-zinc-600"}`} />
                      <div className="text-xs text-zinc-500 mb-1">{c.label}</div>
                      <div className={`font-extrabold text-base ${c.warn ? "text-red-400" : "text-white"}`}>{c.value}</div>
                      {c.warn && <div className="text-xs text-red-500 mt-1 font-semibold">⚠ Triggered</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not eligible */}
            {!result.eligible && (
              <div className="glass-card border border-zinc-800 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={22} className="text-zinc-500" />
                </div>
                <div className="font-bold text-base mb-2">No payout triggered</div>
                <div className="text-zinc-500 text-xs">{result.reason}</div>
              </div>
            )}

            {/* Eligible */}
            {result.eligible && (
              <>
                {result.trigger?.reasons && result.trigger.reasons.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
                    <div className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                      <AlertTriangle size={11} /> Active triggers
                    </div>
                    {result.trigger.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-zinc-400 py-1.5 border-b border-amber-500/10 last:border-0">
                        <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" /> {r}
                      </div>
                    ))}
                  </div>
                )}

                {/* Income breakdown */}
                <div className="glass-card border border-zinc-800 p-5">
                  <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-4">Income analysis</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Expected income", value: `₹${result.expected_income}`, icon: IndianRupee, color: "text-white", highlight: false },
                      { label: "Actual income",   value: `₹${result.actual_income}`,   icon: Activity,    color: "text-white", highlight: false },
                      { label: "Loss calculated", value: `₹${result.loss}`,             icon: TrendingDown,color: "text-red-400", highlight: "red" },
                      {
                        label: "Payout amount",
                        value: `₹${result.payout}`,
                        icon: IndianRupee,
                        color: result.payout && result.payout > 0 ? "text-emerald-400" : "text-zinc-500",
                        highlight: result.payout && result.payout > 0 ? "emerald" : false,
                      },
                    ].map(item => (
                      <div key={item.label} className={`rounded-xl p-4 border ${
                        item.highlight === "emerald" ? "bg-emerald-500/10 border-emerald-500/20" :
                        item.highlight === "red"     ? "bg-red-500/10 border-red-500/20" :
                        "bg-zinc-900/60 border-zinc-800"
                      }`}>
                        <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
                          <item.icon size={11} /> {item.label}
                        </div>
                        <div className={`text-2xl font-extrabold ${item.color}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Status row */}
                  <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                    <span className={result.status === "approved" ? "badge-emerald" : result.status === "rejected" ? "badge-red" : "badge-amber"}>
                      {result.status === "approved" ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {result.status}
                    </span>
                    {result.rejection_reason && (
                      <span className="text-xs text-zinc-500">{result.rejection_reason}</span>
                    )}
                    {result.fraud_score !== undefined && (
                      <span className="ml-auto text-xs text-zinc-600">
                        Fraud: {result.fraud_score.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Reasoning */}
                {result.reasoning && (
                  <div className="glass-card border border-blue-500/20 bg-blue-500/5 p-5 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={13} className="text-blue-400" />
                      <span className="text-xs text-blue-400 font-semibold uppercase tracking-widest">Groq AI Reasoning</span>
                      {result.confidence !== undefined && (
                        <span className="ml-auto badge-blue">{Math.round(result.confidence * 100)}% confidence</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{result.reasoning}</p>
                  </div>
                )}
              </>
            )}

            <button onClick={() => setResult(null)} className="btn-ghost w-full text-sm flex items-center justify-center gap-2">
              ← Run again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
