'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash, Database, Archive, Upload, RotateCcw, X, Save, History } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Button, Textarea } from '@/components/ui';

export default function SettingsPage() {
    const [packages, setPackages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        size: '',
        unit: 'L',
        price: ''
    });
    const [backupStatus, setBackupStatus] = useState({
        isLoading: false,
        progress: 0,
        message: '',
        error: '',
        path: '',
        size: 0
    });
    const [backupPath, setBackupPath] = useState('C:\\cursor\\c9\\claudeyedek');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [priceHistory, setPriceHistory] = useState([]);
    const [showPriceHistory, setShowPriceHistory] = useState(false);
    
    // Fiyatlandırma ayarları için state'ler
    const [settings, setSettings] = useState({
        dolar_kuru: 0,
        liste_a_kar_orani: 20,
        liste_b_kar_orani: 35,
        liste_c_kar_orani: 50
    });

    // Teklif ayarları için state'ler
    const [teklifSettings, setTeklifSettings] = useState({
        id: 1,
        firma_adi: '',
        firma_adresi: '',
        firma_telefon: '',
        firma_email: '',
        firma_web: '',
        firma_vergi_dairesi: '',
        firma_vergi_no: '',
        banka_bilgileri: '',
        teklif_notu: '',
        teklif_gecerlilik: '',
        teklif_sartlari: '',
        teklif_alt_not: ''
    });

    useEffect(() => {
        loadPackages();
        loadSettings();
        loadTeklifSettings();
    }, []);

    const loadPackages = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/packages');
            const data = await response.json();
            setPackages(data);
        } catch (error) {
            console.error('Ambalaj verileri yüklenirken hata:', error);
        }
    };

    const loadSettings = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/settings');
            if (!response.ok) throw new Error('Ayarlar yüklenemedi');
            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error('Ayarlar yüklenirken hata:', error);
            toast.error('Ayarlar yüklenemedi');
        }
    };

    const loadTeklifSettings = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/teklif-settings');
            if (!response.ok) throw new Error('Teklif ayarları yüklenemedi');
            const data = await response.json();
            setTeklifSettings(data);
        } catch (error) {
            console.error('Teklif ayarları yüklenirken hata:', error);
            toast.error('Teklif ayarları yüklenemedi');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingPackage 
                ? `http://localhost:3001/api/packages/${editingPackage.id}`
                : 'http://localhost:3001/api/packages';
                
            const method = editingPackage ? 'PUT' : 'POST';
            
            // Form verilerini sayısal değerlere dönüştür
            const data = {
                ...formData,
                size: parseFloat(formData.size),
                price: parseFloat(formData.price)
            };
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || 'İşlem başarısız');
                return;
            }

            toast.success(editingPackage ? 'Ambalaj güncellendi' : 'Ambalaj eklendi');
            setShowModal(false);
            setEditingPackage(null);
            setFormData({ size: '', unit: 'L', price: '' });
            loadPackages();
        } catch (error) {
            console.error('Ambalaj kaydedilirken hata:', error);
            toast.error('Ambalaj kaydedilemedi: ' + error.message);
        }
    };

    const handleEdit = (pkg) => {
        setEditingPackage(pkg);
        setFormData({
            size: pkg.size,
            unit: pkg.unit,
            price: pkg.price
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu ambalajı silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/packages/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Silme işlemi başarısız');

            loadPackages();
        } catch (error) {
            console.error('Ambalaj silinirken hata:', error);
        }
    };

    // Yedekleme işlemleri
    const handleBackup = async (type) => {
        const path = backupPath;
        setBackupStatus({
            isLoading: true,
            progress: 0,
            message: 'Yedekleme başlatıldı...',
            error: '',
            path: '',
            size: 0
        });

        try {
            const response = await fetch(`http://localhost:3001/api/backup/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ backupPath: path })
            });
            
            if (!response.ok) {
                throw new Error('Yedekleme sırasında bir hata oluştu');
            }
            
            const data = await response.json();
            
            setBackupStatus({
                isLoading: false,
                progress: 100,
                message: 'Yedekleme başarıyla tamamlandı!',
                path: data.path,
                size: data.size || 0,
                error: ''
            });
        } catch (error) {
            setBackupStatus({
                isLoading: false,
                progress: 0,
                message: '',
                error: error.message,
                path: '',
                size: 0
            });
        }
    };

    // Geri yükleme işlemi
    const handleRestore = async () => {
        if (!selectedFile) {
            alert('Lütfen bir yedek dosyası seçin');
            return;
        }

        setBackupStatus({
            isLoading: true,
            progress: 0,
            message: 'Geri yükleme başlatıldı...',
            error: '',
            path: '',
            size: 0
        });

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('http://localhost:3001/api/backup/restore-file', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Geri yükleme sırasında bir hata oluştu');
            }
            
            const data = await response.json();
            
            setBackupStatus({
                isLoading: false,
                progress: 100,
                message: 'Geri yükleme başarıyla tamamlandı!',
                path: selectedFile.name,
                size: selectedFile.size || 0,
                error: ''
            });

            setSelectedFile(null);
        } catch (error) {
            setBackupStatus({
                isLoading: false,
                progress: 0,
                message: '',
                error: error.message,
                path: '',
                size: 0
            });
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Fiyat güncelleme fonksiyonu
    const handleUpdatePrice = async (id, newPrice, type) => {
        try {
            const url = type === 'stock' 
                ? `http://localhost:3001/api/stock/${id}/price`
                : `http://localhost:3001/api/packages/${id}/price`;
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_price: parseFloat(newPrice) })
            });

            if (!response.ok) {
                throw new Error('Fiyat güncellenemedi');
            }
            
            // Tüm reçete fiyatlarını güncelle
            const updateResponse = await fetch('http://localhost:3001/api/recipes/update-prices', {
                method: 'POST'
            });

            if (!updateResponse.ok) {
                throw new Error('Reçete fiyatları güncellenemedi');
            }

            const result = await updateResponse.json();
            
            toast.success(`Fiyat güncellendi. ${result.updatedCount} reçete güncellendi.`);
            
            // Listeleri yenile
            loadPackages();
            loadStock();
        } catch (error) {
            console.error('Fiyat güncelleme hatası:', error);
            toast.error(error.message);
        }
    };

    // Fiyat geçmişi görüntüleme fonksiyonu
    const loadPriceHistory = async (id, type) => {
        try {
            const url = type === 'stock' 
                ? `http://localhost:3001/api/stock/${id}/price-history`
                : `http://localhost:3001/api/packages/${id}/price-history`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Fiyat geçmişi alınamadı');
            
            const history = await response.json();
            setPriceHistory(history);
            setSelectedItem({ id, type });
            setShowPriceHistory(true);
        } catch (error) {
            console.error('Fiyat geçmişi yükleme hatası:', error);
            toast.error(error.message);
        }
    };

    // Ayarları kaydet
    const handleSaveSettings = async () => {
        try {
            // Sayısal değerlere dönüştür
            const settingsData = {
                dolar_kuru: parseFloat(settings.dolar_kuru) || 0,
                liste_a_kar_orani: parseFloat(settings.liste_a_kar_orani) || 20,
                liste_b_kar_orani: parseFloat(settings.liste_b_kar_orani) || 35,
                liste_c_kar_orani: parseFloat(settings.liste_c_kar_orani) || 50
            };

            // Ayarları kaydet
            const response = await fetch('http://localhost:3001/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ayarlar kaydedilemedi');
            }
            
            const result = await response.json();
            
            // Reçete fiyatlarını güncelle
            const updateResponse = await fetch('http://localhost:3001/api/recipes/update-prices', {
                method: 'POST'
            });

            if (!updateResponse.ok) {
                throw new Error('Reçete fiyatları güncellenemedi');
            }

            const updateResult = await updateResponse.json();
            toast.success(`${result.message} ve ${updateResult.updatedCount} reçete güncellendi.`);
            
            // Ayarları yeniden yükle
            loadSettings();
        } catch (error) {
            console.error('Ayarlar kaydedilirken hata:', error);
            toast.error(error.message || 'Ayarlar kaydedilemedi');
        }
    };

    // Teklif ayarlarını güncelle
    const handleTeklifSettingsUpdate = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/teklif-settings/${teklifSettings.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teklifSettings)
            });

            if (!response.ok) throw new Error('Teklif ayarları güncellenemedi');
            
            toast.success('Teklif ayarları güncellendi');
        } catch (error) {
            console.error('Teklif ayarları güncellenirken hata:', error);
            toast.error('Teklif ayarları güncellenemedi');
        }
    };

    return (
        <div className="space-y-6">
            {/* Başlık */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400 text-sm">Sistem ayarları ve ambalaj yönetimi</p>
                </div>
            </div>

            {/* Fiyatlandırma Ayarları */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Fiyatlandırma Ayarları</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dolar Kuru */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Dolar Kuru (₺)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={settings.dolar_kuru}
                                onChange={(e) => setSettings({...settings, dolar_kuru: parseFloat(e.target.value)})}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* A Liste Kar Oranı */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                A Liste Kar Oranı (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.liste_a_kar_orani}
                                onChange={(e) => setSettings({...settings, liste_a_kar_orani: parseFloat(e.target.value)})}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                            />
                        </div>

                        {/* B Liste Kar Oranı */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                B Liste Kar Oranı (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.liste_b_kar_orani}
                                onChange={(e) => setSettings({...settings, liste_b_kar_orani: parseFloat(e.target.value)})}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                            />
                        </div>

                        {/* C Liste Kar Oranı */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                C Liste Kar Oranı (%)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={settings.liste_c_kar_orani}
                                onChange={(e) => setSettings({...settings, liste_c_kar_orani: parseFloat(e.target.value)})}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                            />
                        </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <div className="flex justify-end mt-4">
                        <Button 
                            onClick={handleSaveSettings}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Ayarları Kaydet
                        </Button>
                    </div>
                </div>
            </div>

            {/* Ambalaj Listesi */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Ambalaj Listesi</h2>
                        <button 
                            onClick={() => {
                                setEditingPackage(null);
                                setFormData({ size: '', unit: 'L', price: '' });
                                setShowModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                        >
                            <Plus size={20} />
                            <span>Yeni Ambalaj</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left p-4 text-slate-400">ID</th>
                                <th className="text-left p-4 text-slate-400">BOYUT</th>
                                <th className="text-left p-4 text-slate-400">BİRİM</th>
                                <th className="text-left p-4 text-slate-400">FİYAT</th>
                                <th className="text-left p-4 text-slate-400">İŞLEMLER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.length === 0 ? (
                                <tr className="border-b border-slate-700">
                                    <td colSpan="5" className="p-4 text-center text-slate-500">
                                        Henüz ambalaj kaydı bulunmuyor
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id} className="border-b border-slate-700">
                                        <td className="p-4 text-slate-300">{pkg.id}</td>
                                        <td className="p-4 text-slate-300">{pkg.size}</td>
                                        <td className="p-4 text-slate-300">{pkg.unit}</td>
                                        <td className="p-4 text-slate-300">₺{pkg.price}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEdit(pkg)}
                                                    className="p-1 hover:text-blue-500 text-slate-400"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(pkg.id)}
                                                    className="p-1 hover:text-red-500 text-slate-400"
                                                >
                                                    <Trash size={18} />
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

            {/* Yedekleme Bölümü */}
            <div className="bg-slate-800 rounded-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white">Sistem Yedekleme</h2>
                </div>
                <div className="p-4">
                    {/* Yedekleme Yolu */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Yedekleme Yolu
                        </label>
                        <input
                            type="text"
                            value={backupPath}
                            onChange={(e) => setBackupPath(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                            placeholder="Örn: C:\yedekler"
                        />
                    </div>

                    {/* Yedekleme Kartları */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Veritabanı Yedekleme */}
                        <div className="bg-slate-700 p-6 rounded-lg">
                            <div className="flex items-center justify-center mb-4">
                                <Database className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-white mb-4">Veritabanı Yedekleme</h3>
                            <button 
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                onClick={() => handleBackup('database')}
                                disabled={backupStatus.isLoading}
                            >
                                <Database size={20} />
                                <span>Yedekle</span>
                            </button>
                        </div>

                        {/* Tam Sistem Yedekleme */}
                        <div className="bg-slate-700 p-6 rounded-lg">
                            <div className="flex items-center justify-center mb-4">
                                <Archive className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-white mb-4">Tam Sistem Yedekleme</h3>
                            <button 
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                                onClick={() => handleBackup('full')}
                                disabled={backupStatus.isLoading}
                            >
                                <Archive size={20} />
                                <span>Yedekle</span>
                            </button>
                        </div>

                        {/* Geri Yükleme */}
                        <div className="bg-slate-700 p-6 rounded-lg">
                            <div className="flex items-center justify-center mb-4">
                                <RotateCcw className="w-8 h-8 text-amber-400" />
                            </div>
                            <h3 className="text-center text-lg font-medium text-white mb-4">Geri Yükleme</h3>
                            <div className="space-y-4">
                                <input
                                    type="file"
                                    accept=".sqlite"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-white hover:file:bg-slate-500"
                                />
                                <button 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors"
                                    onClick={handleRestore}
                                    disabled={!selectedFile || backupStatus.isLoading}
                                >
                                    <Upload size={20} />
                                    <span>Geri Yükle</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* İşlem Durumu */}
                    {(backupStatus.isLoading || backupStatus.message || backupStatus.error) && (
                        <div className="mt-6 p-4 bg-slate-700 rounded-lg">
                            {backupStatus.isLoading && (
                                <div className="flex items-center gap-2 text-slate-300">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                    <span>{backupStatus.message}</span>
                                </div>
                            )}
                            {backupStatus.message && !backupStatus.isLoading && !backupStatus.error && (
                                <div className="text-green-400">
                                    <p>{backupStatus.message}</p>
                                    {backupStatus.path && (
                                        <p className="text-sm mt-1">
                                            Dosya: {backupStatus.path} ({formatBytes(backupStatus.size)})
                                        </p>
                                    )}
                                </div>
                            )}
                            {backupStatus.error && (
                                <div className="text-red-400">
                                    <p>{backupStatus.error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Ambalaj Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                {editingPackage ? 'Ambalaj Düzenle' : 'Yeni Ambalaj'}
                            </h3>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-300"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Boyut
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Birim
                                </label>
                                <select
                                    value={formData.unit}
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 focus:outline-none focus:border-slate-500"
                                    required
                                >
                                    <option value="L">Litre</option>
                                    <option value="Kg">Kilogram</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Fiyat
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                                >
                                    {editingPackage ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Fiyat Geçmişi Modal */}
            {showPriceHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-slate-800 rounded-lg p-6 w-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white">
                                Fiyat Geçmişi
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPriceHistory(false)}
                                className="text-slate-400 hover:text-red-400"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                        <div className="overflow-y-auto max-h-[400px]">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-slate-700">
                                        <th className="pb-4">Tarih</th>
                                        <th className="pb-4">Eski Fiyat</th>
                                        <th className="pb-4">Yeni Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {priceHistory.map((history, index) => (
                                        <tr key={index} className="border-b border-slate-700">
                                            <td className="py-4 text-white">
                                                {new Date(history.update_date).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="py-4 text-white">
                                                {history.old_price.toFixed(2)} TL
                                            </td>
                                            <td className="py-4 text-white">
                                                {history.new_price.toFixed(2)} TL
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Teklif Formu Ayarları */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Teklif Formu Ayarları</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Firma Bilgileri */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Firma Bilgileri</h3>
                        <Input
                            label="Firma Adı"
                            value={teklifSettings.firma_adi}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_adi: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Textarea
                            label="Firma Adresi"
                            value={teklifSettings.firma_adresi}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_adresi: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="Telefon"
                            value={teklifSettings.firma_telefon}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_telefon: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="E-mail"
                            value={teklifSettings.firma_email}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_email: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="Web Sitesi"
                            value={teklifSettings.firma_web}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_web: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="Vergi Dairesi"
                            value={teklifSettings.firma_vergi_dairesi}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_vergi_dairesi: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="Vergi No"
                            value={teklifSettings.firma_vergi_no}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                firma_vergi_no: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                    </div>

                    {/* Teklif Ayarları */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-white">Teklif Ayarları</h3>
                        <Textarea
                            label="Teklif Üst Notu"
                            value={teklifSettings.teklif_notu}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                teklif_notu: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Input
                            label="Teklif Geçerlilik Süresi"
                            value={teklifSettings.teklif_gecerlilik}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                teklif_gecerlilik: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Textarea
                            label="Teklif Şartları"
                            value={teklifSettings.teklif_sartlari}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                teklif_sartlari: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white h-32"
                        />
                        <Textarea
                            label="Banka Bilgileri"
                            value={teklifSettings.banka_bilgileri}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                banka_bilgileri: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                        <Textarea
                            label="Teklif Alt Notu"
                            value={teklifSettings.teklif_alt_not}
                            onChange={(e) => setTeklifSettings({
                                ...teklifSettings,
                                teklif_alt_not: e.target.value
                            })}
                            className="bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <Button
                        onClick={handleTeklifSettingsUpdate}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Teklif Ayarlarını Kaydet
                    </Button>
                </div>
            </div>
        </div>
    );
} 