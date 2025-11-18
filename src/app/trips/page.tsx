'use client';

import { useEffect, useState } from 'react';

type TripRow = {
  TripID: number;
  DriverName: string | null;
  DriverType: string | null;
  UnitNumber: string | null;
  Miles: number | null;
  MinimumRevenue: number | null;
  RequiredRevenue: number | null;
  TotalCost: number | null;
  Profit: number | null;
  IsManual: boolean | null;
  ManualTotalCost: number | null;
  ManualReason: string | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (!data.ok) {
        throw new Error(data.error || 'Failed to load trips');
      }
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Trips &amp; Costing</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading trips…</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">TripID</th>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Unit</th>
                <th className="px-3 py-2 text-right">Miles</th>
                <th className="px-3 py-2 text-right">Req. Rev</th>
                <th className="px-3 py-2 text-right">Total Cost</th>
                <th className="px-3 py-2 text-right">Profit</th>
                <th className="px-3 py-2 text-center">Manual?</th>
                <th className="px-3 py-2 text-left">Manual reason</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.TripID} className="border-t border-slate-800">
                  <td className="px-3 py-2">{t.TripID}</td>
                  <td className="px-3 py-2">{t.DriverName}</td>
                  <td className="px-3 py-2">{t.UnitNumber}</td>
                  <td className="px-3 py-2 text-right">
                    {t.Miles ?? ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {t.RequiredRevenue?.toFixed?.(2) ?? ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {t.TotalCost?.toFixed?.(2) ?? ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {t.Profit?.toFixed?.(2) ?? ''}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {t.IsManual ? 'Yes' : ''}
                  </td>
                  <td className="px-3 py-2">
                    {t.ManualReason ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
