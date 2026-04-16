import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
// Updated imports to match your weather.ts function names
import { fetchWeather, fetchAqi } from '@/lib/weather';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*, user_id(city)')
      .eq('status', 'active');

    if (error) throw error;

    const summary = [];

    for (const policy of policies) {
      // Use the correct function names: fetchWeather and fetchAqi
      const weather = await fetchWeather(policy.user_id.city);
      const aqiData = await fetchAqi(policy.user_id.city);

      // Match the property names from your weather.ts (rainfall, temperature, aqi)
      if (weather.temperature > 42 || weather.rainfall > 70 || aqiData.aqi > 400) {
        await supabase.from('payouts').insert({
          policy_id: policy.id,
          amount: policy.coverage_amount,
          status: 'pending_audit',
          trigger_data: { 
            temp: weather.temperature, 
            rain: weather.rainfall, 
            aqi: aqiData.aqi 
          }
        });
        summary.push({ id: policy.id, result: 'Triggered' });
      }
    }

    return NextResponse.json({ success: true, processed: summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}