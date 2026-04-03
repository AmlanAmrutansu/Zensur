"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    fetch("/api/auth/me").then(r => { if (r.ok) router.replace("/dashboard"); });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4] overflow-x-hidden">

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#7B1A2A] opacity-[0.07] blur-[120px] pointer-events-none" />
      <div className="fixed top-40 right-0 w-[300px] h-[300px] rounded-full bg-[#C9A84C] opacity-[0.04] blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center shadow-lg shadow-[#7B1A2A]/30">
            <span className="text-[#C9A84C] font-bold text-sm">Z</span>
          </div>
          <span className="font-semibold text-base text-[#F0ECE4] tracking-tight">Zensure</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-[#7A7268] hover:text-[#F0ECE4] transition-colors duration-200 rounded-lg hover:bg-white/5">
            Sign in
          </Link>
          <Link href="/register" className="px-4 py-2 text-sm font-medium bg-[#7B1A2A] hover:bg-[#8F2035] text-white rounded-full transition-all duration-200 shadow-lg shadow-[#7B1A2A]/30 hover:shadow-[#7B1A2A]/50">
            Get protected
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-8 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-xs font-medium mb-10 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse-ring" />
          AI-powered · Zero claims · Instant payouts
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.08] mb-7 animate-fade-up" style={{animationDelay:"0.1s"}}>
          Your income,{" "}
          <span className="text-[#C9A84C] italic">protected</span>
          <br />against what you{" "}
          <span className="text-[#7A7268]">can&apos;t control.</span>
        </h1>

        <p className="text-[#7A7268] text-lg max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{animationDelay:"0.2s"}}>
          Rain, heat, or hazardous air — Zensure detects adverse conditions and automatically
          sends your income protection payout. No paperwork. No waiting.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up" style={{animationDelay:"0.3s"}}>
          <Link href="/register" className="px-8 py-3.5 bg-[#7B1A2A] hover:bg-[#8F2035] text-white rounded-full font-medium text-sm transition-all duration-300 shadow-xl shadow-[#7B1A2A]/30 hover:shadow-[#7B1A2A]/50 hover:scale-105">
            Start for free →
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-white/5 hover:bg-white/8 border border-white/8 text-[#7A7268] hover:text-[#F0ECE4] rounded-full text-sm transition-all duration-200">
            Sign in to dashboard
          </Link>
        </div>
      </section>

      {/* Triggers */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <p className="text-center text-xs text-[#3A3632] uppercase tracking-widest mb-10 font-medium">Monitored triggers</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "🌧", title: "Heavy Rain", threshold: "> 70 mm / hr", desc: "Rainfall beyond safe delivery thresholds triggers automatic coverage." },
            { icon: "🌡", title: "Extreme Heat", threshold: "> 42 °C", desc: "Working in extreme temperatures qualifies for income protection." },
            { icon: "🌫", title: "Hazardous AQI", threshold: "> 400 AQI", desc: "Dangerous air quality prevents safe outdoor work — you're covered." },
          ].map((card, i) => (
            <div key={card.title} className="group rounded-2xl bg-[#111111] border border-white/5 p-6 hover:border-[#7B1A2A]/30 hover:bg-[#131010] transition-all duration-300" style={{animationDelay:`${i*0.1}s`}}>
              <div className="text-2xl mb-4">{card.icon}</div>
              <div className="text-[#C9A84C] text-xs font-mono mb-2">{card.threshold}</div>
              <div className="font-semibold text-sm mb-2 text-[#F0ECE4]">{card.title}</div>
              <div className="text-xs text-[#7A7268] leading-relaxed">{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="rounded-3xl bg-[#111111] border border-white/5 p-10 md:p-12">
          <p className="text-xs text-[#3A3632] uppercase tracking-widest font-medium mb-10">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { n: "01", title: "Register", desc: "Share your city, daily earnings, and working hours." },
              { n: "02", title: "AI scores you", desc: "Risk model sets your premium and coverage instantly." },
              { n: "03", title: "Track your shift", desc: "App logs your hours and distance in the background." },
              { n: "04", title: "Auto payout", desc: "Adverse conditions trigger analysis and payment in seconds." },
            ].map((s, i) => (
              <div key={s.n}>
                <div className="text-[#C9A84C] text-xs font-mono mb-4">{s.n}</div>
                <div className="font-semibold text-sm text-[#F0ECE4] mb-2">{s.title}</div>
                <div className="text-xs text-[#7A7268] leading-relaxed">{s.desc}</div>
                {i < 3 && <div className="hidden md:block mt-4 text-[#2A2422] text-lg">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-8 pb-28">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "₹0", label: "Claim forms" },
            { value: "< 10s", label: "Payout time" },
            { value: "100%", label: "Rule-based" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl bg-[#111111] border border-white/5 py-8 text-center">
              <div className="font-display text-4xl text-[#C9A84C] mb-2">{stat.value}</div>
              <div className="text-xs text-[#7A7268]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 pb-24 text-center">
        <div className="rounded-3xl bg-gradient-to-b from-[#1A0810] to-[#110508] border border-[#7B1A2A]/20 px-10 py-14">
          <h2 className="font-display text-3xl mb-4">Ready to protect your income?</h2>
          <p className="text-[#7A7268] text-sm mb-8">It takes under two minutes to register and get covered.</p>
          <Link href="/register" className="inline-flex px-10 py-3.5 bg-[#7B1A2A] hover:bg-[#8F2035] text-white rounded-full font-medium text-sm transition-all duration-300 shadow-xl shadow-[#7B1A2A]/40 hover:scale-105">
            Create free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#7B1A2A]/60 flex items-center justify-center">
            <span className="text-[#C9A84C] text-xs font-bold">Z</span>
          </div>
          <span className="text-xs text-[#3A3632]">Zensure</span>
        </div>
        <span className="text-xs text-[#3A3632]">AI-powered income protection</span>
      </footer>
    </div>
  );
}
