"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  ClipboardList,
  AlertTriangle,
  Bell,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 1,
    activeOrders: 0,
    criticalStock: 43,
    activeRecipes: 1,
  });
  const [activeOrders, setActiveOrders] = useState([]);

  // Verileri yükle
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Aktif siparişleri yükle
      const ordersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/active-orders`
      );
      if (!ordersResponse.ok) throw new Error("Aktif siparişler yüklenemedi");
      const ordersData = await ordersResponse.json();
      setActiveOrders(ordersData);

      // Stats'ı güncelle
      setStats((prev) => ({
        ...prev,
        activeOrders: ordersData.length,
      }));
    } catch (error) {
      console.error("Dashboard verileri yüklenirken hata:", error);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Toplam Müşteri */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalCustomers}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users size={20} className="text-blue-500" />
            </div>
          </div>
        </div>

        {/* Aktif Siparişler */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Aktif Siparişler</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.activeOrders}
              </p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <ClipboardList size={20} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Kritik Stok */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Kritik Stok</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.criticalStock}
              </p>
            </div>
            <div className="bg-red-500/20 p-3 rounded-lg">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          </div>
        </div>

        {/* Aktif Reçeteler */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Aktif Reçeteler</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.activeRecipes}
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <FileText size={20} className="text-green-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Son Siparişler */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                Aktif Siparişler
              </h2>
            </div>
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-2 text-slate-400">Müşteri</th>
                    <th className="text-left p-2 text-slate-400">Ürün</th>
                    <th className="text-left p-2 text-slate-400">Miktar</th>
                    <th className="text-left p-2 text-slate-400">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrders.length === 0 ? (
                    <tr className="border-b border-slate-700">
                      <td className="p-2 text-slate-300" colSpan={4}>
                        Henüz aktif sipariş yok
                      </td>
                    </tr>
                  ) : (
                    activeOrders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-700">
                        <td className="p-2 text-slate-300">
                          {order.customer_name}
                        </td>
                        <td className="p-2 text-slate-300">
                          {order.recipe_name}
                        </td>
                        <td className="p-2 text-slate-300">{order.quantity}</td>
                        <td className="p-2 text-slate-300">
                          {order.total.toLocaleString("tr-TR")} TL
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Uyarılar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-slate-400" />
                <h2 className="text-lg font-semibold text-white">Uyarılar</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertTriangle size={20} />
                  <p className="text-sm">43 ürün kritik seviyede</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
