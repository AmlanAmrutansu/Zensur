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
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");
  const pct = Math.min((elapsed / (8 * 3600)) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0ECE4]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#C9A84C] flex items-center justify-center">
            <span className="text-[#C9A84C] font-serif text-xs">Z</span>
          </div>
          <span className="font-serif text-sm tracking-wide">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-[#7A7268] hover:text-[#F0ECE4] transition-colors" style={{fontFamily:"system-ui,sans-serif"}}>
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-14">
        <div className="text-[#C9A84C] text-xs tracking-widest uppercase mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Activity tracker</div>
        <h1 className="font-serif text-3xl mb-2">Track your shift</h1>
        <p className="text-[#7A7268] text-xs mb-10 leading-relaxed" style={{fontFamily:"system-ui,sans-serif"}}>
          Your logged hours and distance are used to verify payout eligibility. Start tracking at the beginning of your shift.
        </p>

        {/* Timer display */}
        <div className="border border-[#1F1F1F] p-8 mb-6 text-center">
          <div className="font-serif text-6xl tracking-widest mb-1 text-[#F0ECE4]">
            {fmt(hours)}:{fmt(mins)}:{fmt(secs)}
          </div>
          <div className="text-[#3E3A36] text-xs mb-8" style={{fontFamily:"system-ui,sans-serif"}}>hrs · min · sec</div>

          {/* Progress bar */}
          <div className="h-px bg-[#1F1F1F] mb-6 relative">
            <div className="h-px bg-[#C9A84C] absolute top-0 left-0 transition-all duration-1000" style={{width: `${pct}%`}}></div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#1F1F1F] mb-8">
            <div className="bg-[#0A0A0A] py-5">
              <div className="font-serif text-3xl text-[#C9A84C]">{distance.toFixed(2)}</div>
              <div className="text-[#3E3A36] text-xs mt-1" style={{fontFamily:"system-ui,sans-serif"}}>km covered</div>
            </div>
            <div className="bg-[#0A0A0A] py-5">
              <div className="font-serif text-3xl">{(elapsed / 3600).toFixed(2)}</div>
              <div className="text-[#3E3A36] text-xs mt-1" style={{fontFamily:"system-ui,sans-serif"}}>hours active</div>
            </div>
          </div>

          {!tracking && !saved && (
            <button onClick={startTracking}
              className="w-full bg-[#7B1A2A] hover:bg-[#8F2035] text-[#F0ECE4] py-4 text-sm font-medium transition-colors" style={{fontFamily:"system-ui,sans-serif"}}>
              Start shift
            </button>
          )}

          {tracking && (
            <button onClick={stopTracking}
              className="w-full border border-[#7B1A2A] text-[#C9A84C] hover:bg-[#1F0C10] py-4 text-sm font-medium transition-colors" style={{fontFamily:"system-ui,sans-serif"}}>
              End shift & save
            </button>
          )}
        </div>

        {saved && (
          <div className="border border-[#2D5E30] bg-[#0A1A0B] p-5">
            <div className="text-[#7DC47D] text-sm font-medium mb-1" style={{fontFamily:"system-ui,sans-serif"}}>Shift saved</div>
            <div className="text-[#7A7268] text-xs mb-4" style={{fontFamily:"system-ui,sans-serif"}}>
              {(elapsed / 3600).toFixed(2)}h active · {distance.toFixed(2)} km covered
            </div>
            <Link href="/payout" className="text-xs text-[#C9A84C] hover:underline" style={{fontFamily:"system-ui,sans-serif"}}>
              Check payout eligibility →
            </Link>
          </div>
        )}

        {notice && (
          <div className="mt-4 border border-[#2D2008] bg-[#1A1408] text-[#C9A84C] text-xs px-4 py-3" style={{fontFamily:"system-ui,sans-serif"}}>
            {notice}
          </div>
        )}

        {tracking && lastPos && (
          <div className="mt-4 text-xs text-[#3E3A36]" style={{fontFamily:"system-ui,sans-serif"}}>
            GPS lock · {lastPos.latitude.toFixed(4)}, {lastPos.longitude.toFixed(4)} · {locationPoints.length} points
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
