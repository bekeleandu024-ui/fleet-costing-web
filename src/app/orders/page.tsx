// C:\Users\bekel\Desktop\fleet-costing-web\src\app\orders\page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';

type OrderRow = {
  OrderID: number;
  Customer: string | null;
  Origin: string | null;
  Destination: string | null;
  Miles: number | null;
  Revenue: number | null;
  Status: string | null;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [customer, setCustomer] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [miles, setMiles] = useState('');
  const [revenue, setRevenue] = useState('');
  const [saving, setSaving] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data.orders);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customer || null,
          origin,
          destination,
          miles: Number(miles),
          revenue: Number(revenue),
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to create order');

      // prepend new order
      setOrders((prev) => [data.order, ...prev]);

      // clear form
      setCustomer('');
      setOrigin('');
      setDestination('');
      setMiles('');
      setRevenue('');
    } catch (e: any) {
      setError(e.message || 'Error creating order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="mb-6 grid gap-3 md:grid-cols-6 bg-slate-900/60 border border-slate-800 rounded-lg p-4"
      >
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
          placeholder="Customer (optional)"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
        />
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
          placeholder="Origin"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          required
        />
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
          placeholder="Miles"
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          required
        />
        <input
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
          placeholder="Revenue"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Create Order'}
        </button>
      </form>

      {/* Orders table */}
      {loading ? (
        <div>Loading orders…</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">OrderID</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Origin → Destination</th>
                <th className="px-3 py-2 text-right">Miles</th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.OrderID} className="border-t border-slate-800">
                  <td className="px-3 py-2">{o.OrderID}</td>
                  <td className="px-3 py-2">{o.Customer ?? ''}</td>
                  <td className="px-3 py-2">
                    {o.Origin && o.Destination
                      ? `${o.Origin} → ${o.Destination}`
                      : ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {o.Miles != null ? o.Miles : ''}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {o.Revenue != null ? o.Revenue.toFixed?.(2) ?? '' : ''}
                  </td>
                  <td className="px-3 py-2">{o.Status ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
