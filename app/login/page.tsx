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
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">Z</div>
            <span className="font-bold text-lg">Zensure</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm">Sign in to your dashboard</p>
        </div>

        <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input
                type="email" required
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0D1526] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Password</label>
              <input
                type="password" required
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#0D1526] border border-[#1E3A5F] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && <div className="bg-red-900/20 border border-red-800/50 text-red-400 text-xs px-3 py-2 rounded-lg">{error}</div>}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-3 text-sm font-semibold transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            No account?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300">Register free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
