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

  // new optional fields from Orders & Customers
  TripStatus?: string | null;
  Origin?: string | null;
  Destination?: string | null;
  OrderRevenue?: number | null;
  CustomerName?: string | null;
};

export default function TripsPage() {
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTripId, setBusyTripId] = useState<number | null>(null);

  async function loadTrips() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load trips');
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

  async function recalcTrip(tripId: number) {
    try {
      setBusyTripId(tripId);
      const res = await fetch('/api/trip-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId, isManual: false }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to recalc');
      await loadTrips();
    } catch (e: any) {
      alert(e.message || 'Error recalculating cost');
    } finally {
      setBusyTripId(null);
    }
  }

  async function manualOverride(tripId: number) {
    const input = window.prompt('Enter manual total cost for this trip (e.g. 500):');
    if (!input) return;

    const value = Number(input);
    if (!Number.isFinite(value)) {
      alert('Please enter a valid number.');
      return;
    }

    const reason = window.prompt('Reason for manual override?') ?? 'Manual override';

    try {
      setBusyTripId(tripId);
      const res = await fetch('/api/trip-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          isManual: true,
          manualTotalCost: value,
          manualReason: reason,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to override');
      await loadTrips();
    } catch (e: any) {
      alert(e.message || 'Error applying manual override');
    } finally {
      setBusyTripId(null);
    }
  }

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

    {/* NEW */}
    <th className="px-3 py-2 text-left">Origin → Destination</th>
    <th className="px-3 py-2 text-left">Customer</th>
    <th className="px-3 py-2 text-right">Order Rev</th>

    <th className="px-3 py-2 text-right">Miles</th>
    <th className="px-3 py-2 text-right">Req. Rev</th>
    <th className="px-3 py-2 text-right">Total Cost</th>
    <th className="px-3 py-2 text-right">Profit</th>
    <th className="px-3 py-2 text-center">Manual?</th>
    <th className="px-3 py-2 text-left">Reason</th>
    <th className="px-3 py-2 text-center">Actions</th>
  </tr>
</thead>

            <tbody>
              {trips.map((t) => (
                <tr key={t.TripID} className="border-t border-slate-800">
                  <td className="px-3 py-2">{t.TripID}</td>
                  <td className="px-3 py-2">{t.DriverName}</td>
                  <td className="px-3 py-2">{t.UnitNumber}</td>
                  <td className="px-3 py-2">
  {t.Origin && t.Destination ? `${t.Origin} → ${t.Destination}` : ''}
</td>
<td className="px-3 py-2">{t.CustomerName ?? ''}</td>
<td className="px-3 py-2 text-right">
  {t.OrderRevenue != null ? t.OrderRevenue.toFixed(2) : ''}
</td>

                  <td className="px-3 py-2 text-right">{t.Miles ?? ''}</td>
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
                  <td className="px-3 py-2">{t.ManualReason ?? ''}</td>
                  <td className="px-3 py-2 text-center space-x-2">
                    <button
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs"
                      disabled={busyTripId === t.TripID}
                      onClick={() => recalcTrip(t.TripID)}
                    >
                      {busyTripId === t.TripID ? 'Working…' : 'Recalc'}
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-xs"
                      disabled={busyTripId === t.TripID}
                      onClick={() => manualOverride(t.TripID)}
                    >
                      Manual
                    </button>
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
