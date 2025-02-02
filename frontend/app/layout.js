'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Package, 
    Users, 
    FileText, 
    ClipboardList, 
    Settings, 
    ChevronLeft, 
    Menu,
    Home
} from 'lucide-react';
import { MENU_ITEMS } from '@/constants/menu-items';
import './globals.css';

// Icon mapping
const ICON_MAP = {
    Home,
    Package,
    Users,
    FileText,
    ClipboardList,
    Settings
};

export default function RootLayout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <html lang="tr">
            <head>
                <title>Bioplant CRM</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="bg-slate-900">
                <div className="flex min-h-screen">
                    {/* Sidebar */}
                    <aside className={`fixed left-0 top-0 ${collapsed ? 'w-20' : 'w-48'} h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-50`}>
                        <div className="p-4 flex items-center justify-between">
                            {!collapsed && <span className="text-xl font-bold text-white">Bioplant CRM</span>}
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
                            >
                                {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                            </button>
                        </div>
                        <nav className="mt-4">
                            {MENU_ITEMS.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.path}
                                    className={`flex items-center gap-2 p-4 hover:bg-slate-800 text-slate-300 hover:text-white
                                        ${pathname === item.path ? 'bg-slate-800 text-white' : ''}`}
                                >
                                    {React.createElement(ICON_MAP[item.icon], { size: 20 })}
                                    {!collapsed && <span>{item.title}</span>}
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-48'} transition-all duration-300`}>
                        <div className="p-6 text-white">
                            {children}
                        </div>
                    </main>
                </div>
            </body>
        </html>
    );
} 