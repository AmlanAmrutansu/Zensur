import React from 'react';
import { ShieldAlert, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-400 mb-8 flex items-center gap-2">
          <ShieldAlert /> Zensure System Oversight
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Risk Exposure" value="₹8,42,000" icon={<Activity />} />
          <StatCard title="AI Approval Rate" value="94.2%" icon={<TrendingUp />} />
          <StatCard title="System Health" value="Operational" color="text-green-400" />
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Live AI Auditor Logs</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="p-3 bg-slate-900 rounded border-l-4 border-yellow-500">
              [SYSTEM] Payout ID #829 flagged: Proximity deviation detected (22km from storm center).
            </div>
            <div className="p-3 bg-slate-900 rounded border-l-4 border-green-500">
              [SYSTEM] Payout ID #830 cleared: Parametric thresholds confirmed via WAQI Oracle.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-white" }: any) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}