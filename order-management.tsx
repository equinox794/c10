import React, { useState } from 'react';
import { Plus, Download, Search, Pencil, Trash2, FileText } from 'lucide-react';

const OrderManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const orders = [
    { 
      id: 1, 
      date: '2024-01-29',
      customer: 'ABC Tarım Ltd.',
      products: 'Lexora Ca',
      quantity: '200L',
      amount: '26,000.00 TL',
      status: 'Beklemede'
    },
    { 
      id: 2, 
      date: '2024-01-28',
      customer: 'XYZ Çiftlik',
      products: 'NPK Mix',
      quantity: '500kg',
      amount: '45,000.00 TL',
      status: 'Onaylandı'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sipariş & Teklif</h1>
        <div className="space-x-2">
          <span className="text-slate-400">Toplam Sipariş: 45</span>
          <span className="mx-2">|</span>
          <span className="text-green-400">Aktif: 12</span>
          <span className="mx-2">|</span>
          <span className="text-yellow-400">Beklemede: 8</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={20} />
          <span>Yeni Sipariş</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <FileText size={20} />
          <span>Yeni Teklif</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
          <Download size={20} />
          <span>Dışa Aktar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Sipariş veya müşteri ara..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
        </div>
        <div>
          <select 
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Beklemede</option>
            <option value="approved">Onaylandı</option>
            <option value="completed">Tamamlandı</option>
            <option value="cancelled">İptal Edildi</option>
          </select>
        </div>
        <div>
          <input
            type="date"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left p-4">Sipariş No</th>
              <th className="text-left p-4">Tarih</th>
              <th className="text-left p-4">Müşteri</th>
              <th className="text-left p-4">Ürünler</th>
              <th className="text-left p-4">Miktar</th>
              <th className="text-left p-4">Tutar</th>
              <th className="text-left p-4">Durum</th>
              <th className="text-center p-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-750">
                <td className="p-4">#{order.id}</td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">{order.customer}</td>
                <td className="p-4">{order.products}</td>
                <td className="p-4">{order.quantity}</td>
                <td className="p-4">{order.amount}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm
                    ${order.status === 'Beklemede' ? 'bg-yellow-500/20 text-yellow-500' : ''}
                    ${order.status === 'Onaylandı' ? 'bg-green-500/20 text-green-500' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
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

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-sm text-slate-400">
        <div>
          Toplam 45 siparişten 1-10 arası gösteriliyor
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700">
            Önceki
          </button>
          <button className="px-3 py-1 bg-blue-600 rounded-lg">1</button>
          <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700">2</button>
          <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700">3</button>
          <button className="px-3 py-1 bg-slate-800 rounded-lg hover:bg-slate-700">
            Sonraki
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;