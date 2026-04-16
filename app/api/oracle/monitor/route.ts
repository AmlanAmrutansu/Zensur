import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getWeatherData, getAQIData } from '@/lib/weather';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // 1. Fetch active policies
    const { data: policies, error } = await supabase
      .from('policies')
      .select('*, user_id(city, current_lat, current_lng)')
      .eq('status', 'active');

    if (error) throw error;

    const summary = [];

    for (const policy of policies) {
      const weather = await getWeatherData(policy.user_id.city);
      const aqi = await getAQIData(policy.user_id.city);

      // Parametric Trigger Check
      if (weather.temp > 42 || weather.rain > 70 || aqi.aqi > 400) {
        // Insert Payout for AI Audit
        await supabase.from('payouts').insert({
          policy_id: policy.id,
          amount: policy.coverage_amount,
          status: 'pending_audit',
          trigger_data: { temp: weather.temp, rain: weather.rain, aqi: aqi.aqi }
        });
        summary.push({ id: policy.id, result: 'Triggered' });
      }
    }

    return NextResponse.json({ success: true, processed: summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}