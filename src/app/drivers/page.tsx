'use client';

import { useEffect, useState } from 'react';

type DriverRow = {
  DriverID: number;
  Name: string;
  Type: string | null;
};

type UnitRow = {
  UnitID: number;
  UnitNumber: string;
  DriverID: number | null;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [units, setUnits] = useState<UnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [driversRes, unitsRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/units'),
      ]);

      const driversData = await driversRes.json();
      const unitsData = await unitsRes.json();

      if (!driversData.ok) throw new Error(driversData.error || 'Failed to load drivers');
      if (!unitsData.ok) throw new Error(unitsData.error || 'Failed to load units');

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Drivers &amp; Fleet</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Drivers table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 font-medium">
              Drivers
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((d) => (
                    <tr key={d.DriverID} className="border-t border-slate-800">
                      <td className="px-3 py-2">{d.DriverID}</td>
                      <td className="px-3 py-2">{d.Name}</td>
                      <td className="px-3 py-2">{d.Type ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Units table */}
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 font-medium">
              Units
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Unit #</th>
                    <th className="px-3 py-2 text-left">DriverID</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.UnitID} className="border-t border-slate-800">
                      <td className="px-3 py-2">{u.UnitID}</td>
                      <td className="px-3 py-2">{u.UnitNumber}</td>
                      <td className="px-3 py-2">{u.DriverID ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
