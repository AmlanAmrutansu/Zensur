const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AQI_API_KEY = process.env.AQI_API_KEY;

export interface WeatherData {
  rainfall: number;
  temperature: number;
  humidity: number;
  description: string;
  city: string;
}

export interface AqiData {
  aqi: number;
  city: string;
  dominant_pollutant?: string;
}

export async function fetchWeather(city: string): Promise<WeatherData> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);

    const data = await res.json();
    const rainfall = data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0;

    return {
      rainfall: Math.round(rainfall * 10),
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      description: data.weather?.[0]?.description ?? "clear",
      city: data.name,
    };
  } catch {
    return { rainfall: 0, temperature: 28, humidity: 60, description: "clear", city };
  }
}

export async function fetchAqi(city: string): Promise<AqiData> {
  try {
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${AQI_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 600 } });

    if (!res.ok) throw new Error(`AQI API error: ${res.status}`);

    const data = await res.json();
    if (data.status !== "ok") throw new Error("AQI API returned non-ok status");

    return {
      aqi: data.data.aqi ?? 50,
      city: data.data.city?.name ?? city,
      dominant_pollutant: data.data.dominentpol,
    };
  } catch {
    return { aqi: 50, city };
  }
}

export function getWeatherSeverity(rainfall: number, temperature: number, aqi: number): number {
  let severity = 0;
  if (rainfall > 70) severity += 0.5;
  else if (rainfall > 30) severity += 0.25;

  if (temperature > 42) severity += 0.4;
  else if (temperature > 38) severity += 0.2;

  if (aqi > 400) severity += 0.4;
  else if (aqi > 200) severity += 0.2;

  return Math.min(severity, 1);
}
