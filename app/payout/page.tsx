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
      <div className="text-[#3E3A36] text-sm" style={{fontFamily:"system-ui,sans-serif"}}>Loading…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs">Z</span>
          </div>
          <span className="font-serif text-sm tracking-wide">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] transition-colors" style={{fontFamily:"system-ui,sans-serif"}}>← Dashboard</Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-14">
        <div className="text-[#C9A84C] text-xs tracking-widest uppercase mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Decision engine</div>
        <h1 className="font-serif text-3xl mb-2">Payout analysis</h1>
        <p className="text-[#7A7268] text-xs leading-relaxed mb-10" style={{fontFamily:"system-ui,sans-serif"}}>
          The system cross-checks today&apos;s weather, AQI, your tracked activity, and fraud indicators
          before applying the payout formula.
        </p>

        {!result && (
          <div className="border border-[#1F1F1F] p-10 text-center">
            <div className="font-serif text-5xl text-[#1F1F1F] mb-6">⊙</div>
            <p className="text-[#7A7268] text-xs mb-8 leading-relaxed" style={{fontFamily:"system-ui,sans-serif"}}>
              This runs a full 7-step check: trigger detection → income prediction → activity estimate →
              intent validation → fraud check → deductible → payout cap.
            </p>
            <button onClick={checkPayout} disabled={loading}
              className="bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-40 text-[#F0ECE4] px-10 py-3.5 text-sm font-medium transition-colors inline-flex items-center gap-2"
              style={{fontFamily:"system-ui,sans-serif"}}>
              {loading ? "Analyzing…" : <>Run analysis <span className="text-[#C9A84C]">→</span></>}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-5">

            {/* Conditions block */}
            {result.weather && (
              <div className="border border-[#1F1F1F]">
                <div className="px-5 py-3 border-b border-[#1F1F1F]">
                  <span className="text-xs text-[#7A7268] tracking-widest uppercase" style={{fontFamily:"system-ui,sans-serif"}}>Today&apos;s conditions</span>
                </div>
                <div className="grid grid-cols-3 gap-px bg-[#1F1F1F]">
                  {[
                    { label: "Rainfall", value: `${result.weather.rainfall}mm`, warn: (result.weather.rainfall ?? 0) > 70 },
                    { label: "Temperature", value: `${result.weather.temperature}°C`, warn: (result.weather.temperature ?? 0) > 42 },
                    { label: "AQI", value: `${result.aqi}`, warn: (result.aqi ?? 0) > 400 },
                  ].map(c => (
                    <div key={c.label} className="bg-[#0A0A0A] px-5 py-4">
                      <div className="text-xs text-[#7A7268] mb-1" style={{fontFamily:"system-ui,sans-serif"}}>{c.label}</div>
                      <div className={`font-serif text-xl ${c.warn ? "text-[#C87070]" : ""}`}>{c.value}</div>
                      {c.warn && <div className="text-xs text-[#7B1A2A] mt-0.5" style={{fontFamily:"system-ui,sans-serif"}}>Trigger threshold exceeded</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not eligible */}
            {!result.eligible && (
              <div className="border border-[#1F1F1F] px-6 py-6">
                <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-3" style={{fontFamily:"system-ui,sans-serif"}}>Result</div>
                <div className="font-serif text-xl mb-2">No payout triggered</div>
                <div className="text-[#7A7268] text-xs" style={{fontFamily:"system-ui,sans-serif"}}>{result.reason}</div>
              </div>
            )}

            {/* Eligible */}
            {result.eligible && (
              <>
                {result.trigger?.reasons && result.trigger.reasons.length > 0 && (
                  <div className="border border-[#3D1820] bg-[#1F0C10] px-5 py-4">
                    <div className="text-xs text-[#C9A84C] tracking-widest uppercase mb-2" style={{fontFamily:"system-ui,sans-serif"}}>Trigger conditions</div>
                    {result.trigger.reasons.map((r, i) => (
                      <div key={i} className="text-xs text-[#7A7268] py-1 border-b border-[#2D1010] last:border-0" style={{fontFamily:"system-ui,sans-serif"}}>
                        {r}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border border-[#1F1F1F]">
                  <div className="px-5 py-3 border-b border-[#1F1F1F]">
                    <span className="text-xs text-[#7A7268] tracking-widest uppercase" style={{fontFamily:"system-ui,sans-serif"}}>Income analysis</span>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-[#1F1F1F]">
                    {[
                      { label: "Expected income", value: `₹${result.expected_income}`, accent: false },
                      { label: "Actual income", value: `₹${result.actual_income}`, accent: false },
                      { label: "Loss", value: `₹${result.loss}`, accent: "red" },
                      { label: "Payout amount", value: `₹${result.payout}`, accent: result.payout && result.payout > 0 ? "green" : false },
                    ].map(item => (
                      <div key={item.label} className="bg-[#0A0A0A] px-5 py-5">
                        <div className="text-xs text-[#7A7268] mb-2" style={{fontFamily:"system-ui,sans-serif"}}>{item.label}</div>
                        <div className={`font-serif text-2xl ${item.accent === "red" ? "text-[#C87070]" : item.accent === "green" ? "text-[#7DC47D]" : ""}`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-[#1F1F1F] px-5 py-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#7A7268] mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Decision</div>
                    <span className={`text-xs border px-3 py-1 ${
                      result.status === "approved" ? "border-[#2D5E30] text-[#7DC47D]" :
                      result.status === "rejected" ? "border-[#3D1820] text-[#C87070]" :
                      "border-[#1F1F1F] text-[#7A7268]"
                    }`} style={{fontFamily:"system-ui,sans-serif"}}>{result.status?.toUpperCase()}</span>
                  </div>
                  {result.rejection_reason && (
                    <div className="text-xs text-[#7A7268] text-right max-w-xs" style={{fontFamily:"system-ui,sans-serif"}}>{result.rejection_reason}</div>
                  )}
                  {result.fraud_score !== undefined && (
                    <div className="text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>Fraud score: {result.fraud_score.toFixed(2)}</div>
                  )}
                </div>
              </>
            )}

            <button onClick={() => setResult(null)}
              className="text-xs text-[#3E3A36] hover:text-[#7A7268] transition-colors mt-2"
              style={{fontFamily:"system-ui,sans-serif"}}>
              ← Run again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
