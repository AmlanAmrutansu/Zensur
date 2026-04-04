"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TrackerPage() {
  const router = useRouter();
  const [tracking, setTracking] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [locationPoints, setLocationPoints] = useState<[number, number][]>([]);
  const [lastPos, setLastPos] = useState<GeolocationCoordinates | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchRef = useRef<number | null>(null);

  const stopTracking = useCallback(async () => {
    setTracking(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);

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
    setStartTime(Date.now());
    setElapsed(0);
    setDistance(0);
    setLocationPoints([]);

    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    if ("geolocation" in navigator) {
      watchRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          setLastPos(prev => {
            if (prev) {
              const d = haversine(prev.latitude, prev.longitude, pos.coords.latitude, pos.coords.longitude);
              setDistance(prevD => prevD + d);
            }
            return pos.coords;
          });
          setLocationPoints(prev => [...prev, [pos.coords.latitude, pos.coords.longitude]]);
        },
        () => setError("Location access denied — distance won't be tracked"),
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    } else {
      setError("Geolocation not available — simulating distance");
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
        setDistance(prev => prev + 0.003);
      }, 1000);
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, []);

  const hours = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const fmt = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[#050A14] text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[#0D2040]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xs">Z</div>
          <span className="font-bold">Zensure</span>
        </Link>
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-white">← Dashboard</Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Activity Tracker</h1>
        <p className="text-gray-500 text-sm mb-10">Track your working hours and distance for payout eligibility</p>

        <div className="bg-[#080F1E] border border-[#0D2040] rounded-2xl p-8 mb-6">
          <div className="text-5xl font-mono font-bold mb-2 tracking-wider">
            {fmt(hours)}:{fmt(mins)}:{fmt(secs)}
          </div>
          <div className="text-gray-500 text-xs mb-6">Hours : Minutes : Seconds</div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0D1526] rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{distance.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">km covered</div>
            </div>
            <div className="bg-[#0D1526] rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">{(elapsed / 3600).toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">hours active</div>
            </div>
          </div>

          {!tracking && !saved && (
            <button
              onClick={startTracking}
              className="w-full bg-green-600 hover:bg-green-500 rounded-xl py-4 font-semibold text-base transition-all hover:scale-105"
            >
              ▶ Start Tracking
            </button>
          )}

          {tracking && (
            <button
              onClick={stopTracking}
              className="w-full bg-red-600 hover:bg-red-500 rounded-xl py-4 font-semibold text-base transition-all"
            >
              ⏹ Stop & Save
            </button>
          )}

          {saved && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
              <div className="text-green-400 font-semibold mb-1">✓ Activity Saved</div>
              <div className="text-xs text-gray-400">{(elapsed / 3600).toFixed(2)}h · {distance.toFixed(2)} km</div>
              <Link href="/payout" className="inline-block mt-3 text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors">Check Payout →</Link>
            </div>
          )}
        </div>

        {error && <div className="text-xs text-yellow-500 bg-yellow-900/20 border border-yellow-800/30 rounded-lg px-3 py-2 mb-4">{error}</div>}

        {tracking && lastPos && (
          <div className="bg-[#080F1E] border border-[#0D2040] rounded-xl p-4 text-xs text-gray-500">
            <div>GPS: {lastPos.latitude.toFixed(4)}, {lastPos.longitude.toFixed(4)}</div>
            <div className="mt-1">{locationPoints.length} location points recorded</div>
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
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
