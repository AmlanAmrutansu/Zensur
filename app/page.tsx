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
    <div className="min-h-screen bg-[#050A14] text-white overflow-hidden">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#0D2040]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">Z</div>
          <span className="font-bold text-lg">Zensure</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">Sign in</Link>
          <Link href="/register" className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">Get Protected</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700/40 text-blue-300 text-xs px-3 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
          AI-Powered · Zero-Touch · Automatic Payouts
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Income Protection That{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Pays Itself
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Zensure monitors rain, heat, and pollution in real time. When conditions hurt your earnings,
          we automatically calculate your loss and send payout — no forms, no waiting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/register" className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-base transition-all hover:scale-105">
            Start Free — Get Covered
          </Link>
          <Link href="/login" className="px-8 py-3.5 bg-[#0D1E35] hover:bg-[#112244] border border-[#1E3A5F] rounded-xl font-medium text-base transition-colors">
            Sign in to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {[
            { icon: "🌧", title: "Rain Protection", desc: "Automatic detection of heavy rainfall impacting deliveries" },
            { icon: "🌡", title: "Heat Alerts", desc: "Coverage activates when temperature exceeds safe working limits" },
            { icon: "🌫", title: "AQI Shield", desc: "Hazardous air quality triggers instant income protection" },
          ].map(card => (
            <div key={card.title} className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-6 text-left hover:border-blue-700/50 transition-colors">
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-base mb-2">{card.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register & Profile", desc: "Share your city, earnings, and working hours" },
              { step: "02", title: "AI Risk Score", desc: "Our model calculates your risk and sets your premium" },
              { step: "03", title: "Subscribe Weekly", desc: "Pay a small weekly premium via Razorpay" },
              { step: "04", title: "Auto Payout", desc: "When conditions are adverse, payout is triggered automatically" },
            ].map(item => (
              <div key={item.step} className="text-left">
                <div className="text-blue-500 font-mono text-xs mb-2">{item.step}</div>
                <div className="font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          {[
            { value: "₹0", label: "Claim Forms" },
            { value: "<10s", label: "Payout Time" },
            { value: "3", label: "Triggers Monitored" },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-400 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
