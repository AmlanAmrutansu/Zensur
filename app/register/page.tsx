"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, User, Mail, Lock, MapPin, IndianRupee, Clock, ArrowRight, AlertCircle, CheckCircle2, Zap } from "lucide-react";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "Mumbai", avg_income: "650", working_hours: "8" });
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

  const step1Valid = form.name.length > 1 && form.email.includes("@") && form.password.length >= 6;

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-emerald-500/5 blur-[130px]" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield size={18} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mb-1">Get protected</h1>
          <p className="text-zinc-500 text-sm">Groq AI calculates your risk score instantly</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(n => (
            <div key={n} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= n ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-zinc-800 text-zinc-500"}`}>
                {step > n ? <CheckCircle2 size={14} /> : n}
              </div>
              {n < 2 && <div className={`flex-1 h-px transition-all duration-500 ${step > n ? "bg-emerald-500" : "bg-zinc-800"}`} />}
            </div>
          ))}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-zinc-800 text-zinc-500"}`}>
            <Zap size={13} />
          </div>
        </div>

        <div className="glass-card border border-zinc-800 p-6 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-4">Step 1 — Account</p>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Full name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="text" required placeholder="Rahul Kumar" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })} className="zn-input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="email" required placeholder="rahul@example.com" value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })} className="zn-input pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input type="password" required minLength={6} placeholder="Min. 6 characters" value={form.password}
                      autoComplete="new-password"
                      onChange={e => setForm({ ...form, password: e.target.value })} className="zn-input pl-10" />
                  </div>
                </div>
                <button type="button" onClick={() => { if (step1Valid) setStep(2); }}
                  className="btn-emerald w-full px-5 text-sm flex items-center justify-center gap-2 mt-2">
                  Continue <ArrowRight size={15} />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-4">Step 2 — Work profile</p>
                <div>
                  <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">City</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                      className="zn-input pl-10 appearance-none">
                      {CITIES.map(c => <option key={c} className="bg-zinc-900">{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Daily income</label>
                    <div className="relative">
                      <IndianRupee size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" min="200" max="5000" value={form.avg_income}
                        onChange={e => setForm({ ...form, avg_income: e.target.value })} className="zn-input pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-wide">Hours/day</label>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                      <input type="number" min="4" max="16" value={form.working_hours}
                        onChange={e => setForm({ ...form, working_hours: e.target.value })} className="zn-input pl-9" />
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                    <Zap size={12} /> Groq AI will calculate
                  </div>
                  <div className="text-xs text-zinc-500">Risk score · Premium · Coverage · Payout cap</div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs animate-fade-in">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 text-sm flex items-center justify-center">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-emerald flex-[2] px-5 text-sm flex items-center justify-center gap-2">
                    {loading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating…</>
                    ) : (
                      <>Create account <ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-800 text-center">
            <p className="text-xs text-zinc-600">
              Already registered?{" "}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {["AI risk scoring", "Auto payouts", "No claim forms"].map(f => (
            <div key={f} className="bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 px-2 text-center">
              <p className="text-xs text-zinc-600">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
