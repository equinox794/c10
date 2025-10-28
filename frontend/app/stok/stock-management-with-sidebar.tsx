'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Users,
  FileText,
  ClipboardList,
  Settings,
  ChevronLeft,
  Menu,
  Bell,
  AlertTriangle,
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Stock } from '@/services/api';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ExcelRow = {
  ID?: string | number;
  urun_adi?: string;
  miktar?: number | string;
  birim?: string;
  fiyat?: number | string;
  stok_turu?: string;
  kritik_stok_miktari?: number | string;
};

const StockManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await api.getStock();
        setStocks(response);
      } catch (error) {
        console.error('Stok verileri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  useEffect(() => {
    // Toplam değeri hesapla
    const total = stocks.reduce((sum, stock) => sum + (stock.quantity * stock.price), 0);
    setTotalValue(total);
  }, [stocks]);

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      stock.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const menuItems = [
    { icon: Package, text: 'Stok Yönetimi', path: '/stok', active: true },
    { icon: Users, text: 'Cari Hesaplar', path: '/cari' },
    { icon: FileText, text: 'Sipariş & Teklif', path: '/siparis' },
    { icon: ClipboardList, text: 'Reçete', path: '/recete' },
    { icon: Settings, text: 'Ayarlar', path: '/ayarlar' },
  ];

  const stockCategories = [
    { id: 'all', name: 'Tümü' },
    { id: 'hammadde', name: 'Hammadde' },
    { id: 'urun', name: 'Ürün' },
    { id: 'ambalaj', name: 'Ambalaj' },
    { id: 'diger', name: 'Diğer' },
  ];

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(stocks.map(stock => ({
      ID: stock.id,
      urun_adi: stock.name,
      miktar: stock.quantity,
      birim: stock.unit,
      fiyat: stock.price,
      stok_turu: stock.category,
      kritik_stok_miktari: stock.min_quantity
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stoklar");
    
    const fileName = `bioplantStok-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        console.log('Excel verisi:', jsonData); // Debug için

        // Excel verilerini Stock formatına dönüştür
        const stockData = jsonData.map((item) => {
          console.log('İşlenen satır:', item); // Debug için
          return {
            name: item.urun_adi || '',  // Zorunlu alan
            code: String(item.ID || ''), // ID'yi code olarak kullan
            quantity: Number(item.miktar) || 0,
            unit: item.birim || 'kg',
            price: Number(item.fiyat) || 0,
            category: String(item.stok_turu || '').toLowerCase() || 'hammadde',
            min_quantity: Number(item.kritik_stok_miktari) || 0
          };
        });

        // Sadece ürün adı olan kayıtları filtrele
        const validStocks = stockData.filter(stock => stock.name && stock.name.trim() !== '');

        if (validStocks.length === 0) {
          alert('Geçerli stok verisi bulunamadı! En az bir ürün adı gerekli.');
          return;
        }

        console.log('Gönderilecek veriler:', validStocks); // Debug için

        // API'ye gönder
        const response = await api.addStocks(validStocks);
        console.log('API yanıtı:', response); // Debug için
        
        // Başarılı ise stok listesini güncelle
        const updatedStocks = await api.getStock();
        setStocks(updatedStocks);
        
        // Dosya seçiciyi temizle
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert(`${validStocks.length} adet stok başarıyla eklendi!`);
      } catch (error) {
        console.error('Excel içe aktarma hatası:', error);
        alert('Stok eklenirken bir hata oluştu! Lütfen konsolu kontrol edin.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleEditStock = async (id: number) => {
    const stock = stocks.find(s => s.id === id);
    if (!stock) return;
    setEditingStock(stock);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStock) return;

    try {
      await api.updateStock(editingStock.id, editingStock);
      const updatedStocks = await api.getStock();
      setStocks(updatedStocks);
      setIsEditDialogOpen(false);
      setEditingStock(null);
      alert('Stok güncellendi!');
    } catch (error) {
      console.error('Stok güncellenirken hata:', error);
      alert('Stok güncellenirken bir hata oluştu!');
    }
  };

  const handleDeleteStock = async (id: number) => {
    if (!confirm('Bu stok kaydını silmek istediğinize emin misiniz?')) return;

    try {
      await api.deleteStock(id);
      
      // Stok listesini güncelle
      setStocks(stocks.filter(stock => stock.id !== id));
      alert('Stok silindi!');
    } catch (error) {
      console.error('Stok silinirken hata:', error);
      alert('Stok silinirken bir hata oluştu!');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-900 p-4 shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`font-bold text-xl text-white ${!sidebarOpen && 'hidden'}`}>ERP Sistemi</h2>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded hover:bg-gray-800 text-white">
            {sidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <nav>
          {menuItems.map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`flex items-center p-3 mb-2 rounded transition-colors text-gray-300
                ${item.active ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              {sidebarOpen && <span className="ml-3">{item.text}</span>}
            </a>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Stok Yönetimi</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 items-center">
            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>Yeni Stok</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx,.xls"
              className="hidden"
            />

            <button
              onClick={handleExportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              <span>Stokları İndir</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Upload size={20} />
              <span>Stok Ekle</span>
            </button>

            <div className="ml-auto flex gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col">
                  <span className="text-sm text-gray-500">Kayıtlı Stok Adedi</span>
                  <span className="text-2xl font-bold">{stocks.length}</span>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex flex-col">
                  <span className="text-sm text-gray-500">Toplam Stok Değeri</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', { 
                      style: 'currency', 
                      currency: 'TRY',
                      maximumFractionDigits: 0
                    }).format(totalValue)}
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Stok adı veya kodu ile ara..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {stockCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Türü</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kritik Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam TL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center">Yükleniyor...</td>
                    </tr>
                  ) : (
                    filteredStocks.map((stock) => (
                      <tr key={stock.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{stock.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{stock.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stock.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stock.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stock.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{stock.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{stock.min_quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Intl.NumberFormat('tr-TR', { 
                            style: 'currency', 
                            currency: 'TRY',
                            maximumFractionDigits: 0 
                          }).format(stock.quantity * stock.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditStock(stock.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Pencil size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteStock(stock.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
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

          {/* Edit Stock Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Stok Düzenle</DialogTitle>
              </DialogHeader>
              {editingStock && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Ürün Adı</Label>
                    <Input
                      id="name"
                      value={editingStock.name}
                      onChange={(e) => setEditingStock({...editingStock, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="quantity">Miktar</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={editingStock.quantity}
                        onChange={(e) => setEditingStock({...editingStock, quantity: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unit">Birim</Label>
                      <Input
                        id="unit"
                        value={editingStock.unit}
                        onChange={(e) => setEditingStock({...editingStock, unit: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">Fiyat</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editingStock.price}
                        onChange={(e) => setEditingStock({...editingStock, price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="min_quantity">Kritik Stok Miktarı</Label>
                      <Input
                        id="min_quantity"
                        type="number"
                        value={editingStock.min_quantity}
                        onChange={(e) => setEditingStock({...editingStock, min_quantity: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={editingStock.category}
                      onChange={(e) => setEditingStock({...editingStock, category: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleSaveEdit}>
                  Kaydet
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default StockManagement; 