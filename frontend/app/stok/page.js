'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Download, Upload, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function StockPage() {
    const [stocks, setStocks] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const fileInputRef = useRef(null);
    const [editingStock, setEditingStock] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Stok istatistiklerini hesapla
    const stockStats = useMemo(() => {
        const filteredStocks = selectedCategory === 'Tümü' 
            ? stocks 
            : stocks.filter(s => s.category?.toLowerCase() === selectedCategory.toLowerCase());

        return {
            count: filteredStocks.length,
            totalValue: filteredStocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0),
        };
    }, [stocks, selectedCategory]);

    useEffect(() => {
        loadStocks();
    }, []);

    const loadStocks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/stock');
            const data = await response.json();
            setStocks(data);
        } catch (error) {
            console.error('Stok verileri yüklenirken hata:', error);
            toast.error('Stok verileri yüklenemedi');
        }
    };

    // Excel'e aktar
    const handleExportStocks = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/stock');
            const stocks = await response.json();
            
            // Excel için veriyi hazırla
            const csvContent = [
                ['ID', 'Ürün Adı', 'Miktar', 'Birim', 'Fiyat', 'Stok Türü', 'Kritik Stok', 'Toplam TL'],
                ...stocks.map(stock => [
                    stock.id,
                    stock.name,
                    stock.quantity,
                    stock.unit,
                    stock.price,
                    stock.category,
                    stock.min_quantity,
                    (stock.quantity * stock.price).toFixed(2)
                ])
            ].map(row => row.join(',')).join('\n');

            // CSV dosyasını indir
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'stok_listesi.csv';
            link.click();
            
            toast.success('Stok listesi indirildi');
        } catch (error) {
            console.error('Dışa aktarma hatası:', error);
            toast.error('Stok listesi indirilemedi');
        }
    };

    // Excel'den içe aktar
    const handleImportStocks = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/stock/bulk', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                toast.success(`${result.details.added} stok eklendi, ${result.details.updated} stok güncellendi`);
                loadStocks(); // Listeyi yenile
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('İçe aktarma hatası:', error);
            toast.error('Stok listesi yüklenemedi: ' + error.message);
        }

        // Input'u temizle
        event.target.value = '';
    };

    // Yeni stok ekleme modalı için state
    const [showNewStockModal, setShowNewStockModal] = useState(false);

    // Stok düzenleme fonksiyonu
    const handleEditStock = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(`http://localhost:3001/api/stock/${editingStock.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editingStock)
            });

            if (response.ok) {
                toast.success('Stok başarıyla güncellendi');
                setShowEditModal(false);
                loadStocks(); // Listeyi yenile
            } else {
                const error = await response.json();
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Stok güncelleme hatası:', error);
            toast.error('Stok güncellenirken hata oluştu: ' + error.message);
        }
    };

    return (
        <>
            {/* Başlık ve İstatistikler */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold text-white">Stok Yönetimi</h1>
                    <div className="flex items-center gap-4 text-slate-300">
                        <span>Stok Sayısı: {stockStats.count}</span>
                        <span>Toplam Değer: {stockStats.totalValue.toLocaleString('tr-TR')} TL</span>
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
                        onClick={() => setShowNewStockModal(true)}
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
                        <Search className="absolute right-3 top-2.5 text-slate-500" size={20} />
                    </div>
                </div>
            </div>

            {/* Stok Düzenleme Modalı */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Stok Düzenle</h2>
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-300"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditStock}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Ürün Adı
                                    </label>
                                    <input
                                        type="text"
                                        value={editingStock?.name || ''}
                                        onChange={(e) => setEditingStock({...editingStock, name: e.target.value})}
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
                                        onChange={(e) => setEditingStock({...editingStock, quantity: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Birim
                                    </label>
                                    <input
                                        type="text"
                                        value={editingStock?.unit || ''}
                                        onChange={(e) => setEditingStock({...editingStock, unit: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Fiyat
                                    </label>
                                    <input
                                        type="number"
                                        value={editingStock?.price || 0}
                                        onChange={(e) => setEditingStock({...editingStock, price: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Stok Türü
                                    </label>
                                    <select
                                        value={editingStock?.category || 'hammadde'}
                                        onChange={(e) => setEditingStock({...editingStock, category: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                    >
                                        <option value="hammadde">Hammadde</option>
                                        <option value="ambalaj">Ambalaj</option>
                                        <option value="mamul">Mamül</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">
                                        Kritik Stok Miktarı
                                    </label>
                                    <input
                                        type="number"
                                        value={editingStock?.min_quantity || 0}
                                        onChange={(e) => setEditingStock({...editingStock, min_quantity: parseFloat(e.target.value)})}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stok Tablosu */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
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
                        <tbody>
                            {stocks.length === 0 ? (
                                <tr className="border-b border-slate-700">
                                    <td colSpan="9" className="p-4 text-center text-slate-500">
                                        Henüz stok kaydı bulunmuyor
                                    </td>
                                </tr>
                            ) : (
                                stocks
                                    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
                                    .filter(stock => selectedCategory === 'Tümü' || 
                                                   stock.category?.toLowerCase() === selectedCategory.toLowerCase())
                                    .map((stock) => (
                                        <tr key={stock.id} className="border-b border-slate-700">
                                            <td className="p-4 text-slate-300">{stock.id}</td>
                                            <td className="p-4 text-slate-300">{stock.name}</td>
                                            <td className="p-4 text-slate-300">{stock.quantity}</td>
                                            <td className="p-4 text-slate-300">{stock.unit}</td>
                                            <td className="p-4 text-slate-300">{stock.price}</td>
                                            <td className="p-4 text-slate-300">{stock.category}</td>
                                            <td className="p-4 text-slate-300">{stock.min_quantity}</td>
                                            <td className="p-4 text-slate-300">
                                                {(stock.quantity * stock.price).toLocaleString('tr-TR')}
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
                                                    <button className="p-1 hover:text-red-500 text-slate-400">
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
        </>
    );
} 