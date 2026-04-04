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
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  if (checking) return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
      <div className="text-gray-500 text-sm">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#0D2040]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xs">Z</div>
          <span className="font-bold">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white">← Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-2">Payout Check</h1>
        <p className="text-gray-500 text-sm mb-8">Our decision engine evaluates today&apos;s conditions and your activity to determine payout eligibility.</p>

        {!result && (
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-8 text-center mb-6">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="font-semibold mb-2">Run Payout Analysis</h2>
            <p className="text-gray-500 text-sm mb-6">The system checks weather, AQI, your activity, fraud indicators, and applies the payout formula.</p>
            <button
              onClick={checkPayout} disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-8 py-3 rounded-xl font-semibold transition-all"
            >
              {loading ? "Analyzing..." : "Check Payout Eligibility"}
            </button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {!result.eligible ? (
              <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-xl">☁️</div>
                  <div>
                    <div className="font-semibold">No Payout Triggered</div>
                    <div className="text-xs text-gray-500 mt-0.5">{result.reason}</div>
                  </div>
                </div>
                {result.weather && (
                  <div className="grid grid-cols-3 gap-3 bg-[#0D1526] rounded-xl p-4 text-xs">
                    <div><div className="text-gray-500">Rainfall</div><div className="font-medium mt-0.5">{result.weather.rainfall}mm</div></div>
                    <div><div className="text-gray-500">Temp</div><div className="font-medium mt-0.5">{result.weather.temperature}°C</div></div>
                    <div><div className="text-gray-500">AQI</div><div className="font-medium mt-0.5">{result.aqi}</div></div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {result.trigger?.reasons && (
                  <div className="bg-orange-900/20 border border-orange-700/40 rounded-xl p-4">
                    <div className="text-xs font-medium text-orange-300 mb-1">Trigger Conditions Met</div>
                    {result.trigger.reasons.map((r, i) => (
                      <div key={i} className="text-xs text-orange-400">• {r}</div>
                    ))}
                  </div>
                )}

                <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-6">
                  <div className="text-xs font-mono text-gray-500 mb-4">DECISION ENGINE OUTPUT</div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="bg-[#0D1526] rounded-xl p-4">
                      <div className="text-xs text-gray-500">Expected Income</div>
                      <div className="text-xl font-bold mt-1">₹{result.expected_income}</div>
                    </div>
                    <div className="bg-[#0D1526] rounded-xl p-4">
                      <div className="text-xs text-gray-500">Actual Income</div>
                      <div className="text-xl font-bold mt-1">₹{result.actual_income}</div>
                    </div>
                    <div className="bg-[#0D1526] rounded-xl p-4">
                      <div className="text-xs text-gray-500">Loss</div>
                      <div className="text-xl font-bold text-red-400 mt-1">₹{result.loss}</div>
                    </div>
                    <div className={`rounded-xl p-4 ${result.payout && result.payout > 0 ? "bg-green-900/30 border border-green-700/40" : "bg-[#0D1526]"}`}>
                      <div className="text-xs text-gray-500">Payout</div>
                      <div className={`text-xl font-bold mt-1 ${result.payout && result.payout > 0 ? "text-green-400" : "text-gray-400"}`}>
                        ₹{result.payout}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.status === "approved" ? "bg-green-800/40 text-green-300" :
                      result.status === "rejected" ? "bg-red-800/40 text-red-300" :
                      "bg-gray-800/40 text-gray-300"
                    }`}>
                      {result.status?.toUpperCase()}
                    </span>
                    {result.rejection_reason && (
                      <span className="text-xs text-gray-500">{result.rejection_reason}</span>
                    )}
                    {result.fraud_score !== undefined && (
                      <span className="text-xs text-gray-600">Fraud score: {result.fraud_score.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => setResult(null)}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              ← Run again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
