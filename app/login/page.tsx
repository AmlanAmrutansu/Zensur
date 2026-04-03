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

  const fieldClass = "w-full bg-[#111111] border border-[#1F1F1F] focus:border-[#C9A84C] px-4 py-3 text-sm text-[#F0ECE4] placeholder-[#3E3A36] outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <Link href="/" className="flex items-center gap-3 mb-12">
          <div className="w-7 h-7 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs font-bold">Z</span>
          </div>
          <span className="font-serif text-sm tracking-wide">Zensure</span>
        </Link>

        <div className="mb-1 text-[#C9A84C] text-xs tracking-widest uppercase" style={{fontFamily:"system-ui,sans-serif"}}>Welcome back</div>
        <h1 className="font-serif text-3xl mb-1">Sign in</h1>
        <p className="text-[#7A7268] text-xs mb-8" style={{fontFamily:"system-ui,sans-serif"}}>Access your protection dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4" style={{fontFamily:"system-ui,sans-serif"}}>
          <div>
            <label className="block text-xs text-[#7A7268] mb-1.5">Email address</label>
            <input type="email" required autoComplete="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label className="block text-xs text-[#7A7268] mb-1.5">Password</label>
            <input type="password" required autoComplete="current-password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} className={fieldClass} />
          </div>

          {error && (
            <div className="border border-[#3D1820] bg-[#1F0C10] text-[#E07070] text-xs px-4 py-2.5">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] disabled:opacity-40 text-[#F0ECE4] py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? "Signing in..." : <>Continue <span className="text-[#C9A84C]">→</span></>}
          </button>
        </form>

        <p className="mt-6 text-xs text-[#3E3A36] text-center" style={{fontFamily:"system-ui,sans-serif"}}>
          No account?{" "}
          <Link href="/register" className="text-[#C9A84C] hover:underline">Register free</Link>
        </p>
      </div>
    </div>
  );
}
