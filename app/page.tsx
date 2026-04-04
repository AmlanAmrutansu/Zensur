"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, CloudRain, Thermometer, Wind, ArrowRight, CheckCircle2, Activity } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(r => { if (r.ok) router.replace("/dashboard"); });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-tight">Zensure</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800/60 min-h-[40px] flex items-center">
              Sign in
            </Link>
            <Link href="/register" className="btn-emerald px-5 py-2.5 text-sm flex items-center gap-2">
              Get protected <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-5 pt-24 pb-20 text-center animate-fade-up">
        <div className="badge-emerald mb-8 mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          AI-powered · Zero claims · Instant payouts
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight mb-6">
          Your income,{" "}
          <span className="text-emerald-400">protected</span>
          <br className="hidden sm:block" />
          <span className="text-zinc-500"> automatically.</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Rain, extreme heat, or hazardous air quality — Zensure detects adverse conditions
          and sends your payout automatically. No forms. No waiting. No calls.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="btn-emerald px-8 py-3.5 text-base flex items-center gap-2 w-full sm:w-auto justify-center animate-glow-emerald">
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-ghost px-8 py-3.5 text-sm w-full sm:w-auto justify-center flex items-center">
            Sign in to dashboard
          </Link>
        </div>
      </section>

      {/* Trigger cards */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <p className="text-center text-xs text-zinc-600 uppercase tracking-widest font-semibold mb-8">Monitored conditions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: CloudRain,   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",    label: "Heavy Rain",       threshold: "> 70 mm/hr",   desc: "Rainfall beyond safe delivery thresholds triggers automatic income coverage." },
            { icon: Thermometer, color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",  label: "Extreme Heat",     threshold: "> 42°C",       desc: "Working in extreme temperatures qualifies for income protection payouts." },
            { icon: Wind,        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20",      label: "Hazardous AQI",    threshold: "> 400 AQI",    desc: "Dangerous air quality prevents safe outdoor work — you're automatically covered." },
          ].map(card => (
            <div key={card.label} className={`glass-card p-6 border ${card.bg} group hover:scale-[1.02] transition-transform duration-200`}>
              <div className={`w-10 h-10 rounded-xl ${card.bg} border flex items-center justify-center mb-4`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className={`text-xs font-mono font-bold mb-1 ${card.color}`}>{card.threshold}</div>
              <div className="font-semibold text-sm text-white mb-2">{card.label}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <div className="glass-card border border-zinc-800 p-8 md:p-10">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "01", icon: Shield,   title: "Register",     desc: "Share your city, income, and working hours." },
              { n: "02", icon: Zap,      title: "AI scores you", desc: "Groq AI sets your risk score and premium instantly." },
              { n: "03", icon: Activity, title: "Track shifts",  desc: "GPS timer logs your hours and distance automatically." },
              { n: "04", icon: CheckCircle2, title: "Auto payout", desc: "Adverse conditions trigger analysis and payment in seconds." },
            ].map((s, i) => (
              <div key={s.n} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 text-xs font-mono font-bold">{s.n}</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center">
                  <s.icon size={16} className="text-zinc-400" />
                </div>
                <div className="font-semibold text-sm text-white">{s.title}</div>
                <div className="text-xs text-zinc-500 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "₹0",    label: "Claim paperwork" },
            { value: "< 10s", label: "Payout decision" },
            { value: "100%",  label: "AI-verified" },
          ].map(stat => (
            <div key={stat.label} className="glass-card border border-zinc-800 py-8 text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-5 pb-24">
        <div className="glass-card border border-emerald-500/20 bg-emerald-500/5 p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">
            Ready to protect your income?
          </h2>
          <p className="text-zinc-400 text-sm mb-8">Register in under 2 minutes. AI scores your risk instantly.</p>
          <Link href="/register" className="btn-emerald px-10 py-4 text-base inline-flex items-center gap-2">
            Create free account <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 px-5 py-6 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <Shield size={10} className="text-emerald-400" />
          </div>
          <span className="text-xs text-zinc-600 font-semibold">Zensure</span>
        </div>
        <span className="text-xs text-zinc-700">AI-powered parametric income protection</span>
      </footer>
    </div>
  );
}
