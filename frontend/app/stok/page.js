"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const fileInputRef = useRef(null);
  const [editingStock, setEditingStock] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStock, setNewStock] = useState({
    name: "",
    quantity: 0,
    unit: "kg",
    price: 0,
    category: "hammadde",
    min_quantity: 0,
  });

  // Stok istatistiklerini hesapla
  const stockStats = useMemo(() => {
    const filteredStocks =
      selectedCategory === "Tümü"
        ? stocks
        : stocks.filter(
            (s) => s.category?.toLowerCase() === selectedCategory.toLowerCase()
          );

    return {
      count: filteredStocks.length,
      totalValue: filteredStocks.reduce(
        (sum, stock) => sum + stock.quantity * stock.price,
        0
      ),
    };
  }, [stocks, selectedCategory]);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/stock`
      );
      if (!response.ok) {
        throw new Error("Stok verileri alınamadı");
      }
      const data = await response.json();
      console.log("Yüklenen stok verileri:", data); // Debug için
      setStocks(data);
    } catch (error) {
      console.error("Stok verileri yüklenirken hata:", error);
      toast.error("Stok verileri yüklenemedi");
    }
  };

  // Excel'e aktar
  const handleExportStocks = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/stock`
      );
      const stocks = await response.json();

      // Excel için veriyi hazırla
      const csvContent = [
        [
          "ID",
          "Ürün Adı",
          "Miktar",
          "Birim",
          "Fiyat",
          "Stok Türü",
          "Kritik Stok",
          "Toplam TL",
        ],
        ...stocks.map((stock) => [
          stock.id,
          stock.name,
          stock.quantity,
          stock.unit,
          stock.price,
          stock.category,
          stock.min_quantity,
          (stock.quantity * stock.price).toFixed(2),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      // CSV dosyasını indir
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "stok_listesi.csv";
      link.click();

      toast.success("Stok listesi indirildi");
    } catch (error) {
      console.error("Dışa aktarma hatası:", error);
      toast.error("Stok listesi indirilemedi");
    }
  };

  // Excel'den içe aktar
  const handleImportStocks = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/stock/bulk`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `${result.details.added} stok eklendi, ${result.details.updated} stok güncellendi`
        );
        loadStocks(); // Listeyi yenile
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("İçe aktarma hatası:", error);
      toast.error("Stok listesi yüklenemedi: " + error.message);
    }

    // Input'u temizle
    event.target.value = "";
  };

  // Stok düzenleme fonksiyonu
  const handleEditStock = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/stock/${editingStock.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingStock),
        }
      );

      if (response.ok) {
        toast.success("Stok başarıyla güncellendi");
        setShowEditModal(false);
        loadStocks(); // Listeyi yenile
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Stok güncelleme hatası:", error);
      toast.error("Stok güncellenirken hata oluştu: " + error.message);
    }
  };

  const handleNewStockChange = (e) => {
    const { name, value } = e.target;
    setNewStock((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newStock),
        }
      );

      if (response.ok) {
        toast.success("Yeni stok başarıyla eklendi");
        setShowNewModal(false);
        loadStocks(); // Listeyi yenile
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Yeni stok ekleme hatası:", error);
      toast.error("Yeni stok eklenemedi: " + error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "ÜRÜN ADI", width: 200 },
    { field: "quantity", headerName: "MİKTAR", width: 100, type: "number" },
    { field: "unit", headerName: "BİRİM", width: 80 },
    { field: "price", headerName: "FİYAT", width: 100, type: "number" },
    { field: "category", headerName: "STOK TÜRÜ", width: 120 },
    { field: "min_quantity", headerName: "KRİTİK STOK", width: 120 },
    { field: "totalValue", headerName: "TOPLAM TL", width: 120 },
    {
      field: "actions",
      headerName: "İŞLEMLER",
      width: 120,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditingStock(params.row);
              setShowEditModal(true);
            }}
            className="p-1 hover:text-blue-500 text-slate-400"
          >
            <Pencil size={18} />
          </button>
          <button className="p-1 hover:text-red-500 text-slate-400">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  const StockForm = ({ stock, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: stock?.name || "",
      code: stock?.code || "",
      quantity: stock?.quantity || 0,
      unit: stock?.unit || "kg",
      price: stock?.price || 0,
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }}
        className="space-y-4 p-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hammadde Adı
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kod
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Miktar
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Birim
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="kg">kg</option>
              <option value="lt">lt</option>
              <option value="adet">adet</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fiyat
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              step="0.01"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Kaydet
          </button>
        </div>
      </form>
    );
  };

  return (
    <>
      {/* Başlık ve İstatistikler */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Stok Yönetimi</h1>
          <div className="flex items-center gap-4 text-slate-300">
            <span>Stok Sayısı: {stockStats.count}</span>
            <span>
              Toplam Değer: {stockStats.totalValue.toLocaleString("tr-TR")} TL
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1 text-white"
            >
              <option value="Tümü">Tümü</option>
              <option value="hammadde">Hammadde</option>
              <option value="ambalaj">Ambalaj</option>
              <option value="mamul">Mamül</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <Plus size={20} />
            <span>Yeni Stok</span>
          </button>
          <button
            onClick={handleExportStocks}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
          >
            <Download size={20} />
            <span>Stokları İndir</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors cursor-pointer">
            <Upload size={20} />
            <span>Stok Ekle</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportStocks}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Stok adı veya kodu ile ara..."
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-600"
            />
            <Search
              className="absolute right-3 top-2.5 text-slate-500"
              size={20}
            />
          </div>
        </div>
      </div>

      {/* Stok Tablosu */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead>
              <tr className="bg-slate-800">
                <th className="text-left p-4 text-slate-400">ID</th>
                <th className="text-left p-4 text-slate-400">ÜRÜN ADI</th>
                <th className="text-left p-4 text-slate-400">MİKTAR</th>
                <th className="text-left p-4 text-slate-400">BİRİM</th>
                <th className="text-left p-4 text-slate-400">FİYAT</th>
                <th className="text-left p-4 text-slate-400">STOK TÜRÜ</th>
                <th className="text-left p-4 text-slate-400">KRİTİK STOK</th>
                <th className="text-left p-4 text-slate-400">TOPLAM TL</th>
                <th className="text-left p-4 text-slate-400">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {stocks.length === 0 ? (
                <tr className="border-b border-slate-700">
                  <td colSpan="9" className="p-4 text-center text-slate-500">
                    Henüz stok kaydı bulunmuyor
                  </td>
                </tr>
              ) : (
                stocks
                  .sort((a, b) => b.quantity * b.price - a.quantity * a.price)
                  .filter(
                    (stock) =>
                      selectedCategory === "Tümü" ||
                      stock.category?.toLowerCase() ===
                        selectedCategory.toLowerCase()
                  )
                  .map((stock) => (
                    <tr key={stock.id} className="hover:bg-slate-700/50">
                      <td className="p-4 text-slate-300">{stock.id}</td>
                      <td className="p-4 text-slate-300">{stock.name}</td>
                      <td className="p-4 text-slate-300">{stock.quantity}</td>
                      <td className="p-4 text-slate-300">{stock.unit}</td>
                      <td className="p-4 text-slate-300">{stock.price}</td>
                      <td className="p-4 text-slate-300">{stock.category}</td>
                      <td className="p-4 text-slate-300">
                        {stock.min_quantity}
                      </td>
                      <td className="p-4 text-slate-300">
                        {(stock.quantity * stock.price).toLocaleString(
                          "tr-TR",
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingStock(stock);
                              setShowEditModal(true);
                            }}
                            className="p-1 hover:text-blue-500 text-slate-400"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(stock.id)}
                            className="p-1 hover:text-red-500 text-slate-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Düzenleme Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200">
                Stok Düzenle
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditStock} className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Ürün Adı
                  </label>
                  <input
                    type="text"
                    value={editingStock?.name || ""}
                    onChange={(e) =>
                      setEditingStock({ ...editingStock, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Miktar
                  </label>
                  <input
                    type="number"
                    value={editingStock?.quantity || 0}
                    onChange={(e) =>
                      setEditingStock({
                        ...editingStock,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Birim
                  </label>
                  <select
                    value={editingStock?.unit || "kg"}
                    onChange={(e) =>
                      setEditingStock({ ...editingStock, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="lt">lt</option>
                    <option value="adet">adet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    value={editingStock?.price || 0}
                    onChange={(e) =>
                      setEditingStock({
                        ...editingStock,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Stok Türü
                  </label>
                  <select
                    value={editingStock?.category || "hammadde"}
                    onChange={(e) =>
                      setEditingStock({
                        ...editingStock,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  >
                    <option value="hammadde">Hammadde</option>
                    <option value="ambalaj">Ambalaj</option>
                    <option value="mamul">Mamül</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Kritik Stok
                  </label>
                  <input
                    type="number"
                    value={editingStock?.min_quantity || 0}
                    onChange={(e) =>
                      setEditingStock({
                        ...editingStock,
                        min_quantity: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Yeni Stok Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-slate-200">
                Yeni Stok Ekle
              </h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleNewSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newStock.name || ""}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Kategori
                    </label>
                    <select
                      name="category"
                      value={newStock.category || "hammadde"}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                    >
                      <option value="hammadde">Hammadde</option>
                      <option value="ambalaj">Ambalaj</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Miktar
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={newStock.quantity || 0}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Birim
                    </label>
                    <select
                      name="unit"
                      value={newStock.unit || "kg"}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                    >
                      <option value="kg">KG</option>
                      <option value="lt">LT</option>
                      <option value="adet">ADET</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Fiyat (TL)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newStock.price || 0}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200">
                      Min. Miktar
                    </label>
                    <input
                      type="number"
                      name="min_quantity"
                      value={newStock.min_quantity || 0}
                      onChange={handleNewStockChange}
                      className="mt-1 block w-full rounded-md bg-slate-700 border border-slate-600 text-white px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
