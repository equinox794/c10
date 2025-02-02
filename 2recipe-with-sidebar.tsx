import React from 'react';
import { 
  Search, 
  Trash2, 
  Home, 
  Package, 
  Users, 
  FileText, 
  ShoppingCart, 
  Settings, 
  ChevronLeft,
  Pencil,
  Copy
} from 'lucide-react';

const RecipeWithSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: Home },
    { name: 'Stok Yönetimi', icon: Package },
    { name: 'Cari Hesaplar', icon: Users },
    { name: 'Reçete Sistemi', icon: FileText, active: true },
    { name: 'Sipariş & Teklif', icon: ShoppingCart },
    { name: 'Ayarlar', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-48 bg-slate-900 border-r border-slate-800 fixed h-full">
        <div className="p-4 flex items-center gap-2">
          <ChevronLeft className="w-5 h-5 text-white" />
          <span className="text-xl font-bold text-white">Bioplant CRM</span>
        </div>
        <nav className="mt-4">
          {menuItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`flex items-center gap-2 p-4 text-white hover:bg-slate-800 ${
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
      <div className="ml-48 flex-1 p-6">
        <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-6">Yeni Reçete</h2>
          
          {/* Form Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Ürün Adı</label>
              <input
                type="text"
                defaultValue="Örn: Lexora Ca"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Firma</label>
              <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white appearance-none">
                <option>Firma seçin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1">Yoğunluk</label>
              <input
                type="text"
                defaultValue="1.20"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
          
          {/* Ambalaj Selection */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">Ambalaj Tipi</label>
            <div className="flex gap-3 mb-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Sıvı</button>
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Toz</button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">1L</button>
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">5L</button>
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">20L</button>
              <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">1000L</button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Hammadde ara..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          </div>
          
          {/* Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-2">Hammadde</th>
                  <th className="pb-2">Miktar (kg)</th>
                  <th className="pb-2">Birim Fiyat</th>
                  <th className="pb-2">Toplam</th>
                  <th className="pb-2">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="text-center py-4 text-slate-400">
                    Henüz hammadde eklenmemiş
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <div>
              <p className="text-slate-400">Toplam Miktar: 0.00 kg</p>
              <p className="text-slate-400">Toplam Maliyet: 0.00 TL</p>
            </div>
            <div className="space-x-2">
              <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                Temizle
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                Kaydet
              </button>
            </div>
          </div>
        </div>

        {/* Saved Recipes */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Kayıtlı Reçeteler</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-4">Ürün Adı</th>
                  <th className="pb-4">Firma</th>
                  <th className="pb-4">Yoğunluk</th>
                  <th className="pb-4">Ambalaj</th>
                  <th className="pb-4">Toplam Maliyet</th>
                  <th className="pb-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-700">
                  <td className="py-4 text-white">Lexora Ca</td>
                  <td className="py-4 text-white">MMD Fason</td>
                  <td className="py-4 text-white">1.20</td>
                  <td className="py-4 text-white">5L, 20L</td>
                  <td className="py-4 text-white">26,000.00 TL</td>
                  <td className="py-4">
                    <div className="flex gap-2 justify-end">
                      <button 
                        className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700"
                        title="Düzenle"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-green-400 transition-colors rounded-lg hover:bg-slate-700"
                        title="Kopyala"
                      >
                        <Copy size={18} />
                      </button>
                      <button 
                        className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700"
                        title="Sil"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeWithSidebar;