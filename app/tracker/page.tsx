"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackerPage() {
  const router = useRouter();
  const [tracking, setTracking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [locationPoints, setLocationPoints] = useState<[number, number][]>([]);
  const [lastPos, setLastPos] = useState<GeolocationCoordinates | null>(null);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef = useRef<number | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTracking = useCallback(async () => {
    setTracking(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    if (simRef.current) clearInterval(simRef.current);

    const active_hours = elapsed / 3600;
    const variance = locationPoints.length > 2
      ? locationPoints.reduce((acc, pt, i) => {
          if (i === 0) return acc;
          const prev = locationPoints[i - 1];
          return acc + Math.abs(pt[0] - prev[0]) + Math.abs(pt[1] - prev[1]);
        }, 0) / locationPoints.length
      : 0;

    const res = await fetch("/api/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active_hours: Math.round(active_hours * 100) / 100,
        distance: Math.round(distance * 100) / 100,
        location_points: locationPoints.slice(-50),
        location_variance: variance,
      }),
    });

    if (res.status === 401) { router.push("/login"); return; }
    if (res.ok) setSaved(true);
  }, [elapsed, distance, locationPoints, router]);

  function startTracking() {
    setTracking(true);
    setSaved(false);
    setElapsed(0);
    setDistance(0);
    setLocationPoints([]);
    setNotice("");

    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);

    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLastPos(prev => {
            if (prev) {
              const d = haversine(prev.latitude, prev.longitude, pos.coords.latitude, pos.coords.longitude);
              setDistance(pd => pd + d);
            }
            return pos.coords;
          });
          setLocationPoints(prev => [...prev, [pos.coords.latitude, pos.coords.longitude]]);
        },
        () => {
          setNotice("GPS unavailable — simulating distance");
          simRef.current = setInterval(() => setDistance(p => p + 0.003), 1000);
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    } else {
      setNotice("Geolocation not supported — simulating distance");
      simRef.current = setInterval(() => setDistance(p => p + 0.003), 1000);
    }
  }

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    if (simRef.current) clearInterval(simRef.current);
  }, []);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");
  const targetHours = 8;
  const pct = Math.min((elapsed / (targetHours * 3600)) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (pct / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-[#7B1A2A] opacity-[0.05] blur-[100px] pointer-events-none" />

      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7B1A2A] to-[#4A0F18] flex items-center justify-center">
            <span className="text-[#C9A84C] font-bold text-xs">Z</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all duration-200">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-xs text-[#C9A84C] font-medium tracking-widest uppercase mb-2">Activity tracker</div>
          <h1 className="font-display text-3xl mb-2">Track your shift</h1>
          <p className="text-[#7A7268] text-xs leading-relaxed max-w-xs mx-auto">
            Log your hours and distance to stay eligible for automatic payouts.
          </p>
        </div>

        {/* Circular timer */}
        <div className="flex justify-center mb-8">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1A1A1A" strokeWidth="6" />
              <circle cx="60" cy="60" r="54" fill="none"
                stroke={tracking ? "#7B1A2A" : "#2A1218"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-2xl font-semibold tabular-nums text-[#F0ECE4]">
                {fmt(hours)}:{fmt(mins)}
              </div>
              <div className="text-[#3A3632] text-xs font-mono">{fmt(secs)}s</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-[#111111] rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-3xl text-[#C9A84C] mb-1">{distance.toFixed(2)}</div>
            <div className="text-xs text-[#3A3632]">km covered</div>
          </div>
          <div className="bg-[#111111] rounded-2xl border border-white/5 p-5 text-center">
            <div className="font-display text-3xl mb-1">{(elapsed / 3600).toFixed(2)}</div>
            <div className="text-xs text-[#3A3632]">hours active</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[#3A3632] mb-2">
            <span>Progress toward {targetHours}h target</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="h-1.5 bg-[#111111] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7B1A2A] to-[#C9A84C] rounded-full transition-all duration-1000"
              style={{width: `${pct}%`}} />
          </div>
        </div>

        {/* Buttons */}
        {!tracking && !saved && (
          <button onClick={startTracking}
            className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] text-white rounded-2xl py-4 text-sm font-semibold transition-all duration-300 shadow-xl shadow-[#7B1A2A]/30 hover:shadow-[#7B1A2A]/50 hover:scale-[1.02] animate-fade-up">
            Start shift
          </button>
        )}

        {tracking && (
          <button onClick={stopTracking}
            className="w-full border border-[#7B1A2A]/50 hover:border-[#7B1A2A] bg-[#7B1A2A]/10 hover:bg-[#7B1A2A]/20 text-[#C9A84C] rounded-2xl py-4 text-sm font-semibold transition-all duration-200">
            End shift & save
          </button>
        )}

        {saved && (
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-5 text-center animate-fade-up">
            <div className="text-emerald-400 font-semibold mb-1 text-sm">Shift saved ✓</div>
            <div className="text-[#7A7268] text-xs mb-4">
              {(elapsed / 3600).toFixed(2)}h active · {distance.toFixed(2)} km
            </div>
            <Link href="/payout" className="inline-flex text-xs bg-[#7B1A2A] hover:bg-[#8F2035] text-white px-5 py-2 rounded-full transition-all duration-200">
              Check payout eligibility →
            </Link>
          </div>
        )}

        {notice && (
          <div className="mt-4 bg-[#C9A84C]/8 border border-[#C9A84C]/20 rounded-xl px-4 py-3 text-xs text-[#C9A84C]">
            {notice}
          </div>
        )}

        {tracking && lastPos && (
          <div className="mt-4 bg-[#111111] rounded-xl px-4 py-3 text-xs text-[#3A3632] text-center">
            GPS · {lastPos.latitude.toFixed(4)}, {lastPos.longitude.toFixed(4)} · {locationPoints.length} pts
          </div>
        )}
      </div>
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
