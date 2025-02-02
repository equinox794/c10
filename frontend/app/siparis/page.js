'use client';

import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Badge,
    Calendar,
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import { 
    Plus, Download, Search, Filter, Calendar as CalendarIcon,
    Edit2, Trash2, Eye, FileText, Clock, CheckCircle, XCircle, Check, X, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function OrderPage() {
    // State tanımlamaları
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stock, setStock] = useState([]);
    const [dateRange, setDateRange] = useState({
        from: null,
        to: null
    });

    // Reçete için yeni state'ler
    const [recipes, setRecipes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');
    const [recipeMiktar, setRecipeMiktar] = useState({});
    const [recipeAdet, setRecipeAdet] = useState({});
    const [recipeChargeCount, setRecipeChargeCount] = useState({});
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState('');
    const [quantity, setQuantity] = useState('');
    const [calculatedRecipes, setCalculatedRecipes] = useState([]);
    
    // Fiyatlandırma için yeni state'ler
    const [selectedPriceList, setSelectedPriceList] = useState('C');
    const [settings, setSettings] = useState({
        dolar_kuru: 0,
        liste_a_kar_orani: 10,  // A listesi en ucuz
        liste_b_kar_orani: 20,  // B listesi orta
        liste_c_kar_orani: 30   // C listesi en pahalı
    });

    // Yeni state ekleyelim
    const [isPriceUpdateNeeded, setIsPriceUpdateNeeded] = useState(false);
    const [priceUpdateDetails, setPriceUpdateDetails] = useState(null);

    // State tanımlamalarına ekle
    const [teklifMusterisi, setTeklifMusterisi] = useState('');
    const [paraBirimi, setParaBirimi] = useState('TL');
    const [teklifUrunleri, setTeklifUrunleri] = useState([]);

    // İstatistikler
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Beklemede').length,
        approved: orders.filter(o => o.status === 'Onaylandı').length,
        cancelled: orders.filter(o => o.status === 'İptal').length,
        totalValue: orders.reduce((sum, order) => sum + order.total, 0)
    };

    // Durum badge'leri için renk mapping'i
    const statusColors = {
        'Beklemede': 'bg-yellow-500/10 text-yellow-500',
        'Onaylandı': 'bg-green-500/10 text-green-500',
        'İptal': 'bg-red-500/10 text-red-500'
    };

    // Veri yükleme fonksiyonları
    useEffect(() => {
        loadCustomers();
        loadPackages();
        loadRecipes();
        loadOrders();
        loadStock();
        loadSettings();
        checkPriceUpdates();
        const interval = setInterval(checkPriceUpdates, 1800000); // Her 30 dakikada bir
        return () => clearInterval(interval);
    }, []);

    const loadCustomers = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/customers');
            if (!response.ok) throw new Error('Müşteri listesi alınamadı');
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Müşteri listesi alınamadı:', error);
            toast.error('Müşteri listesi yüklenirken hata oluştu');
        }
    };

    const loadPackages = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/packages');
            if (!response.ok) throw new Error('Ambalaj listesi alınamadı');
            const data = await response.json();
            setPackages(data);
        } catch (error) {
            console.error('Ambalaj listesi alınamadı:', error);
            toast.error('Ambalaj listesi yüklenirken hata oluştu');
        }
    };

    const loadRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/recipes');
            if (!response.ok) throw new Error('Reçete listesi alınamadı');
            const data = await response.json();
            console.log('Loaded recipes:', data.length); // Debug log
            setRecipes(data);
        } catch (error) {
            console.error('Reçete listesi alınamadı:', error);
            toast.error('Reçete listesi yüklenirken hata oluştu');
        }
    };

    const loadOrders = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/orders');
            if (!response.ok) throw new Error('Sipariş listesi alınamadı');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Sipariş listesi alınamadı:', error);
            toast.error('Sipariş listesi yüklenirken hata oluştu');
        }
    };

    const loadStock = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/stock');
            if (!response.ok) throw new Error('Stok listesi alınamadı');
            const data = await response.json();
            setStock(data);
        } catch (error) {
            console.error('Stok listesi alınamadı:', error);
            toast.error('Stok listesi yüklenirken hata oluştu');
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

    // Fiyat değişikliklerini kontrol eden fonksiyon
    const checkPriceUpdates = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/recipes/check-price-updates');
            if (!response.ok) {
                throw new Error('Fiyat kontrolü yapılamadı');
            }
            const recipes = await response.json();
            
            if (recipes && recipes.length > 0) {
                setIsPriceUpdateNeeded(true);
                setPriceUpdateDetails({
                    count: recipes.length,
                    recipes: recipes
                });
                toast.warning(`${recipes.length} reçetede fiyat güncellemesi gerekiyor!`, {
                    description: 'Lütfen "Fiyatları Güncelle" butonunu kullanın.',
                    duration: 5000
                });
            } else {
                setIsPriceUpdateNeeded(false);
                setPriceUpdateDetails(null);
            }
        } catch (error) {
            console.error('Fiyat kontrolü hatası:', error);
            setIsPriceUpdateNeeded(false);
            setPriceUpdateDetails(null);
        }
    };

    // Fiyat güncelleme fonksiyonunu güncelle
    const handleUpdatePrices = async () => {
        try {
            toast.info('Fiyatlar güncelleniyor...');

            const response = await fetch('http://localhost:3001/api/recipes/update-prices', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error);
            }
            
            // Güncelleme detaylarını göster
            toast.success(
                <div>
                    <p>Reçete fiyatları güncellendi</p>
                    <ul className="mt-2 text-sm">
                        <li>• Güncellenen reçete sayısı: {result.updatedCount}</li>
                        <li>• Hammadde fiyat değişimi: {result.rawMaterialChanges}</li>
                        <li>• Ambalaj fiyat değişimi: {result.packageChanges}</li>
                    </ul>
                </div>
            );

            setIsPriceUpdateNeeded(false);
            setPriceUpdateDetails(null);
            await loadRecipes(); // Reçeteleri yeniden yükle
            
        } catch (error) {
            console.error('Fiyat güncelleme hatası:', error);
            toast.error(`Hata: ${error.message}`);
        }
    };

    // Reçete filtreleme fonksiyonu
    const filteredRecipes = recipes.filter(recipe => {
        if (!recipe) return false;
        const matchesSearch = !recipeSearchTerm || recipe.name?.toLowerCase().includes(recipeSearchTerm.toLowerCase());
        const matchesCustomer = selectedCustomerFilter === 'all' || recipe.customer_id?.toString() === selectedCustomerFilter;
        return matchesSearch && matchesCustomer;
    });

    // Ambalajları ayrı satırlara bölen fonksiyon
    const expandRecipesByPackage = (recipes) => {
        if (!recipes || !Array.isArray(recipes)) return [];
        if (!packages || !Array.isArray(packages)) return recipes;

        const uniqueRecipes = [];
        const seenRecipes = new Set();

        recipes.forEach(recipe => {
            if (!recipe) return;
            
            const packageIds = recipe.packages || [];
            if (packageIds.length === 0) {
                if (!seenRecipes.has(recipe.id)) {
                    seenRecipes.add(recipe.id);
                    uniqueRecipes.push({
                        ...recipe,
                        displayId: `${recipe.id}-default`
                    });
                }
                return;
            }

            packageIds.forEach(pid => {
                const pkg = packages.find(p => p.id === pid);
                if (pkg && !seenRecipes.has(`${recipe.id}-${pkg.id}`)) {
                    seenRecipes.add(`${recipe.id}-${pkg.id}`);
                    uniqueRecipes.push({
                        ...recipe,
                        currentPackage: `${pkg.size} ${pkg.unit}`,
                        displayId: `${recipe.id}-${pkg.id}`
                    });
                }
            });
        });

        return uniqueRecipes;
    };

    const handleCreateOrder = async (recipe) => {
        const miktar = recipeMiktar[recipe.displayId];
        const chargeCount = recipeChargeCount[recipe.displayId];

        if (!miktar) {
            toast.error('Lütfen miktar giriniz');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: recipe.customer_id,
                    recipe_id: recipe.id,
                    quantity: parseFloat(miktar),
                    charge_count: parseFloat(chargeCount || 0),
                    status: 'Beklemede'
                })
            });

            if (!response.ok) {
                throw new Error('Sipariş oluşturulamadı');
            }

            const result = await response.json();
            toast.success(result.message);

            // Giriş alanlarını temizle
            setRecipeMiktar(prev => {
                const newState = { ...prev };
                delete newState[recipe.displayId];
                return newState;
            });
            setRecipeChargeCount(prev => {
                const newState = { ...prev };
                delete newState[recipe.displayId];
                return newState;
            });

            // Siparişleri yeniden yükle
            loadOrders();
        } catch (error) {
            console.error('Sipariş oluşturma hatası:', error);
            toast.error('Sipariş oluşturulurken bir hata oluştu');
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Sipariş durumu güncellenemedi');
            }

            toast.success('Sipariş durumu güncellendi');
            loadOrders();
        } catch (error) {
            console.error('Sipariş güncelleme hatası:', error);
            toast.error('Sipariş durumu güncellenirken bir hata oluştu');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (!confirm('Bu siparişi silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Sipariş silinemedi');
            }

            toast.success('Sipariş başarıyla silindi');
            loadOrders();
        } catch (error) {
            console.error('Sipariş silme hatası:', error);
            toast.error('Sipariş silinirken bir hata oluştu');
        }
    };

    const handleCalculateChargeCount = async (recipe) => {
        const miktar = recipeMiktar[recipe.displayId];
        if (!miktar) {
            toast.error('Lütfen önce adet giriniz');
            return;
        }

        try {
            // Reçete detaylarını al
            const response = await fetch(`http://localhost:3001/api/recipes/${recipe.id}`);
            if (!response.ok) throw new Error('Reçete detayları alınamadı');
            const recipeDetails = await response.json();
            
            // Şarj sayısını 5.5 ile çarp
            const inputChargeCount = parseFloat(miktar);
            const chargeCount = inputChargeCount * 5.5;
            
            // Şarj sayısını güncelle
            setRecipeChargeCount(prev => ({
                ...prev,
                [recipe.displayId]: chargeCount
            }));

            // Hesaplanan reçeteyi listeye ekle
            setCalculatedRecipes(prev => {
                // Eğer aynı reçete zaten varsa güncelle, yoksa ekle
                const index = prev.findIndex(r => r.id === recipe.id);
                const newRecipe = {
                    ...recipeDetails,
                    chargeCount: inputChargeCount, // Orijinal girilen değeri göster
                    calculatedIngredients: recipeDetails.ingredients.map(ing => ({
                        ...ing,
                        totalQuantity: (parseFloat(ing.quantity) * chargeCount).toFixed(2)
                    }))
                };

                if (index !== -1) {
                    const newList = [...prev];
                    newList[index] = newRecipe;
                    return newList;
                }
                return [...prev, newRecipe];
            });

            toast.success('Hesaplama tamamlandı');
        } catch (error) {
            console.error('Hesaplama hatası:', error);
            toast.error('Hesaplama yapılırken bir hata oluştu');
        }
    };

    // Hesaplanan tüm hammaddeleri topla
    const calculateTotalIngredients = () => {
        const totals = {};
        calculatedRecipes.forEach(recipe => {
            recipe.calculatedIngredients.forEach(ing => {
                if (!totals[ing.name]) {
                    totals[ing.name] = 0;
                }
                totals[ing.name] += parseFloat(ing.totalQuantity);
            });
        });
        return totals;
    };

    // Stok durumunu kontrol et ve eksik miktarı hesapla
    const calculateStockStatus = (ingredientName, requiredAmount) => {
        const stockItem = stock.find(item => item.name === ingredientName);
        if (!stockItem) return requiredAmount;
        const currentStock = parseFloat(stockItem.quantity);
        return Math.max(0, requiredAmount - currentStock);
    };

    // Dolar fiyatı hesaplama
    const calculateDolarPrice = (tlPrice) => {
        return settings.dolar_kuru > 0 ? tlPrice / settings.dolar_kuru : 0;
    };

    // Birim fiyat hesaplama
    const calculateUnitPrice = (recipe, packageInfo) => {
        if (!recipe || !packageInfo || !settings) return 0;

        try {
            // 1. Kg maliyeti hesapla (1000 kg başına maliyetten)
            const costPer1000kg = recipe.total_cost || 0;
            const costPerKg = costPer1000kg / 1000;

            // 2. Ambalaj bilgilerini al
            const packageSize = parseFloat(packageInfo[0]);
            const packageUnit = packageInfo[1];
            const currentPackageId = recipe.packages ? recipe.packages[0] : null;
            const currentPackage = packages.find(p => p.id === parseInt(currentPackageId));
            const packageCost = currentPackage ? currentPackage.price : 0;

            // 3. Birim maliyeti hesapla
            let ambalajMaliyet;
            if (packageUnit.toUpperCase() === 'L') {
                // Sıvı ürün - yoğunluk ile çarp
                const density = parseFloat(recipe.density) || 1.20;
                const litreMaliyet = costPerKg * density;
                ambalajMaliyet = (litreMaliyet * packageSize) + packageCost;
            } else {
                // Toz/Katı ürün - yoğunluk kullanma
                ambalajMaliyet = (costPerKg * packageSize) + packageCost;
            }

            // 4. Kar oranlarını kademeli uygula
            const aListeFiyat = ambalajMaliyet * (1 + (settings.liste_a_kar_orani / 100));  // En ucuz
            const bListeFiyat = aListeFiyat * (1 + (settings.liste_b_kar_orani / 100));     // Orta
            const cListeFiyat = bListeFiyat * (1 + (settings.liste_c_kar_orani / 100));     // En pahalı

            // 5. Seçilen listeye göre fiyatı döndür
            switch (selectedPriceList) {
                case 'A':
                    return aListeFiyat;
                case 'B':
                    return bListeFiyat;
                case 'C':
                default:
                    return cListeFiyat;
            }

        } catch (error) {
            console.error('Birim fiyat hesaplama hatası:', error);
            return 0;
        }
    };

    // Filtreleme
    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            customers.find(c => c.id === order.customer_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipes.find(r => r.id === order.recipe_id)?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const handleAddOrder = async (recipe) => {
        const adet = recipeAdet[recipe.displayId];
        if (!adet || adet <= 0) {
            toast.error('Lütfen geçerli bir adet giriniz');
            return;
        }

        try {
            // Birim fiyatı hesapla
            const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
            const birimFiyat = calculateUnitPrice(recipe, packageInfo);
            const toplamTutar = birimFiyat * parseFloat(adet);

            const response = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: recipe.customer_id,
                    recipe_id: recipe.id,
                    quantity: parseFloat(adet),
                    total: toplamTutar,
                    status: 'Beklemede'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Sipariş oluşturulamadı');
            }

            toast.success('Sipariş başarıyla oluşturuldu');
            loadOrders();
            
            // Adet input'unu temizle
            setRecipeAdet(prev => ({
                ...prev,
                [recipe.displayId]: ''
            }));
        } catch (error) {
            console.error('Sipariş oluşturma hatası:', error);
            toast.error('Sipariş oluşturulurken hata oluştu');
        }
    };

    // PDF oluşturma fonksiyonu
    const handleTeklifOlustur = async () => {
        if (!teklifMusterisi.trim()) {
            toast.error('Lütfen müşteri adı girin');
            return;
        }

        const secilenUrunler = Object.entries(recipeAdet)
            .filter(([_, adet]) => adet && adet > 0)
            .map(([displayId, adet]) => {
                const recipe = expandRecipesByPackage(filteredRecipes).find(r => r.displayId === displayId);
                if (!recipe) return null;
                
                const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
                const birimFiyat = calculateUnitPrice(recipe, packageInfo);
                
                return {
                    urunAdi: recipe.name,
                    miktar: adet,
                    birim: packageInfo[1],
                    paket: recipe.currentPackage || '-',
                    birimFiyat: paraBirimi === 'TL' ? birimFiyat : calculateDolarPrice(birimFiyat),
                    toplamFiyat: paraBirimi === 'TL' ? 
                        (birimFiyat * adet) : 
                        (calculateDolarPrice(birimFiyat) * adet)
                };
            })
            .filter(Boolean);

        if (secilenUrunler.length === 0) {
            toast.error('Lütfen en az bir ürün seçin');
            return;
        }

        try {
            toast.info('Teklif formu hazırlanıyor...');
            console.log('Gönderilen veri:', {
                musteriAdi: teklifMusterisi,
                paraBirimi,
                urunler: secilenUrunler,
                tarih: new Date().toLocaleDateString('tr-TR')
            });

            const response = await fetch('http://localhost:3001/api/teklif/create-pdf', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    musteriAdi: teklifMusterisi,
                    paraBirimi,
                    urunler: secilenUrunler,
                    tarih: new Date().toLocaleDateString('tr-TR')
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'PDF oluşturulamadı');
            }

            // PDF'i indir
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Teklif_${teklifMusterisi}_${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.pdf`;
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(link);

            toast.success('Teklif formu başarıyla indirildi');
            
            // Input'ları temizle
            setTeklifMusterisi('');
            setRecipeAdet({});
        } catch (error) {
            console.error('Teklif oluşturma hatası:', error);
            toast.error(`Teklif formu oluşturulamadı: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="p-6">
                <div className="max-w-[2000px] mx-auto">
                    {/* Fiyat güncelleme uyarısı */}
                    {isPriceUpdateNeeded && (
                        <div className="bg-yellow-500/10 text-yellow-500 p-4 rounded-lg mb-4">
                            <div className="flex items-center gap-2">
                                <RotateCcw className="w-5 h-5" />
                                <span className="font-medium">Dikkat!</span>
                            </div>
                            <p className="mt-1">
                                Hammadde veya ambalaj fiyatlarında değişiklik tespit edildi.
                                {priceUpdateDetails && (
                                    <ul className="mt-2 text-sm">
                                        {priceUpdateDetails.recipes.map((recipe, index) => (
                                            <li key={index}>• {recipe.name} reçetesinde {priceUpdateDetails.count} hammaddede fiyat değişikliği</li>
                                        ))}
                                    </ul>
                                )}
                            </p>
                            <Button
                                onClick={handleUpdatePrices}
                                className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Fiyatları Güncelle
                            </Button>
                        </div>
                    )}

                    {/* Başlık ve İstatistikler */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Sipariş & Teklif Yönetimi</h1>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <span className="text-slate-400">Toplam Sipariş:</span>
                                    <span className="ml-2 font-semibold">{stats.total}</span>
                                </div>
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <span className="text-slate-400">Bekleyen:</span>
                                    <span className="ml-2 font-semibold text-yellow-500">{stats.pending}</span>
                                </div>
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <span className="text-slate-400">Onaylanan:</span>
                                    <span className="ml-2 font-semibold text-green-500">{stats.approved}</span>
                                </div>
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <span className="text-slate-400">İptal:</span>
                                    <span className="ml-2 font-semibold text-red-500">{stats.cancelled}</span>
                                </div>
                                <div className="bg-slate-800 rounded-lg px-4 py-2">
                                    <span className="text-slate-400">Toplam Değer:</span>
                                    <span className="ml-2 font-semibold">{stats.totalValue.toLocaleString('tr-TR')} TL</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {/* Arama */}
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Sipariş ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-64 bg-slate-900 border-slate-700 text-white pl-10"
                                />
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            </div>

                            {/* Durum Filtresi */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-40 bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Durum" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    <SelectItem value="all" className="text-white">Tümü</SelectItem>
                                    <SelectItem value="Beklemede" className="text-white">Beklemede</SelectItem>
                                    <SelectItem value="Onaylandı" className="text-white">Onaylandı</SelectItem>
                                    <SelectItem value="İptal" className="text-white">İptal</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Tarih Filtresi */}
                            <Popover>
                                <PopoverTrigger>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-[280px] justify-start text-left font-normal bg-slate-900 border-slate-700 text-white",
                                            !dateRange && "text-slate-400"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "d LLL", { locale: tr })} -{" "}
                                                    {format(dateRange.to, "d LLL", { locale: tr })}
                                                </>
                                            ) : (
                                                format(dateRange.from, "d LLL", { locale: tr })
                                            )
                                        ) : (
                                            <span>Tarih seçin</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={dateRange.from}
                                        selected={dateRange}
                                        onSelect={setDateRange}
                                        numberOfMonths={2}
                                        locale={tr}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Sipariş Listesi */}
                    <div className="mt-8">
                        {/* Siparişler Tablosu */}
                        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                            <TableHead className="text-slate-400">Sipariş No</TableHead>
                                            <TableHead className="text-slate-400">Müşteri</TableHead>
                                            <TableHead className="text-slate-400">Ürün</TableHead>
                                            <TableHead className="text-slate-400">Ambalaj</TableHead>
                                            <TableHead className="text-slate-400">Adet</TableHead>
                                            <TableHead className="text-slate-400">Birim Fiyat (TL)</TableHead>
                                            <TableHead className="text-slate-400">Tutar</TableHead>
                                            <TableHead className="text-slate-400">Durum</TableHead>
                                            <TableHead className="text-slate-400">İşlem</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.map((order) => {
                                            const recipe = recipes.find(r => r.id === order.recipe_id);
                                            const packageInfo = recipe?.packages?.[0] ? packages.find(p => p.id === parseInt(recipe.packages[0])) : null;
                                            const birimFiyat = order.total / order.quantity;
                                            
                                            return (
                                                <TableRow key={order.id} className="border-slate-700 hover:bg-slate-800/50">
                                                    <TableCell className="font-medium text-slate-300">#{order.id}</TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {customers.find(c => c.id === order.customer_id)?.name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {recipe?.name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {packageInfo ? `${packageInfo.size} ${packageInfo.unit}` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">{order.quantity}</TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {birimFiyat.toLocaleString('tr-TR')} TL
                                                    </TableCell>
                                                    <TableCell className="text-slate-300">
                                                        {order.total.toLocaleString('tr-TR')} TL
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusColors[order.status]}>
                                                            {order.status === 'Beklemede' && <Clock className="w-4 h-4 mr-1" />}
                                                            {order.status === 'Onaylandı' && <CheckCircle className="w-4 h-4 mr-1" />}
                                                            {order.status === 'İptal' && <XCircle className="w-4 h-4 mr-1" />}
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {order.status === 'Beklemede' && (
                                                                <>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        className="text-slate-400 hover:text-green-500"
                                                                        onClick={() => handleUpdateStatus(order.id, 'Onaylandı')}
                                                                    >
                                                                        <Check size={18} />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon"
                                                                        className="text-slate-400 hover:text-red-500"
                                                                        onClick={() => handleUpdateStatus(order.id, 'İptal')}
                                                                    >
                                                                        <X size={18} />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-slate-400 hover:text-red-500"
                                                                onClick={() => handleDeleteOrder(order.id)}
                                                            >
                                                                <Trash2 size={18} />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Reçete Tablosu */}
                        <div className="mt-8 bg-slate-800 rounded-lg p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-semibold text-white">Kayıtlı Reçeteler</h2>
                                    
                                    {/* Firma Seçim Alanı */}
                                    <div className="relative">
                                        <Select 
                                            value={selectedCustomer}
                                            onValueChange={setSelectedCustomer}
                                        >
                                            <SelectTrigger className="w-[200px] bg-slate-900 border-slate-700 text-white">
                                                <SelectValue placeholder="Firma Seç" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                {customers
                                                    .filter(c => c.type === 'Müşteri' || c.type === 'Bioplant')
                                                    .map((customer) => (
                                                        <SelectItem 
                                                            key={customer.id} 
                                                            value={customer.id.toString()}
                                                            className="text-white hover:bg-slate-700"
                                                        >
                                                            {customer.name}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {/* Arama Kutusu */}
                                    <div className="relative w-64">
                                        <Input
                                            type="text"
                                            placeholder="Reçete ara..."
                                            value={recipeSearchTerm}
                                            onChange={(e) => setRecipeSearchTerm(e.target.value)}
                                            className="w-full bg-slate-900 border-slate-700 text-white pl-10"
                                        />
                                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                                    </div>
                                    
                                    {/* Liste Seçimi */}
                                    <Select 
                                        value={selectedPriceList}
                                        onValueChange={setSelectedPriceList}
                                    >
                                        <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
                                            <SelectValue placeholder="Liste seçin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="C" className="text-white">C Liste</SelectItem>
                                            <SelectItem value="B" className="text-white">B Liste</SelectItem>
                                            <SelectItem value="A" className="text-white">A Liste</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Firma Filtresi */}
                                    <Select 
                                        value={selectedCustomerFilter}
                                        onValueChange={setSelectedCustomerFilter}
                                    >
                                        <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
                                            <SelectValue placeholder="Firma seçin" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all" className="text-white">
                                                Hepsi
                                            </SelectItem>
                                            {customers.map(customer => (
                                                <SelectItem 
                                                    key={customer.id} 
                                                    value={customer.id.toString()}
                                                    className="text-white"
                                                >
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-slate-400 border-b border-slate-700">
                                            <th className="pb-4">
                                                <div className="flex items-center gap-2">
                                                    <span>Şarj Sayısı</span>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                                                        onClick={() => {
                                                            // Şarj sayısı girilmiş tüm reçeteleri hesapla
                                                            const recipesToCalculate = expandRecipesByPackage(filteredRecipes)
                                                                .filter(recipe => recipeMiktar[recipe.displayId]);
                                                            
                                                            if (recipesToCalculate.length === 0) {
                                                                toast.error('Lütfen en az bir reçete için şarj sayısı girin');
                                                                return;
                                                            }

                                                            // Tüm reçeteleri hesapla
                                                            Promise.all(recipesToCalculate.map(async (recipe) => {
                                                                try {
                                                                    const response = await fetch(`http://localhost:3001/api/recipes/${recipe.id}`);
                                                                    if (!response.ok) throw new Error('Reçete detayları alınamadı');
                                                                    const recipeDetails = await response.json();
                                                                    
                                                                    // Şarj sayısını 5.5 ile çarp
                                                                    const inputChargeCount = parseFloat(recipeMiktar[recipe.displayId]);
                                                                    const chargeCount = inputChargeCount * 5.5;
                                                                    
                                                                    return {
                                                                        ...recipeDetails,
                                                                        chargeCount: inputChargeCount, // Orijinal girilen değeri göster
                                                                        calculatedIngredients: recipeDetails.ingredients.map(ing => ({
                                                                            ...ing,
                                                                            totalQuantity: (parseFloat(ing.quantity) * chargeCount).toFixed(2)
                                                                        }))
                                                                    };
                                                                } catch (error) {
                                                                    console.error('Hesaplama hatası:', error);
                                                                    throw error;
                                                                }
                                                            }))
                                                            .then(calculatedResults => {
                                                                setCalculatedRecipes(calculatedResults);
                                                                toast.success('Tüm reçeteler hesaplandı');
                                                            })
                                                            .catch(error => {
                                                                toast.error('Hesaplama sırasında bir hata oluştu');
                                                            });
                                                        }}
                                                    >
                                                        Hesapla
                                                    </Button>
                                                </div>
                                            </th>
                                            <th className="pb-4 w-24">
                                                <div className="flex flex-col gap-2">
                                                    <span>Adet</span>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
                                                        onClick={() => {
                                                            if (!selectedCustomer) {
                                                                toast.error('Lütfen bir müşteri seçin');
                                                                return;
                                                            }

                                                            const recipesToAdd = expandRecipesByPackage(filteredRecipes)
                                                                .filter(recipe => recipeAdet[recipe.displayId]);
                                                            
                                                            if (recipesToAdd.length === 0) {
                                                                toast.error('Lütfen en az bir reçete için adet girin');
                                                                return;
                                                            }

                                                            Promise.all(recipesToAdd.map(async (recipe) => {
                                                                try {
                                                                    const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
                                                                    const birimFiyat = calculateUnitPrice(recipe, packageInfo);
                                                                    const adet = parseFloat(recipeAdet[recipe.displayId]);
                                                                    const toplamTutar = birimFiyat * adet;
                                                                    
                                                                    const response = await fetch('http://localhost:3001/api/orders', {
                                                                        method: 'POST',
                                                                        headers: { 
                                                                            'Content-Type': 'application/json',
                                                                            'Accept': 'application/json'
                                                                        },
                                                                        body: JSON.stringify({
                                                                            customer_id: parseInt(selectedCustomer),
                                                                            recipe_id: recipe.id,
                                                                            quantity: adet,
                                                                            total: toplamTutar,
                                                                            status: 'Beklemede'
                                                                        })
                                                                    });

                                                                    if (!response.ok) {
                                                                        throw new Error('Sipariş oluşturulamadı');
                                                                    }

                                                                    return response.json();
                                                                } catch (error) {
                                                                    throw error;
                                                                }
                                                            }))
                                                            .then(() => {
                                                                toast.success('Tüm siparişler başarıyla oluşturuldu');
                                                                loadOrders();
                                                                // Adet input'larını temizle
                                                                setRecipeAdet({});
                                                            })
                                                            .catch(error => {
                                                                console.error('Sipariş oluşturma hatası:', error);
                                                                toast.error('Siparişler oluşturulurken hata oluştu');
                                                            });
                                                        }}
                                                    >
                                                        Sipariş Ekle
                                                    </Button>
                                                </div>
                                            </th>
                                            <th className="pb-4">Ürün Adı</th>
                                            <th className="pb-4">Firma</th>
                                            <th className="pb-4">Ambalaj</th>
                                            <th className="pb-4">Maliyet (TL)</th>
                                            <th className="pb-4">Birim Fiyat (TL)</th>
                                            <th className="pb-4">Dolar Fiyatı ($)</th>
                                            <th className="pb-4 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expandRecipesByPackage(filteredRecipes).map(recipe => (
                                            <tr key={recipe.displayId || recipe.id} className="border-b border-slate-700">
                                                <td className="py-4">
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        min="0"
                                                        value={recipeMiktar[recipe.displayId] || ''}
                                                        onChange={(e) => setRecipeMiktar({
                                                            ...recipeMiktar,
                                                            [recipe.displayId]: e.target.value
                                                        })}
                                                        className="w-20 text-right bg-white text-black"
                                                    />
                                                </td>
                                                <td className="py-4">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={recipeAdet[recipe.displayId] || ''}
                                                        onChange={(e) => setRecipeAdet({
                                                            ...recipeAdet,
                                                            [recipe.displayId]: e.target.value
                                                        })}
                                                        className="w-20 text-right bg-white text-black"
                                                    />
                                                </td>
                                                <td className="py-4 text-white">{recipe.name}</td>
                                                <td className="py-4 text-white">
                                                    {customers.find(c => c.id === recipe.customer_id)?.name || '-'}
                                                </td>
                                                <td className="py-4 text-white">
                                                    {recipe.currentPackage || recipe.packages.map(pid => {
                                                        const pkg = packages.find(p => p.id === parseInt(pid));
                                                        return pkg ? `${pkg.size} ${pkg.unit}` : '';
                                                    }).join(', ')}
                                                </td>
                                                <td className="py-4 text-white">
                                                    {recipe.total_cost ? recipe.total_cost.toFixed(2) : '0.00'} TL
                                                </td>
                                                <td className="py-4 text-white">
                                                    {(() => {
                                                        const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
                                                        const unitPrice = calculateUnitPrice(recipe, packageInfo);
                                                        return unitPrice.toFixed(2);
                                                    })()} TL
                                                </td>
                                                <td className="py-4 text-white">
                                                    {(() => {
                                                        const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
                                                        const unitPrice = calculateUnitPrice(recipe, packageInfo);
                                                        return calculateDolarPrice(unitPrice).toFixed(2);
                                                    })()} $
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-slate-400 hover:text-blue-400"
                                                            onClick={() => handleCreateOrder(recipe)}
                                                        >
                                                            <Plus size={18} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Hesaplama sonuçları tablosu */}
                    {calculatedRecipes.length > 0 && (
                        <div className="mt-8 bg-slate-800 rounded-lg p-4 shadow-lg">
                            <h2 className="text-lg font-semibold text-white mb-3">Hesaplama Sonuçları</h2>
                            
                            <div className="bg-slate-700/30 rounded-lg p-3">
                                <h3 className="text-base font-medium text-white mb-2">Hammadde İhtiyacı ve Stok Durumu</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="text-left text-slate-400 border-b border-slate-700">
                                                <th className="pb-2 pr-4">Hammadde</th>
                                                <th className="pb-2 px-4 text-right w-32">Gereken (kg)</th>
                                                <th className="pb-2 pl-4 text-right w-32">Stok Durumu (kg)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(calculateTotalIngredients())
                                                .filter(([name]) => !name.toLowerCase().includes('su'))
                                                .map(([name, total], index) => {
                                                    const stockNeeded = calculateStockStatus(name, total);
                                                    return (
                                                        <tr key={index} className="border-b border-slate-700">
                                                            <td className="py-2 pr-4 text-white">{name}</td>
                                                            <td className="py-2 px-4 text-right text-white">{total.toFixed(2)}</td>
                                                            <td className={`py-2 pl-4 text-right font-medium ${stockNeeded > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                {stockNeeded.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Üst kısım */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-4">Kayıtlı Reçeteler</h1>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Select
                                    value={selectedCustomerFilter}
                                    onValueChange={setSelectedCustomerFilter}
                                >
                                    <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700">
                                        <SelectValue placeholder="Firma Seç" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="all" className="text-white">
                                            Tümü
                                        </SelectItem>
                                        {customers.map(customer => (
                                            <SelectItem 
                                                key={customer.id} 
                                                value={customer.id.toString()}
                                                className="text-white"
                                            >
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Teklif Müşterisi Input */}
                                <Input
                                    type="text"
                                    placeholder="Teklif Müşterisi"
                                    value={teklifMusterisi}
                                    onChange={(e) => setTeklifMusterisi(e.target.value)}
                                    className="w-[300px] bg-slate-800 border-slate-700 text-white"
                                />

                                {/* Para Birimi Seçimi */}
                                <Select
                                    value={paraBirimi}
                                    onValueChange={setParaBirimi}
                                >
                                    <SelectTrigger className="w-[100px] bg-slate-800 border-slate-700">
                                        <SelectValue placeholder="Para Birimi" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        <SelectItem value="TL" className="text-white">TL</SelectItem>
                                        <SelectItem value="USD" className="text-white">USD</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Teklif Oluştur Butonu */}
                                <Button
                                    onClick={handleTeklifOlustur}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Teklif Oluştur
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 