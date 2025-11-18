'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TripReport = {
  TripID: number;
  WeekStart: string | null;
  Status: string | null;
  Miles: number | null;
  DriverName: string | null;
  DriverType: string | null;
  UnitNumber: string | null;
  CustomerName: string | null;
  Origin: string | null;
  Destination: string | null;
  Revenue: number;
  TotalCost: number;
  Profit: number;
  TotalCPM: number;
  MarginPct: number | null;
};

export default function TripReportsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/reports/trips');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load reports');
      setTrips(data.trips);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
  }, []);

  function fmt(num: number | null | undefined, decimals = 0) {
    if (num == null || Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function getMarginColor(marginPct: number | null) {
    if (marginPct == null) return '';
    if (marginPct >= 15) return 'text-emerald-400';
    if (marginPct >= 5) return 'text-yellow-400';
    return 'text-red-400';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Trip Reports</h1>
        <div>Loading reports…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Trip Reports</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-slate-400">
        Showing the latest 200 trips with full costing details.
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-3 py-2 text-left">TripID</th>
              <th className="px-3 py-2 text-left">Week</th>
              <th className="px-3 py-2 text-left">Driver</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Unit</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-right">Miles</th>
              <th className="px-3 py-2 text-right">Revenue</th>
              <th className="px-3 py-2 text-right">Cost</th>
              <th className="px-3 py-2 text-right">Profit</th>
              <th className="px-3 py-2 text-right">Margin %</th>
              <th className="px-3 py-2 text-right">CPM</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.length === 0 ? (
              <tr className="border-t border-slate-800">
                <td colSpan={15} className="px-3 py-4 text-center text-slate-400">
                  No trips found
                </td>
              </tr>
            ) : (
              trips.map((t) => (
                <tr key={t.TripID} className="border-t border-slate-800 hover:bg-slate-900/50">
                  <td className="px-3 py-2">{t.TripID}</td>
                  <td className="px-3 py-2">
                    {t.WeekStart
                      ? new Date(t.WeekStart).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2">{t.DriverName ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">{t.DriverType ?? '—'}</td>
                  <td className="px-3 py-2">{t.UnitNumber ?? '—'}</td>
                  <td className="px-3 py-2">{t.CustomerName ?? '—'}</td>
                  <td className="px-3 py-2 text-xs">
                    {t.Origin && t.Destination
                      ? `${t.Origin} → ${t.Destination}`
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">{fmt(t.Miles)}</td>
                  <td className="px-3 py-2 text-right">${fmt(t.Revenue, 0)}</td>
                  <td className="px-3 py-2 text-right">${fmt(t.TotalCost, 0)}</td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className={
                        t.Profit >= 0
                          ? 'text-emerald-400 font-medium'
                          : 'text-red-400 font-medium'
                      }
                    >
                      ${fmt(t.Profit, 0)}
                    </span>
                  </td>
                  <td className={`px-3 py-2 text-right ${getMarginColor(t.MarginPct)}`}>
                    {t.MarginPct !== null ? `${fmt(t.MarginPct, 1)}%` : '—'}
                  </td>
                  <td className="px-3 py-2 text-right">${fmt(t.TotalCPM, 2)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                        t.Status === 'Completed'
                          ? 'bg-emerald-900/50 text-emerald-300'
                          : t.Status === 'In Transit'
                          ? 'bg-blue-900/50 text-blue-300'
                          : t.Status === 'Assigned'
                          ? 'bg-purple-900/50 text-purple-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.Status ?? 'Unknown'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => router.push(`/trips/${t.TripID}`)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
