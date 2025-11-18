'use client';

import { useEffect, useState } from 'react';

type DashboardMetrics = {
  totalTrips: number;
  tripsWithCost: number;
  totalMiles: number;
  totalRequiredRev: number;
  totalMinRev: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  rpm: number;
  cpm: number;
  marginPct: number;
  profitableTrips: number;
  atRiskTrips: number;
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMetrics() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load dashboard');
      setMetrics(data.metrics);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
  }, []);

  function fmt(num: number | null | undefined, decimals = 0) {
    if (num == null || Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Fleet Costing Dashboard</h1>
        <div>Loading dashboard…</div>
      </main>
    );
  }

  if (error || !metrics) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Fleet Costing Dashboard</h1>
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error ?? 'Failed to load metrics'}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Fleet Costing Dashboard</h1>

      {/* KPI cards - Row 1 */}
      <div className="grid gap-4 md:grid-cols-4 mb-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Total Trips (with miles)
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {fmt(metrics.totalTrips)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {fmt(metrics.tripsWithCost)} priced
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Total Miles
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {fmt(metrics.totalMiles)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Required Revenue
          </div>
          <div className="mt-2 text-2xl font-semibold">
            ${fmt(metrics.totalRequiredRev, 0)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Min rev: ${fmt(metrics.totalMinRev, 0)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Profit
          </div>
          <div className="mt-2 text-2xl font-semibold">
            ${fmt(metrics.totalProfit, 0)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Revenue ${fmt(metrics.totalRevenue, 0)} · Cost $
            {fmt(metrics.totalCost, 0)}
            <br />
            Margin {fmt(metrics.marginPct, 1)}%
          </div>
        </div>
      </div>

      {/* KPI cards - Row 2 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Revenue per Mile (RPM)
          </div>
          <div className="mt-2 text-2xl font-semibold">
            ${fmt(metrics.rpm, 2)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Cost per Mile (CPM)
          </div>
          <div className="mt-2 text-2xl font-semibold">
            ${fmt(metrics.cpm, 2)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Profitable Trips
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-400">
            {fmt(metrics.profitableTrips)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {metrics.tripsWithCost > 0
              ? fmt((metrics.profitableTrips / metrics.tripsWithCost) * 100, 1)
              : '0'}% of priced trips
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            At-Risk Trips
          </div>
          <div className="mt-2 text-2xl font-semibold text-red-400">
            {fmt(metrics.atRiskTrips)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {metrics.tripsWithCost > 0
              ? fmt((metrics.atRiskTrips / metrics.tripsWithCost) * 100, 1)
              : '0'}% of priced trips
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-400">
        This dashboard summarizes all trips with non-null miles and the latest
        costing per trip from SQL Server.
      </div>
    </main>
  );
}
