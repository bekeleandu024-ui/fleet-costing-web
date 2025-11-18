// C:\Users\bekel\Desktop\fleet-costing-web\src\app\orders\page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrderRow = {
  OrderID: number;
  OrderRef: string | null;
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link
          href="/orders/new"
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
        >
          Create Order
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Orders table */}
      {loading ? (
        <div>Loading orders…</div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left">OrderID</th>
                <th className="px-3 py-2 text-left">OrderRef</th>
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
                  <td className="px-3 py-2">{o.OrderRef ?? ''}</td>
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
