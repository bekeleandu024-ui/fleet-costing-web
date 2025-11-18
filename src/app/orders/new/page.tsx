'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Customer = {
  CustomerID: number;
  Name: string;
};

export default function NewOrderPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [customerID, setCustomerID] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [miles, setMiles] = useState('');
  const [revenue, setRevenue] = useState('');

  useEffect(() => {
    // Load customers for dropdown (optional enhancement)
    // For now we'll leave this empty and user can type CustomerID or leave blank
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerID: customerID ? Number(customerID) : null,
          origin,
          destination,
          miles: Number(miles),
          revenue: Number(revenue),
        }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Failed to create order');

      // redirect to orders list on success
      router.push('/orders');
    } catch (e: any) {
      setError(e.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/orders"
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-semibold">Create New Order</h1>
        </div>

        {error && (
          <div className="mb-4 rounded bg-red-900/60 border border-red-500 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4"
        >
          <div>
            <label htmlFor="customerID" className="block text-sm font-medium mb-1.5">
              Customer ID (optional)
            </label>
            <input
              id="customerID"
              type="number"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
              placeholder="Leave blank if unknown"
              value={customerID}
              onChange={(e) => setCustomerID(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="origin" className="block text-sm font-medium mb-1.5">
              Origin <span className="text-red-400">*</span>
            </label>
            <input
              id="origin"
              type="text"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
              placeholder="e.g., Chicago, IL"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium mb-1.5">
              Destination <span className="text-red-400">*</span>
            </label>
            <input
              id="destination"
              type="text"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
              placeholder="e.g., Dallas, TX"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="miles" className="block text-sm font-medium mb-1.5">
              Miles <span className="text-red-400">*</span>
            </label>
            <input
              id="miles"
              type="number"
              step="1"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
              placeholder="e.g., 450"
              value={miles}
              onChange={(e) => setMiles(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="revenue" className="block text-sm font-medium mb-1.5">
              Revenue <span className="text-red-400">*</span>
            </label>
            <input
              id="revenue"
              type="number"
              step="0.01"
              className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
              placeholder="e.g., 1250.00"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create Order'}
            </button>
            <Link
              href="/orders"
              className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
