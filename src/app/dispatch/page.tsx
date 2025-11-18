'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DispatchTrip = {
  TripID: number;
  Status: string;
  DriverID: number | null;
  DriverName: string | null;
  DriverType: string | null;
  UnitID: number | null;
  UnitNumber: string | null;
  CustomerName: string | null;
  Origin: string | null;
  Destination: string | null;
  Miles: number | null;
  Revenue: number | null;
  TotalCost: number | null;
  Profit: number | null;
  MarginPct: number | null;
};

type Driver = {
  DriverID: number;
  Name: string;
  Type: string | null;
};

type Unit = {
  UnitID: number;
  UnitNumber: string;
  DriverID: number | null;
};

export default function DispatchPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<DispatchTrip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<DispatchTrip | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [tripsRes, driversRes, unitsRes] = await Promise.all([
        fetch('/api/dispatch/board'),
        fetch('/api/drivers'),
        fetch('/api/units'),
      ]);

      const tripsData = await tripsRes.json();
      const driversData = await driversRes.json();
      const unitsData = await unitsRes.json();

      if (!tripsData.ok) throw new Error(tripsData.error || 'Failed to load trips');
      if (!driversData.ok) throw new Error(driversData.error || 'Failed to load drivers');
      if (!unitsData.ok) throw new Error(unitsData.error || 'Failed to load units');

      setTrips(tripsData.trips);
      setDrivers(driversData.drivers);
      setUnits(unitsData.units);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAssignModal(trip: DispatchTrip) {
    setSelectedTrip(trip);
    setSelectedDriverId(trip.DriverID);
    setSelectedUnitId(trip.UnitID);
    setAssignModalOpen(true);
  }

  function closeAssignModal() {
    setAssignModalOpen(false);
    setSelectedTrip(null);
    setSelectedDriverId(null);
    setSelectedUnitId(null);
  }

  async function handleAssign() {
    if (!selectedTrip) return;

    try {
      setAssigning(true);
      setError(null);

      const res = await fetch('/api/dispatch/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTrip.TripID,
          driverId: selectedDriverId,
          unitId: selectedUnitId,
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to assign');

      closeAssignModal();
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Error assigning');
    } finally {
      setAssigning(false);
    }
  }

  function fmt(num: number | null | undefined, decimals = 0) {
    if (num == null || Number.isNaN(num)) return '—';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function getStatusColumn(status: string): string {
    const s = status.toLowerCase();
    if (!s || s === 'unassigned' || s === 'planned') return 'Unassigned';
    if (s === 'assigned') return 'Assigned';
    if (s === 'in transit' || s === 'intransit') return 'In Transit';
    if (s === 'delivered' || s === 'completed') return 'Delivered';
    return 'Unassigned';
  }

  const columns = ['Unassigned', 'Assigned', 'In Transit', 'Delivered'];
  const tripsByColumn = columns.reduce((acc, col) => {
    acc[col] = trips.filter((t) => getStatusColumn(t.Status) === col);
    return acc;
  }, {} as Record<string, DispatchTrip[]>);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-semibold mb-4">Dispatch Board</h1>
        <div>Loading dispatch board…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Dispatch Board</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid gap-4 md:grid-cols-4">
        {columns.map((col) => (
          <div key={col} className="flex flex-col">
            <div className="mb-2 px-3 py-2 rounded-t-lg bg-slate-800 border border-slate-700 font-medium text-sm">
              {col} ({tripsByColumn[col].length})
            </div>
            <div className="space-y-2 flex-1">
              {tripsByColumn[col].map((trip) => (
                <div
                  key={trip.TripID}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold">Trip #{trip.TripID}</div>
                    <button
                      onClick={() => router.push(`/trips/${trip.TripID}`)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 mb-3">
                    <div>
                      <span className="text-slate-500">Customer:</span>{' '}
                      {trip.CustomerName ?? '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">Route:</span>{' '}
                      {trip.Origin && trip.Destination
                        ? `${trip.Origin} → ${trip.Destination}`
                        : '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">Driver:</span>{' '}
                      {trip.DriverName ?? 'Unassigned'}
                    </div>
                    <div>
                      <span className="text-slate-500">Unit:</span>{' '}
                      {trip.UnitNumber ?? '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">Miles:</span> {fmt(trip.Miles)}
                    </div>
                    <div>
                      <span className="text-slate-500">Revenue:</span> $
                      {fmt(trip.Revenue, 2)}
                    </div>
                    {trip.MarginPct !== null && (
                      <div>
                        <span className="text-slate-500">Margin:</span>{' '}
                        <span
                          className={
                            trip.MarginPct >= 15
                              ? 'text-emerald-400'
                              : trip.MarginPct >= 5
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }
                        >
                          {fmt(trip.MarginPct, 1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openAssignModal(trip)}
                    className="w-full px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-xs font-medium"
                  >
                    {trip.DriverID ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {assignModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              Assign Trip #{selectedTrip.TripID}
            </h2>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Driver</label>
              <select
                value={selectedDriverId ?? ''}
                onChange={(e) =>
                  setSelectedDriverId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
              >
                <option value="">-- Select Driver --</option>
                {drivers.map((d) => (
                  <option key={d.DriverID} value={d.DriverID}>
                    {d.Name} ({d.Type ?? 'Unknown'})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Unit</label>
              <select
                value={selectedUnitId ?? ''}
                onChange={(e) =>
                  setSelectedUnitId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 text-sm"
              >
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u.UnitID} value={u.UnitID}>
                    {u.UnitNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="flex-1 px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60"
              >
                {assigning ? 'Assigning…' : 'Assign'}
              </button>
              <button
                onClick={closeAssignModal}
                disabled={assigning}
                className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
