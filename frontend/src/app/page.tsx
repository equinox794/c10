'use client';

import { useEffect, useState } from 'react';
import { api, Customer, Stock, Order, Recipe } from '../services/api';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stock, setStock] = useState<Stock[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, stockData, ordersData, recipesData] = await Promise.all([
          api.getCustomers(),
          api.getStock(),
          api.getOrders(),
          api.getRecipes()
        ]);

        setCustomers(customersData);
        setStock(stockData);
        setOrders(ordersData);
        setRecipes(recipesData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Kritik stok sayısını hesapla
  const criticalStockCount = stock.filter(item => item.quantity <= item.min_quantity).length;

  // Bekleyen sipariş sayısı
  const pendingOrderCount = orders.filter(order => order.status === 'Beklemede').length;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">CRM/ERP Dashboard</h1>
        
        {loading ? (
          <div className="text-center py-8">Yükleniyor...</div>
        ) : (
          <>
            {/* Özet Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Toplam Müşteri</h3>
                <p className="text-3xl font-bold">{customers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Aktif Siparişler</h3>
                <p className="text-3xl font-bold">{pendingOrderCount}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Kritik Stok</h3>
                <p className="text-3xl font-bold text-red-500">{criticalStockCount}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Toplam Reçete</h3>
                <p className="text-3xl font-bold">{recipes.length}</p>
              </div>
            </div>

            {/* Hızlı Eylemler */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
                + Yeni Müşteri
              </button>
              <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
                + Yeni Sipariş
              </button>
              <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
                + Stok Girişi
              </button>
              <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors">
                + Yeni Reçete
              </button>
            </div>

            {/* Son İşlemler */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Son İşlemler</h2>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-medium">Sipariş #{order.id}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        {customers.find(c => c.id === order.customer_id)?.name}
                      </span>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        order.status === 'Beklemede' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="ml-4 font-medium">{order.total.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 