"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", city: "Mumbai",
    avg_income: "650", working_hours: "8",
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
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "w-full bg-[#111111] border border-[#1F1F1F] focus:border-[#C9A84C] px-4 py-2.5 text-sm text-[#F0ECE4] placeholder-[#3E3A36] outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4] flex">

      {/* Left panel */}
      <div className="hidden md:flex flex-col justify-between w-80 border-r border-[#1F1F1F] p-10 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-7 h-7 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs font-bold">Z</span>
          </div>
          <span className="font-serif text-sm tracking-wide">Zensure</span>
        </Link>

        <div>
          <div className="font-serif text-2xl leading-snug mb-6 text-[#F0ECE4]">
            &ldquo;When it rained for three days straight, Zensure covered my loss before I even noticed.&rdquo;
          </div>
          <div className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>Rajan K. — Zepto rider, Mumbai</div>
        </div>

        <div className="space-y-4">
          {[
            { label: "AI risk scoring", ok: true },
            { label: "Automatic payouts", ok: true },
            { label: "No claim forms ever", ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-4 h-4 border border-[#C9A84C] flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 bg-[#C9A84C]"></div>
              </div>
              <span className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-1 text-[#C9A84C] text-xs tracking-widest uppercase" style={{fontFamily:"system-ui,sans-serif"}}>New account</div>
          <h1 className="font-serif text-3xl mb-1">Get protected</h1>
          <p className="text-[#7A7268] text-xs mb-8" style={{fontFamily:"system-ui,sans-serif"}}>AI sets your premium in seconds after you register.</p>

          <form onSubmit={handleSubmit} className="space-y-4" style={{fontFamily:"system-ui,sans-serif"}}>
            <div>
              <label className="block text-xs text-[#7A7268] mb-1.5">Full name</label>
              <input type="text" required placeholder="Rahul Kumar" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs text-[#7A7268] mb-1.5">Email address</label>
              <input type="email" required placeholder="rahul@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs text-[#7A7268] mb-1.5">Password</label>
              <input type="password" required minLength={6} placeholder="Minimum 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label className="block text-xs text-[#7A7268] mb-1.5">City</label>
              <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={fieldClass}>
                {CITIES.map(c => <option key={c} className="bg-[#111111]">{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#7A7268] mb-1.5">Daily income (₹)</label>
                <input type="number" min="200" max="2000" value={form.avg_income}
                  onChange={e => setForm({ ...form, avg_income: e.target.value })} className={fieldClass} />
              </div>
              <div>
                <label className="block text-xs text-[#7A7268] mb-1.5">Hours per day</label>
                <input type="number" min="4" max="16" value={form.working_hours}
                  onChange={e => setForm({ ...form, working_hours: e.target.value })} className={fieldClass} />
              </div>
            </div>

            {error && (
              <div className="border border-[#3D1820] bg-[#1F0C10] text-[#E07070] text-xs px-4 py-2.5">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-40 text-[#F0ECE4] py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading ? "Creating account..." : <>Create account <span className="text-[#C9A84C]">→</span></>}
            </button>
          </form>

          <p className="mt-6 text-xs text-[#3E3A36] text-center" style={{fontFamily:"system-ui,sans-serif"}}>
            Already registered?{" "}
            <Link href="/login" className="text-[#C9A84C] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
