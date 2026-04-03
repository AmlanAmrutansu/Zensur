"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full bg-[#7B1A2A] opacity-[0.06] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center shadow-lg shadow-[#7B1A2A]/30">
              <span className="text-[#C9A84C] font-bold text-sm">Z</span>
            </div>
          </Link>
          <h1 className="font-display text-3xl text-[#F0ECE4] mb-2">Welcome back</h1>
          <p className="text-[#7A7268] text-sm">Sign in to your protection dashboard</p>
        </div>

        <div className="bg-[#111111] rounded-3xl border border-white/6 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-[#7A7268] mb-2 font-medium">Email address</label>
              <input
                type="email" required autoComplete="email"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/6 rounded-xl px-4 py-3 text-sm text-[#F0ECE4] placeholder-[#3A3632] focus:outline-none focus:border-[#C9A84C]/40 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-[#7A7268] mb-2 font-medium">Password</label>
              <input
                type="password" required autoComplete="current-password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#0A0A0A] border border-white/6 rounded-xl px-4 py-3 text-sm text-[#F0ECE4] placeholder-[#3A3632] focus:outline-none focus:border-[#C9A84C]/40 focus:ring-1 focus:ring-[#C9A84C]/20 transition-all duration-200"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="bg-[#7B1A2A]/10 border border-[#7B1A2A]/30 rounded-xl px-4 py-3 text-xs text-[#E07070]">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#7B1A2A]/30 hover:shadow-[#7B1A2A]/50 hover:scale-[1.01] mt-2"
            >
              {loading ? "Signing in…" : "Continue →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-[#3A3632]">
              No account?{" "}
              <Link href="/register" className="text-[#C9A84C] hover:text-[#D4B86A] transition-colors">Register free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
