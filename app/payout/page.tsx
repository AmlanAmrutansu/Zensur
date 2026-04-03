"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 rounded-lg bg-[#7B1A2A]/20 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-[#7B1A2A] opacity-[0.05] blur-[120px] pointer-events-none" />

      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center">
            <span className="text-[#C9A84C] font-bold text-xs">Z</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-up">
          <div className="text-xs text-[#C9A84C] font-medium tracking-widest uppercase mb-2">Decision engine</div>
          <h1 className="font-display text-3xl mb-2">Payout analysis</h1>
          <p className="text-[#7A7268] text-xs leading-relaxed">
            Cross-checks weather, AQI, activity, and fraud indicators before calculating your payout.
          </p>
        </div>

        {!result && (
          <div className="bg-[#111111] rounded-3xl border border-white/5 p-10 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-[#7B1A2A]/10 border border-[#7B1A2A]/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="font-display text-xl mb-3">Run payout check</h2>
            <p className="text-[#7A7268] text-xs mb-8 leading-relaxed max-w-xs mx-auto">
              7-step analysis: trigger detection → income prediction → activity estimate →
              intent validation → fraud check → deductible → payout cap.
            </p>
            <button onClick={checkPayout} disabled={loading}
              className="bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-50 text-white px-10 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-xl shadow-[#7B1A2A]/30 hover:shadow-[#7B1A2A]/50 hover:scale-105 inline-flex items-center gap-2">
              {loading ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : "Run analysis →"}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-4 animate-fade-up">

            {/* Conditions */}
            {result.weather && (
              <div className="bg-[#111111] rounded-2xl border border-white/5 p-5">
                <div className="text-xs text-[#7A7268] uppercase tracking-widest font-medium mb-4">Today&apos;s conditions</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Rainfall", value: `${result.weather.rainfall}mm`, warn: (result.weather.rainfall ?? 0) > 70 },
                    { label: "Temperature", value: `${result.weather.temperature}°C`, warn: (result.weather.temperature ?? 0) > 42 },
                    { label: "AQI", value: `${result.aqi}`, warn: (result.aqi ?? 0) > 400 },
                  ].map(c => (
                    <div key={c.label} className={`rounded-xl p-3.5 text-center ${c.warn ? "bg-[#7B1A2A]/10 border border-[#7B1A2A]/20" : "bg-[#0A0A0A]"}`}>
                      <div className="text-xs text-[#7A7268] mb-1.5">{c.label}</div>
                      <div className={`font-display text-xl ${c.warn ? "text-[#E07070]" : "text-[#F0ECE4]"}`}>{c.value}</div>
                      {c.warn && <div className="text-xs text-[#7B1A2A] mt-1">⚠ Triggered</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not eligible */}
            {!result.eligible && (
              <div className="bg-[#111111] rounded-2xl border border-white/5 p-6 text-center">
                <div className="text-3xl mb-3">☁️</div>
                <div className="font-display text-lg mb-2">No payout triggered</div>
                <div className="text-[#7A7268] text-xs">{result.reason}</div>
              </div>
            )}

            {/* Eligible */}
            {result.eligible && (
              <>
                {result.trigger?.reasons && result.trigger.reasons.length > 0 && (
                  <div className="bg-[#7B1A2A]/10 border border-[#7B1A2A]/25 rounded-2xl p-4">
                    <div className="text-xs text-[#C9A84C] font-medium mb-2 uppercase tracking-widest">Triggers active</div>
                    {result.trigger.reasons.map((r, i) => (
                      <div key={i} className="text-xs text-[#7A7268] py-1 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#7B1A2A]" />
                        {r}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-[#111111] rounded-2xl border border-white/5 p-5">
                  <div className="text-xs text-[#7A7268] uppercase tracking-widest font-medium mb-4">Income analysis</div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Expected income", value: `₹${result.expected_income}`, highlight: "" },
                      { label: "Actual income", value: `₹${result.actual_income}`, highlight: "" },
                      { label: "Loss calculated", value: `₹${result.loss}`, highlight: "text-[#E07070]" },
                      {
                        label: "Payout amount",
                        value: `₹${result.payout}`,
                        highlight: result.payout && result.payout > 0 ? "text-emerald-400" : "text-[#3A3632]",
                      },
                    ].map(item => (
                      <div key={item.label} className={`rounded-xl p-4 ${item.label === "Payout amount" && result.payout && result.payout > 0 ? "bg-emerald-500/8 border border-emerald-500/15" : "bg-[#0A0A0A]"}`}>
                        <div className="text-xs text-[#7A7268] mb-2">{item.label}</div>
                        <div className={`font-display text-2xl ${item.highlight}`}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      result.status === "approved" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" :
                      result.status === "rejected" ? "border-red-500/30 text-[#E07070] bg-red-500/10" :
                      "border-white/10 text-[#7A7268]"
                    }`}>{result.status}</span>
                    {result.rejection_reason && (
                      <span className="text-xs text-[#7A7268]">{result.rejection_reason}</span>
                    )}
                    {result.fraud_score !== undefined && (
                      <span className="text-xs text-[#3A3632] ml-auto">Fraud: {result.fraud_score.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <button onClick={() => setResult(null)}
              className="text-xs text-[#3A3632] hover:text-[#7A7268] transition-colors py-2">
              ← Run again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
