import { NextRequest, NextResponse } from "next/server";
import { fetchWeather, fetchAqi } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") ?? "Mumbai";
  const [weather, aqi] = await Promise.all([fetchWeather(city), fetchAqi(city)]);
  return NextResponse.json({ weather, aqi });
}
