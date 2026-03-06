'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Settings, ArrowLeft, BarChart3, Rocket } from 'lucide-react';

const navItems = [
  { href: '/app', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/app/invoices', label: 'Factures & Devis', icon: FileText },
  { href: '/app/clients', label: 'Clients', icon: Users },
  { href: '/app/reports', label: 'Rapports', icon: BarChart3 },
  { href: '/app/growth', label: 'Go-to-Market', icon: Rocket },
  { href: '/app/settings', label: 'Paramètres', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40 hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F!</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Factorielle</span>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
