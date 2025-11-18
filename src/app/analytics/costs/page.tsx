'use client';

import { useEffect, useState } from 'react';

type CostAggregate = {
  DriverType?: string;
  CustomerName?: string;
  Trips: number;
  Miles: number;
  Revenue: number;
  Cost: number;
  Profit: number;
  MarginPct: number;
};

export default function CostAnalyticsPage() {
  const [byDriverType, setByDriverType] = useState<CostAggregate[]>([]);
  const [byCustomer, setByCustomer] = useState<CostAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/stats/costing');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load analytics');
      setByDriverType(data.aggregatesByDriverType);
      setByCustomer(data.aggregatesByCustomer);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function fmt(num: number | null | undefined, decimals = 0) {
    if (num == null || Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function getMarginColor(marginPct: number) {
    if (marginPct >= 15) return 'text-emerald-400';
    if (marginPct >= 5) return 'text-yellow-400';
    return 'text-red-400';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Cost Analytics</h1>
        <div>Loading analytics…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-6">Cost Analytics</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* By Driver Type */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Performance by Driver Type</h2>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">Driver Type</th>
                <th className="px-3 py-2 text-right">Trips</th>
                <th className="px-3 py-2 text-right">Miles</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Profit</th>
                <th className="px-3 py-2 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {byDriverType.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={7} className="px-3 py-4 text-center text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                byDriverType.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-medium">{row.DriverType ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{fmt(row.Trips)}</td>
                    <td className="px-3 py-2 text-right">{fmt(row.Miles)}</td>
                    <td className="px-3 py-2 text-right">${fmt(row.Revenue, 0)}</td>
                    <td className="px-3 py-2 text-right">${fmt(row.Cost, 0)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={
                          row.Profit >= 0
                            ? 'text-emerald-400 font-medium'
                            : 'text-red-400 font-medium'
                        }
                      >
                        ${fmt(row.Profit, 0)}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right ${getMarginColor(row.MarginPct)}`}>
                      {fmt(row.MarginPct, 1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Customer */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          Performance by Customer (Top 20)
        </h2>
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-right">Trips</th>
                <th className="px-3 py-2 text-right">Miles</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right">Cost</th>
                <th className="px-3 py-2 text-right">Profit</th>
                <th className="px-3 py-2 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody>
              {byCustomer.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={7} className="px-3 py-4 text-center text-slate-400">
                    No data available
                  </td>
                </tr>
              ) : (
                byCustomer.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-800">
                    <td className="px-3 py-2 font-medium">
                      {row.CustomerName ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(row.Trips)}</td>
                    <td className="px-3 py-2 text-right">{fmt(row.Miles)}</td>
                    <td className="px-3 py-2 text-right">${fmt(row.Revenue, 0)}</td>
                    <td className="px-3 py-2 text-right">${fmt(row.Cost, 0)}</td>
                    <td className="px-3 py-2 text-right">
                      <span
                        className={
                          row.Profit >= 0
                            ? 'text-emerald-400 font-medium'
                            : 'text-red-400 font-medium'
                        }
                      >
                        ${fmt(row.Profit, 0)}
                      </span>
                    </td>
                    <td className={`px-3 py-2 text-right ${getMarginColor(row.MarginPct)}`}>
                      {fmt(row.MarginPct, 1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
