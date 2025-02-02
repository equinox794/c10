import React from 'react';
import { Search, Pencil, Trash2, Settings, FileText, Users, Package, ChevronLeft } from 'lucide-react';

const StockManagement = () => {
  const menuItems = [
    { name: 'Stok Yönetimi', icon: Package, active: true },
    { name: 'Cari Hesaplar', icon: Users },
    { name: 'Sipariş & Teklif', icon: FileText },
    { name: 'Reçete', icon: FileText },
    { name: 'Ayarlar', icon: Settings }
  ];

  const stockData = [
    { id: '5', name: 'Potasyum Nitrat', amount: '7375', unit: 'kg', price: '99', type: 'Hammadde', critical: '1000', total: '730,125.00' },
    { id: '7', name: 'Magnezyum Sülfat hepta', amount: '100', unit: 'kg', price: '44', type: 'Hammadde', critical: '0', total: '4,400.00' },
    { id: '8', name: 'borıc acıt', amount: '100', unit: 'kg', price: '44', type: 'Hammadde', critical: '0', total: '4,400.00' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-48 h-full bg-slate-900 border-r border-slate-800">
        <div className="p-4 flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xl font-bold">ERP Sistemi</span>
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
          <h1 className="text-2xl font-bold">Stok Yönetimi</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div>Kayıtlı Stok Adedi: <span className="font-semibold">128</span></div>
            <div className="ml-4">Toplam Stok Değeri: <span className="font-semibold">26.525,00 TL</span></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2">
            <span className="text-lg">+</span> Yeni Stok
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2">
            <Package className="w-4 h-4" /> Stokları İndir
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md flex items-center gap-2">
            <Package className="w-4 h-4" /> Stok Ekle
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Stok adı veya kodu ile ara..."
            className="w-full p-2 pl-10 bg-slate-800 border border-slate-700 rounded-md"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>

        {/* Stock Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-slate-700">
                <th className="p-3">ID</th>
                <th className="p-3">ÜRÜN ADI</th>
                <th className="p-3">MİKTAR</th>
                <th className="p-3">BİRİM</th>
                <th className="p-3">FİYAT</th>
                <th className="p-3">STOK TÜRÜ</th>
                <th className="p-3">KRİTİK STOK</th>
                <th className="p-3">TOPLAM TL</th>
                <th className="p-3">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-750">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.amount}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">{item.price}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3">{item.critical}</td>
                  <td className="p-3">{item.total}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button className="p-1 hover:text-blue-400">
                        <Pencil size={18} />
                      </button>
                      <button className="p-1 hover:text-red-400">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;