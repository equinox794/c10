import React from 'react';
import { Users, FileText, Package, ClipboardList, Bell, ChevronLeft } from 'lucide-react';

const Dashboard = () => {
  const menuItems = [
    { name: 'Dashboard', icon: Users, active: true },
    { name: 'Stok Yönetimi', icon: Package },
    { name: 'Cari Hesap', icon: Users },
    { name: 'Reçete Sistemi', icon: FileText },
    { name: 'Sipariş & Teklif', icon: ClipboardList }
  ];

  const stats = [
    { title: 'Toplam Müşteri', value: '1', icon: Users, color: 'bg-blue-500' },
    { title: 'Aktif Siparişler', value: '0', icon: FileText, color: 'bg-purple-500' },
    { title: 'Kritik Stok', value: '43', icon: Package, color: 'bg-red-500' },
    { title: 'Aktif Reçeteler', value: '1', icon: ClipboardList, color: 'bg-green-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-48 h-full bg-slate-900 border-r border-slate-800 z-50">
        <div className="p-4 flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl font-bold">Bioplant CRM</span>
        </div>
        <nav className="mt-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-2 p-4 hover:bg-slate-800 ${
                item.active ? 'bg-slate-800' : ''
              }`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-48 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <button className="p-2 relative hover:bg-slate-800 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 rounded-lg bg-opacity-10`}>
                  <stat.icon size={24} className={stat.color.replace('bg-', 'text-')} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Son Siparişler</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-700">
                      <th className="pb-2">Tarih</th>
                      <th className="pb-2">Müşteri</th>
                      <th className="pb-2">Durum</th>
                      <th className="pb-2">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Henüz sipariş bulunmuyor
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h2 className="text-lg font-semibold mb-4">Uyarılar</h2>
              <div className="space-y-2">
                <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Package size={20} />
                    <p>43 ürün kritik seviyede</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;