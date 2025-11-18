'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TrackingTrip = {
  TripID: number;
  Status: string | null;
  Miles: number | null;
  DriverName: string | null;
  UnitNumber: string | null;
  CustomerName: string | null;
  Origin: string | null;
  Destination: string | null;
  Revenue: number | null;
  LastEventType: string | null;
  LastEventTime: string | null;
};

export default function TrackingPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TrackingTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tracking/active');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load tracking');
      setTrips(data.trips);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrips();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTrips, 30000);
    return () => clearInterval(interval);
  }, []);

  function fmt(num: number | null | undefined, decimals = 0) {
    if (num == null || Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Active Trip Tracking</h1>
        <button
          onClick={loadTrips}
          disabled={loading}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4 text-sm text-slate-400">
        Showing active trips (not completed or cancelled). Auto-refreshes every 30
        seconds.
      </div>

      {loading && trips.length === 0 ? (
        <div>Loading trips…</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">TripID</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Unit</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="px-3 py-2 text-right">Miles</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-left">Last Event</th>
                <th className="px-3 py-2 text-left">Event Time</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={11} className="px-3 py-4 text-center text-slate-400">
                    No active trips
                  </td>
                </tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.TripID} className="border-t border-slate-800">
                    <td className="px-3 py-2">{t.TripID}</td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                          t.Status === 'In Transit'
                            ? 'bg-blue-900/50 text-blue-300'
                            : t.Status === 'Assigned'
                            ? 'bg-purple-900/50 text-purple-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.Status ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-3 py-2">{t.DriverName ?? 'Unassigned'}</td>
                    <td className="px-3 py-2">{t.UnitNumber ?? '—'}</td>
                    <td className="px-3 py-2">{t.CustomerName ?? '—'}</td>
                    <td className="px-3 py-2">
                      {t.Origin && t.Destination
                        ? `${t.Origin} → ${t.Destination}`
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">{fmt(t.Miles)}</td>
                    <td className="px-3 py-2 text-right">${fmt(t.Revenue, 2)}</td>
                    <td className="px-3 py-2">{t.LastEventType ?? '—'}</td>
                    <td className="px-3 py-2">
                      {t.LastEventTime
                        ? new Date(t.LastEventTime).toLocaleString()
                        : '—'}
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
      )}
    </main>
  );
}
