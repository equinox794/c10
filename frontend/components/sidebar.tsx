'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Package, Users, FileText, Beaker, Settings } from 'lucide-react';

const menuItems = [
    {
        title: 'Stok Yönetimi',
        href: '/stok',
        icon: Package
    },
    {
        title: 'Cari Hesaplar',
        href: '/cari',
        icon: Users
    },
    {
        title: 'Sipariş & Teklif',
        href: '/siparis',
        icon: FileText
    },
    {
        title: 'Reçete',
        href: '/recete',
        icon: Beaker
    },
    {
        title: 'Ayarlar',
        href: '/ayarlar',
        icon: Settings
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="h-screen w-64 bg-gray-900 text-white p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">ERP Sistemi</h1>
            </div>
            
            <nav>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-200 transition-all hover:text-white',
                                isActive ? 'bg-gray-800 text-white' : 'hover:bg-gray-800'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
} 