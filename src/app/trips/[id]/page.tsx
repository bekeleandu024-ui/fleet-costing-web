'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type TripDetail = {
  TripID: number;
  RawTripId: string | null;
  WeekStart: string | null;
  Miles: number | null;
  Status: string | null;
  MinimumRevenue: number | null;
  RequiredRevenue: number | null;
  DriverName: string | null;
  DriverType: string | null;
  UnitNumber: string | null;
  CustomerName: string | null;
  Origin: string | null;
  Destination: string | null;
  TotalCPM: number | null;
  TotalCost: number | null;
  CostRevenue: number | null;
  Profit: number | null;
  IsManual: boolean | null;
};

type TripEvent = {
  TripEventID: number;
  EventType: string;
  EventTime: string;
  City: string | null;
  State: string | null;
  Note: string | null;
};

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [tripRes, eventsRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/events`),
      ]);

      const tripData = await tripRes.json();
      const eventsData = await eventsRes.json();

      if (!tripData.ok) throw new Error(tripData.error || 'Failed to load trip');
      if (!eventsData.ok) throw new Error(eventsData.error || 'Failed to load events');

      setTrip(tripData.trip);
      setEvents(eventsData.events);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tripId) loadData();
  }, [tripId]);

  async function createEvent(eventType: string, shouldComplete = false) {
    try {
      setActionLoading(true);
      setError(null);

      const res = await fetch(`/api/trips/${tripId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to create event');

      if (shouldComplete) {
        const statusRes = await fetch(`/api/trips/${tripId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Completed' }),
        });
        const statusData = await statusRes.json();
        if (!statusData.ok) throw new Error(statusData.error || 'Failed to update status');
      }

      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error creating event');
    } finally {
      setActionLoading(false);
    }
  }

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
        <h1 className="text-2xl font-semibold mb-4">Trip Detail</h1>
        <div>Loading trip…</div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Trip Detail</h1>
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error ?? 'Trip not found'}
        </div>
        <button
          onClick={() => router.push('/trips')}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"
        >
          ← Back to Trips
        </button>
      </main>
    );
  }

  const marginPct =
    trip.CostRevenue && trip.CostRevenue > 0
      ? ((trip.Profit ?? 0) / trip.CostRevenue) * 100
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trip Detail: #{trip.TripID}</h1>
        <button
          onClick={() => router.push('/trips')}
          className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"
        >
          ← Back to Trips
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Trip Header Card */}
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-lg font-semibold mb-4">Trip Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-medium">{trip.Status ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Driver:</span>
                <span>{trip.DriverName ?? 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unit:</span>
                <span>{trip.UnitNumber ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Miles:</span>
                <span>{fmt(trip.Miles)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span>{trip.CustomerName ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Route:</span>
                <span>
                  {trip.Origin && trip.Destination
                    ? `${trip.Origin} → ${trip.Destination}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Costing</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Revenue:</span>
                <span className="font-medium">${fmt(trip.CostRevenue, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Cost:</span>
                <span>${fmt(trip.TotalCost, 2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit:</span>
                <span
                  className={
                    (trip.Profit ?? 0) >= 0
                      ? 'text-emerald-400 font-medium'
                      : 'text-red-400 font-medium'
                  }
                >
                  ${fmt(trip.Profit, 2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margin:</span>
                <span
                  className={
                    marginPct >= 15
                      ? 'text-emerald-400'
                      : marginPct >= 5
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }
                >
                  {fmt(marginPct, 1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPM:</span>
                <span>${fmt(trip.TotalCPM, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Trip Events</h2>

        {/* Action Buttons */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => createEvent('Arrived Pickup')}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium disabled:opacity-60"
          >
            Arrived Pickup
          </button>
          <button
            onClick={() => createEvent('Departed Pickup')}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-60"
          >
            Departed Pickup
          </button>
          <button
            onClick={() => createEvent('Arrived Delivery')}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-sm font-medium disabled:opacity-60"
          >
            Arrived Delivery
          </button>
          <button
            onClick={() => createEvent('Completed', true)}
            disabled={actionLoading}
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60"
          >
            Complete Trip
          </button>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Event Type</th>
                <th className="px-3 py-2 text-left">Location</th>
                <th className="px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr className="border-t border-slate-800">
                  <td colSpan={4} className="px-3 py-4 text-center text-slate-400">
                    No events recorded yet
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.TripEventID} className="border-t border-slate-800">
                    <td className="px-3 py-2">
                      {new Date(e.EventTime).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{e.EventType}</td>
                    <td className="px-3 py-2">
                      {e.City || e.State
                        ? `${e.City ?? ''}${e.City && e.State ? ', ' : ''}${
                            e.State ?? ''
                          }`
                        : '—'}
                    </td>
                    <td className="px-3 py-2">{e.Note ?? '—'}</td>
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
