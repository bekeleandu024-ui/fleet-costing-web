import Link from 'next/link';

export default function NavBar() {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Trips', href: '/trips' },
    { name: 'Orders', href: '/orders' },
    { name: 'Drivers', href: '/drivers' },
    { name: 'Dispatch', href: '/dispatch' },
    { name: 'Tracking', href: '/tracking' },
    { name: 'Analytics', href: '/analytics/costs' },
    { name: 'Reports', href: '/reports/trips' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-semibold text-slate-100 hover:text-white"
            >
              Fleet Costing
            </Link>
            <div className="hidden md:flex space-x-1">
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
