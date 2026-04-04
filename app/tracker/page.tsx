"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, MapPin, Clock, Navigation, Activity, ChevronLeft, CheckCircle2, AlertCircle } from "lucide-react";

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
  const simRef   = useRef<ReturnType<typeof setInterval> | null>(null);

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
        pos => {
          setLastPos(prev => {
            if (prev) {
              setDistance(pd => pd + haversine(prev.latitude, prev.longitude, pos.coords.latitude, pos.coords.longitude));
            }
            return pos.coords;
          });
          setLocationPoints(prev => [...prev, [pos.coords.latitude, pos.coords.longitude]]);
        },
        () => {
          setNotice("GPS unavailable — simulating distance tracking");
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
  const mins  = Math.floor((elapsed % 3600) / 60);
  const secs  = elapsed % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");
  const targetHrs = 8;
  const pct = Math.min((elapsed / (targetHrs * 3600)) * 100, 100);

  // SVG ring
  const R = 80, stroke = 8;
  const circ = 2 * Math.PI * R;
  const dash  = circ - (pct / 100) * circ;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Shield size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">Zensure</span>
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors min-h-[40px] px-3 rounded-lg hover:bg-zinc-800/60">
            <ChevronLeft size={13} /> Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10 relative z-10">
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            {tracking && (
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse-dot" />
                <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping" />
              </div>
            )}
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest">
              {tracking ? "Live Tracking" : "Activity Tracker"}
            </p>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">Track your shift</h1>
          <p className="text-zinc-500 text-xs">Log hours and distance to stay eligible for automatic payouts.</p>
        </div>

        {/* Ring timer */}
        <div className="flex flex-col items-center mb-8 animate-fade-up">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r={R} fill="none" stroke="#27272a" strokeWidth={stroke} />
              <circle cx="90" cy="90" r={R} fill="none"
                stroke={tracking ? "#3b82f6" : "#1d4ed8"}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                className="transition-all duration-1000"
                style={{ filter: tracking ? "drop-shadow(0 0 8px rgba(59,130,246,0.5))" : "none" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-3xl font-extrabold tabular-nums tracking-tight">
                {fmt(hours)}:{fmt(mins)}
              </div>
              <div className="text-zinc-600 text-xs font-mono">{fmt(secs)}s</div>
              <div className="text-xs text-zinc-500 mt-1">{Math.round(pct)}% of {targetHrs}h</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="stat-card border border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mb-2">
              <Navigation size={12} className="text-blue-400" /> Distance
            </div>
            <div className="text-3xl font-extrabold text-blue-400">{distance.toFixed(2)}</div>
            <div className="text-xs text-zinc-600 mt-0.5">km covered</div>
          </div>
          <div className="stat-card border border-zinc-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 mb-2">
              <Clock size={12} className="text-emerald-400" /> Time
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">{(elapsed / 3600).toFixed(2)}</div>
            <div className="text-xs text-zinc-600 mt-0.5">hours active</div>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card border border-zinc-800 p-4 mb-5">
          <div className="flex justify-between text-xs text-zinc-500 mb-2.5">
            <span className="flex items-center gap-1.5"><Activity size={11} />Progress toward {targetHrs}h target</span>
            <span className="font-semibold text-white">{Math.round(pct)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill-blue" style={{width:`${pct}%`}} />
          </div>
        </div>

        {/* Action buttons */}
        {!tracking && !saved && (
          <button onClick={startTracking}
            className="btn-blue w-full text-sm flex items-center justify-center gap-2 py-4 rounded-2xl animate-fade-up">
            <Activity size={16} /> Start shift
          </button>
        )}

        {tracking && (
          <button onClick={stopTracking}
            className="w-full py-4 text-sm font-semibold rounded-2xl border border-blue-500/40 text-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 min-h-[56px]">
            End shift & save
          </button>
        )}

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-5 text-center animate-fade-in">
            <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
            <div className="font-semibold text-emerald-300 mb-1">Shift saved successfully</div>
            <div className="text-xs text-zinc-500 mb-4">
              {(elapsed / 3600).toFixed(2)}h active · {distance.toFixed(2)} km
            </div>
            <Link href="/payout" className="btn-emerald px-6 py-2.5 text-sm inline-flex items-center gap-2">
              Check payout eligibility
            </Link>
          </div>
        )}

        {notice && (
          <div className="mt-4 flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-amber-400 text-xs animate-fade-in">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            {notice}
          </div>
        )}

        {tracking && lastPos && (
          <div className="mt-4 glass-card border border-zinc-800 px-4 py-3 flex items-center gap-2">
            <MapPin size={12} className="text-blue-400 flex-shrink-0" />
            <span className="text-xs text-zinc-600 font-mono">
              {lastPos.latitude.toFixed(4)}, {lastPos.longitude.toFixed(4)} · {locationPoints.length} pts
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371, dLat = ((lat2 - lat1) * Math.PI) / 180, dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
