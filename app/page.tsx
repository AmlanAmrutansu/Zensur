"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me").then(r => {
      if (r.ok) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4] overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-sm font-bold">Z</span>
          </div>
          <span className="font-serif text-base tracking-wide">Zensure</span>
        </div>
        <div className="flex items-center gap-6" style={{fontFamily:"system-ui,sans-serif"}}>
          <Link href="/login" className="text-sm text-[#7A7268] hover:text-[#F0ECE4] transition-colors">Sign in</Link>
          <Link href="/register" className="text-sm bg-[#7B1A2A] hover:bg-[#8F2035] text-[#F0ECE4] px-4 py-2 transition-colors">
            Get Protected
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-8 pt-24 pb-20">
        <div className="mb-5">
          <span className="text-[#C9A84C] text-xs tracking-[0.2em] uppercase" style={{fontFamily:"system-ui,sans-serif"}}>
            Income Protection for Delivery Workers
          </span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.05] mb-8 max-w-3xl">
          Your income,<br/>
          <em className="text-[#C9A84C] not-italic">protected</em> against<br/>
          what you can&apos;t control.
        </h1>

        <p className="text-[#7A7268] text-lg max-w-xl mb-12 leading-relaxed" style={{fontFamily:"system-ui,sans-serif"}}>
          Rain. Heat. Pollution. When adverse conditions cut your earnings,
          Zensure detects the event and sends your payout automatically —
          no forms, no follow-ups.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#7B1A2A] hover:bg-[#8F2035] text-[#F0ECE4] px-7 py-3.5 text-sm font-medium transition-all" style={{fontFamily:"system-ui,sans-serif"}}>
            Start for free
            <span className="text-[#C9A84C]">→</span>
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 border border-[#1F1F1F] hover:border-[#2D1418] text-[#7A7268] hover:text-[#F0ECE4] px-7 py-3.5 text-sm transition-all" style={{fontFamily:"system-ui,sans-serif"}}>
            Sign in to dashboard
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-20">
          <div className="h-px flex-1 bg-[#1F1F1F]"></div>
          <span className="text-[#3E3A36] text-xs tracking-widest uppercase" style={{fontFamily:"system-ui,sans-serif"}}>How it works</span>
          <div className="h-px flex-1 bg-[#1F1F1F]"></div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 mb-20 border border-[#1F1F1F]">
          {[
            { n: "I", title: "Register", desc: "Share your city, daily earnings, and working hours." },
            { n: "II", title: "AI Scores You", desc: "Risk model calculates your premium and coverage automatically." },
            { n: "III", title: "Track Daily", desc: "App monitors your hours and distance in the background." },
            { n: "IV", title: "Auto Payout", desc: "Adverse conditions trigger analysis and payment within seconds." },
          ].map((item, i) => (
            <div key={item.n} className={`p-7 ${i < 3 ? "border-r border-[#1F1F1F]" : ""}`}>
              <div className="text-[#C9A84C] font-serif text-2xl mb-5">{item.n}</div>
              <div className="text-sm font-medium mb-2" style={{fontFamily:"system-ui,sans-serif"}}>{item.title}</div>
              <div className="text-xs text-[#7A7268] leading-relaxed" style={{fontFamily:"system-ui,sans-serif"}}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Triggers */}
        <div className="mb-20">
          <div className="text-[#7A7268] text-xs tracking-widest uppercase mb-8" style={{fontFamily:"system-ui,sans-serif"}}>Monitored conditions</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1F1F1F]">
            {[
              { label: "Rainfall", threshold: "> 70 mm/hr", note: "Heavy rain triggers income protection" },
              { label: "Temperature", threshold: "> 42°C", note: "Extreme heat makes outdoor work unsafe" },
              { label: "Air Quality", threshold: "AQI > 400", note: "Hazardous AQI prevents safe delivery" },
            ].map(t => (
              <div key={t.label} className="bg-[#0A0A0A] p-7">
                <div className="text-[#C9A84C] text-xs tracking-widest uppercase mb-3" style={{fontFamily:"system-ui,sans-serif"}}>{t.label}</div>
                <div className="font-serif text-2xl text-[#F0ECE4] mb-3">{t.threshold}</div>
                <div className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>{t.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-0 border-t border-b border-[#1F1F1F] py-10 mb-16">
          {[
            { value: "₹0", sub: "Claim paperwork" },
            { value: "< 10s", sub: "Payout calculation time" },
            { value: "100%", sub: "Rule-based decisions" },
          ].map((s, i) => (
            <div key={s.sub} className={`text-center ${i < 2 ? "border-r border-[#1F1F1F]" : ""}`}>
              <div className="font-serif text-4xl text-[#C9A84C] mb-1">{s.value}</div>
              <div className="text-xs text-[#7A7268]" style={{fontFamily:"system-ui,sans-serif"}}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/register" className="inline-flex items-center gap-2 bg-[#7B1A2A] hover:bg-[#8F2035] text-[#F0ECE4] px-10 py-4 text-sm font-medium transition-all" style={{fontFamily:"system-ui,sans-serif"}}>
            Create free account
            <span className="text-[#C9A84C]">→</span>
          </Link>
          <div className="mt-4 text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>No credit card required to get started</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border border-[#2D1418] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs">Z</span>
          </div>
          <span className="text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>Zensure</span>
        </div>
        <div className="text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>
          AI-powered parametric insurance for gig workers
        </div>
      </footer>
    </div>
  );
}
