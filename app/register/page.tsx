"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", password: "", city: "Mumbai", avg_income: "650", working_hours: "8",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-[#0A0A0A] border border-white/6 rounded-xl px-4 py-3 text-sm text-[#F0ECE4] placeholder-[#3A3632] focus:outline-none focus:border-[#C9A84C]/40 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#7B1A2A] opacity-[0.06] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center shadow-lg shadow-[#7B1A2A]/30">
              <span className="text-[#C9A84C] font-bold text-sm">Z</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl text-[#F0ECE4] mb-2">Get protected</h1>
          <p className="text-[#7A7268] text-sm">AI sets your risk score and premium instantly</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(n => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all duration-300 ${step >= n ? "bg-[#7B1A2A] text-white" : "bg-white/5 text-[#3A3632]"}`}>
                {n}
              </div>
              <div className={`flex-1 h-px transition-all duration-300 ${step > n ? "bg-[#7B1A2A]" : "bg-white/5"}`} />
            </div>
          ))}
          <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${step >= 2 ? "bg-[#7B1A2A] text-white" : "bg-white/5 text-[#3A3632]"}`}>✓</div>
        </div>

        <div className="bg-[#111111] rounded-3xl border border-white/6 p-8 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-up">
                <div className="mb-2">
                  <span className="text-xs text-[#C9A84C] font-medium uppercase tracking-widest">Step 1 — Account</span>
                </div>
                <div>
                  <label className="block text-xs text-[#7A7268] mb-2 font-medium">Full name</label>
                  <input type="text" required placeholder="Rahul Kumar" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#7A7268] mb-2 font-medium">Email address</label>
                  <input type="email" required placeholder="rahul@example.com" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-[#7A7268] mb-2 font-medium">Password</label>
                  <input type="password" required minLength={6} placeholder="Min. 6 characters" value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} />
                </div>
                <button
                  type="button"
                  onClick={() => { if (form.name && form.email && form.password.length >= 6) setStep(2); }}
                  className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#7B1A2A]/30 hover:scale-[1.01] mt-2"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <div className="mb-2">
                  <span className="text-xs text-[#C9A84C] font-medium uppercase tracking-widest">Step 2 — Work profile</span>
                </div>
                <div>
                  <label className="block text-xs text-[#7A7268] mb-2 font-medium">Your city</label>
                  <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass}>
                    {CITIES.map(c => <option key={c} className="bg-[#111111]">{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#7A7268] mb-2 font-medium">Daily income (₹)</label>
                    <input type="number" min="200" max="2000" value={form.avg_income}
                      onChange={e => setForm({ ...form, avg_income: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs text-[#7A7268] mb-2 font-medium">Hours / day</label>
                    <input type="number" min="4" max="16" value={form.working_hours}
                      onChange={e => setForm({ ...form, working_hours: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div className="bg-[#C9A84C]/8 border border-[#C9A84C]/15 rounded-xl p-4">
                  <div className="text-xs text-[#C9A84C] font-medium mb-1">AI will calculate</div>
                  <div className="text-xs text-[#7A7268]">Risk score · Weekly premium · Coverage amount · Payout cap</div>
                </div>

                {error && (
                  <div className="bg-[#7B1A2A]/10 border border-[#7B1A2A]/30 rounded-xl px-4 py-3 text-xs text-[#E07070]">{error}</div>
                )}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 border border-white/8 hover:border-white/15 text-[#7A7268] hover:text-[#F0ECE4] rounded-xl py-3 text-sm transition-all duration-200">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-[2] bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#7B1A2A]/30 hover:scale-[1.01]">
                    {loading ? "Creating account…" : "Create account →"}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-[#3A3632]">
              Already registered?{" "}
              <Link href="/login" className="text-[#C9A84C] hover:text-[#D4B86A] transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {["AI risk scoring", "Auto payouts", "No claim forms"].map(feat => (
            <div key={feat} className="bg-[#111111] rounded-xl border border-white/5 px-3 py-2.5 text-center">
              <div className="text-xs text-[#3A3632]">{feat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
