'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package2, 
  Users, 
  FileSpreadsheet,
  ClipboardList,
  Settings
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    title: 'Stok',
    href: '/stok',
    icon: Package2
  },
  {
    title: 'Cari',
    href: '/cari',
    icon: Users
  },
  {
    title: 'Reçete',
    href: '/recete',
    icon: FileSpreadsheet
  },
  {
    title: 'Sipariş',
    href: '/siparis',
    icon: ClipboardList
  },
  {
    title: 'Ayarlar',
    href: '/ayarlar',
    icon: Settings
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 px-3 py-4 space-y-6">
      {/* Logo */}
      <div className="px-3 py-2">
        <h1 className="text-xl font-bold text-gray-800">NPK CRM</h1>
      </div>

      {/* Menu */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 mt-auto">
        <div className="py-4 text-sm text-gray-500">
          © 2024 NPK CRM
        </div>
      </div>
    </div>
  );
} 