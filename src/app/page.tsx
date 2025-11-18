import Link from 'next/link';

export default function Home() {
  const sections = [
    {
      title: 'Core Operations',
      links: [
        { name: 'Dashboard', href: '/dashboard', desc: 'Key metrics and KPIs' },
        { name: 'Trips & Costing', href: '/trips', desc: 'View and manage trip costs' },
        { name: 'Orders', href: '/orders', desc: 'Create and manage orders' },
        { name: 'Drivers & Fleet', href: '/drivers', desc: 'Driver and unit management' },
      ],
    },
    {
      title: 'Dispatch & Tracking',
      links: [
        { name: 'Dispatch Board', href: '/dispatch', desc: 'Kanban-style dispatch view' },
        { name: 'Active Tracking', href: '/tracking', desc: 'Track active trips' },
      ],
    },
    {
      title: 'Analytics & Reports',
      links: [
        { name: 'Cost Analytics', href: '/analytics/costs', desc: 'Performance by driver type & customer' },
        { name: 'Trip Reports', href: '/reports/trips', desc: 'Detailed trip reports' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Fleet Costing Management</h1>
        <p className="text-slate-400 mb-8">
          Next.js + SQL Server fleet management system
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-300 border-b border-slate-800 pb-2">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg border border-slate-800 bg-slate-900/70 p-4 hover:bg-slate-900 hover:border-slate-700 transition-colors"
                  >
                    <div className="font-medium mb-1">{link.name}</div>
                    <div className="text-sm text-slate-400">{link.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-slate-500">
          <p>Database: FleetNew (SQL Server) | Framework: Next.js 15 App Router</p>
        </div>
      </div>
    </main>
  );
}
