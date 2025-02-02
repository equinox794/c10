'use client';

import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
    Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Form, FormField, FormItem, FormLabel, FormControl,
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem,
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui';
import { 
    Plus, Trash2, Search, Save, Copy, Edit, Check, X,
    Home, Package, Users, FileText, ShoppingCart, Settings, ChevronLeft, RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import MultiPackagingSelector from '@/components/multi-packaging-selector';

export default function RecipePage() {
    // Mevcut state tanımlamaları korundu
    const [recipes, setRecipes] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [stock, setStock] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStock, setFilteredStock] = useState([]);
    const [chargeCount, setChargeCount] = useState(1);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [newRecipe, setNewRecipe] = useState({
        name: '',
        customer_id: '',
        density: '1.20',
        package_ids: [],
        ingredients: []
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingRecipeId, setEditingRecipeId] = useState(null);

    // Yeni state'ler ekliyorum
    const [recipeSearchTerm, setRecipeSearchTerm] = useState('');
    const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');

    // Menü öğeleri
    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/' },
        { name: 'Stok Yönetimi', icon: Package, path: '/stok' },
        { name: 'Cari Hesaplar', icon: Users, path: '/cari' },
        { name: 'Reçete Sistemi', icon: FileText, path: '/recete', active: true },
        { name: 'Sipariş & Teklif', icon: ShoppingCart, path: '/siparis' },
        { name: 'Ayarlar', icon: Settings, path: '/ayarlar' }
    ];

    // Mevcut useEffect ve fonksiyonlar korundu
    useEffect(() => {
        loadCustomers();
        loadPackages();
        loadStock();
        loadRecipes();
    }, []);

    // URL'den şarj sayısını ve reçete ID'sini al
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const recipeId = params.get('recipe_id');
        const count = params.get('charge_count');
        
        if (recipeId) setSelectedRecipeId(recipeId);
        if (count) setChargeCount(parseFloat(count));
    }, []);

    // Tüm mevcut fonksiyonlar korundu
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

    const loadRecipes = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/recipes');
            if (!response.ok) throw new Error('Reçete listesi alınamadı');
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error('Reçete listesi alınamadı:', error);
            toast.error('Reçete listesi yüklenirken hata oluştu');
        }
    };

    useEffect(() => {
        if (searchTerm.length >= 2) {
            const filtered = stock.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStock(filtered);
        } else {
            setFilteredStock([]);
        }
    }, [searchTerm, stock]);

    // Filtrelenmiş reçeteleri hesapla
    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(recipeSearchTerm.toLowerCase());
        const matchesCustomer = selectedCustomerFilter === 'all' || recipe.customer_id.toString() === selectedCustomerFilter;
        return matchesSearch && matchesCustomer;
    });

    // Ambalajları ayrı satırlara bölen fonksiyon
    const expandRecipesByPackage = (recipes) => {
        return recipes.flatMap(recipe => {
            const packageIds = recipe.packages || [];
            if (packageIds.length === 0) return [recipe];

            return packageIds.map(pid => {
                const pkg = packages.find(p => p.id === parseInt(pid));
                return {
                    ...recipe,
                    currentPackage: pkg ? `${pkg.size} ${pkg.unit}` : '',
                    displayId: `${recipe.id}-${pid}` // Benzersiz ID için
                };
            });
        });
    };

    // Diğer tüm işlevsel fonksiyonlar korundu
    const handleAddIngredient = (stockItem) => {
        if (newRecipe.ingredients.find(i => i.stock_id === stockItem.id)) {
            toast.error('Bu hammadde zaten eklenmiş');
            return;
        }

        setNewRecipe(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    stock_id: stockItem.id,
                    name: stockItem.name,
                    quantity: 0,
                    price: stockItem.price,
                    total: 0
                }
            ]
        }));
        setSearchTerm('');
        setFilteredStock([]);
    };

    const handleUpdateQuantity = (index, quantity) => {
        const ingredients = [...newRecipe.ingredients];
        ingredients[index] = {
            ...ingredients[index],
            quantity: parseFloat(quantity) || 0,
            total: (parseFloat(quantity) || 0) * ingredients[index].price
        };
        setNewRecipe(prev => ({ ...prev, ingredients }));
    };

    const handleRemoveIngredient = (index) => {
        const ingredients = newRecipe.ingredients.filter((_, i) => i !== index);
        setNewRecipe(prev => ({ ...prev, ingredients }));
    };

    const totals = newRecipe.ingredients.reduce((acc, curr) => ({
        quantity: acc.quantity + (parseFloat(curr.quantity) || 0),
        cost: acc.cost + (parseFloat(curr.total) || 0)
    }), { quantity: 0, cost: 0 });

    const handleSaveRecipe = async () => {
        if (!newRecipe.name || !newRecipe.customer_id) {
            toast.error('Ürün adı ve firma seçimi zorunludur');
            return;
        }

        if (newRecipe.package_ids.length === 0) {
            toast.error('En az bir ambalaj seçmelisiniz');
            return;
        }

        if (newRecipe.ingredients.length === 0) {
            toast.error('En az bir hammadde eklemelisiniz');
            return;
        }

        try {
            const url = isEditing 
                ? `http://localhost:3001/api/recipes/${editingRecipeId}`
                : 'http://localhost:3001/api/recipes';

            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newRecipe.name,
                    customer_id: parseInt(newRecipe.customer_id),
                    density: newRecipe.density,
                    packages: newRecipe.package_ids.map(id => parseInt(id)),
                    ingredients: newRecipe.ingredients,
                    is_price_updated: true // Yeni reçete veya güncelleme için fiyat güncel olarak işaretle
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || (isEditing ? 'Reçete güncellenemedi' : 'Reçete kaydedilemedi'));
            }

            toast.success(isEditing ? 'Reçete başarıyla güncellendi' : 'Reçete başarıyla kaydedildi');
            setIsEditing(false);
            setEditingRecipeId(null);
            setNewRecipe({
                name: '',
                customer_id: '',
                density: '1.20',
                package_ids: [],
                ingredients: []
            });
            loadRecipes();
        } catch (error) {
            console.error('Reçete işlem hatası:', error);
            toast.error(error.message);
        }
    };

    const handleEditRecipe = async (recipe) => {
        try {
            const response = await fetch(`http://localhost:3001/api/recipes/${recipe.id}`);
            if (!response.ok) throw new Error('Reçete detayları alınamadı');
            const recipeDetails = await response.json();

            const packageIds = Array.isArray(recipeDetails.packages) 
                ? recipeDetails.packages.map(p => p.toString())
                : [];

            setIsEditing(true);
            setEditingRecipeId(recipe.id);
            setNewRecipe({
                name: recipeDetails.name,
                customer_id: recipeDetails.customer_id.toString(),
                density: recipeDetails.density,
                package_ids: packageIds,
                ingredients: recipeDetails.ingredients || []
            });
        } catch (error) {
            console.error('Reçete düzenleme hatası:', error);
            toast.error('Reçete düzenlenirken bir hata oluştu');
        }
    };

    const handleDeleteRecipe = async (id) => {
        if (!confirm('Bu reçeteyi silmek istediğinize emin misiniz?')) return;

        try {
            const response = await fetch(`http://localhost:3001/api/recipes/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.status === 404) {
                throw new Error('Reçete bulunamadı');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Reçete silinemedi');
            }

            toast.success('Reçete başarıyla silindi');
            await loadRecipes(); // Listeyi yenile
        } catch (error) {
            console.error('Reçete silinirken hata:', error);
            toast.error(error.message || 'Reçete silinirken bir hata oluştu');
        }
    };

    const handleCopyRecipe = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/api/recipes/${id}/copy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Reçete kopyalanamadı');
            }

            toast.success('Reçete başarıyla kopyalandı');
            loadRecipes();
        } catch (error) {
            console.error('Reçete kopyalanırken hata:', error);
            toast.error(error.message || 'Reçete kopyalanırken bir hata oluştu');
        }
    };

    // Fiyat güncelleme fonksiyonu
    const handleUpdatePrices = async () => {
        try {
            // Güncelleme başladı bildirimi
            toast.info('Fiyatlar güncelleniyor...');

            const response = await fetch('http://localhost:3001/api/recipes/update-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Fiyatlar güncellenirken bir hata oluştu');
            }
            
            // Reçeteleri yeniden yükle
            await loadRecipes();
            
            // Başarılı mesajı göster
            toast.success(result.message || 'Reçete fiyatları başarıyla güncellendi');
        } catch (error) {
            console.error('Fiyat güncelleme hatası:', error);
            toast.error(`Hata: ${error.message}`);
        }
    };

    // Ambalaj seçimi değiştiğinde
    const handlePackageChange = (selectedIds) => {
        setNewRecipe(prev => ({
            ...prev,
            package_ids: selectedIds
        }));
    };

    // Seçili reçeteyi bul
    const selectedRecipe = recipes.find(r => r.id === parseInt(selectedRecipeId));

    // Hammadde miktarını şarj sayısı ile çarp
    const calculateAmount = (quantity) => {
        return (parseFloat(quantity) * chargeCount).toFixed(2);
    };

    return (
        <div className="min-h-screen bg-slate-900">
            <div className="p-6">
                {/* Reçete Detayları - En üstte göster */}
                {selectedRecipe && (
                    <div className="mb-6 bg-slate-800 rounded-lg p-6 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Reçete Detayları - {selectedRecipe.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">Şarj Sayısı: {chargeCount}</p>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-slate-400 border-b border-slate-700">
                                        <th className="pb-4">Hammadde</th>
                                        <th className="pb-4">Birim Miktar (kg)</th>
                                        <th className="pb-4">Toplam Miktar (kg)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedRecipe.ingredients?.map((ingredient, index) => (
                                        <tr key={index} className="border-b border-slate-700">
                                            <td className="py-4 text-white">{ingredient.name}</td>
                                            <td className="py-4 text-white">{ingredient.quantity}</td>
                                            <td className="py-4 font-semibold text-white">
                                                {calculateAmount(ingredient.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="py-4 text-right text-slate-400">Toplam:</td>
                                        <td className="py-4 font-bold text-white">
                                            {selectedRecipe.ingredients?.reduce((total, ing) => 
                                                total + parseFloat(calculateAmount(ing.quantity)), 0
                                            ).toFixed(2)} kg
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                )}

                {/* Yeni Reçete Formu */}
                <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-6">
                        {isEditing ? 'Reçete Düzenle' : 'Yeni Reçete'}
                    </h2>

                    <Form onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveRecipe();
                    }}>
                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Ürün Adı */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Ürün Adı</label>
                                <Input
                                    type="text"
                                    placeholder="Örn: Lexora Ca"
                                    value={newRecipe.name}
                                    onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-900 border-slate-700 text-white"
                                />
                            </div>

                            {/* Firma */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Firma</label>
                                <Select 
                                    value={newRecipe.customer_id}
                                    onValueChange={(value) => setNewRecipe(prev => ({ ...prev, customer_id: value }))}
                                >
                                    <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-white">
                                        <SelectValue placeholder="Firma seçin" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
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

                            {/* Yoğunluk */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Yoğunluk</label>
                                <Input
                                    type="text"
                                    value={newRecipe.density}
                                    onChange={(e) => setNewRecipe(prev => ({ ...prev, density: e.target.value }))}
                                    className="w-full bg-slate-900 border-slate-700 text-white"
                                />
                            </div>
                        </div>

                        {/* Ambalaj Seçimi */}
                        <div className="mb-6">
                            <label className="block text-sm text-slate-400 mb-2">Ambalaj</label>
                            <div className="sticky top-0 z-10 bg-slate-800 pb-2">
                                <MultiPackagingSelector
                                    packages={packages}
                                    selectedPackages={newRecipe.package_ids}
                                    onChange={handlePackageChange}
                                />
                            </div>
                        </div>

                        {/* Hammadde Arama */}
                        <div className="relative mb-6">
                            <Input
                                type="text"
                                placeholder="Hammadde ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border-slate-700 text-white pl-10"
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                            
                            {/* Arama Sonuçları */}
                            {filteredStock.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                                    {filteredStock.map(item => (
                                        <div
                                            key={item.id}
                                            className="p-3 hover:bg-slate-700 cursor-pointer text-white"
                                            onClick={() => handleAddIngredient(item)}
                                        >
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Hammaddeler Tablosu */}
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
                                    {newRecipe.ingredients.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-4 text-slate-400">
                                                Henüz hammadde eklenmemiş
                                            </td>
                                        </tr>
                                    ) : (
                                        newRecipe.ingredients.map((ingredient, index) => (
                                            <tr key={index} className="border-b border-slate-700">
                                                <td className="py-3 text-white">{ingredient.name}</td>
                                                <td className="py-3">
                                                    <Input
                                                        type="number"
                                                        value={ingredient.quantity}
                                                        onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                                                        className="w-24 bg-slate-900 border-slate-700 text-white"
                                                    />
                                                </td>
                                                <td className="py-3 text-white">{ingredient.price.toFixed(2)} TL</td>
                                                <td className="py-3 text-white">{ingredient.total.toFixed(2)} TL</td>
                                                <td className="py-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveIngredient(index)}
                                                        className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Toplam ve İşlemler */}
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                            <div>
                                <p className="text-slate-400">Toplam Miktar: {totals.quantity.toFixed(2)} kg</p>
                                <p className="text-slate-400">Toplam Maliyet: {totals.cost.toFixed(2)} TL</p>
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setNewRecipe({
                                        name: '',
                                        customer_id: '',
                                        density: '1.20',
                                        package_ids: [],
                                        ingredients: []
                                    })}
                                    className="border-slate-700 text-white hover:bg-slate-700"
                                >
                                    Temizle
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 text-white hover:bg-blue-500"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditing ? 'Güncelle' : 'Kaydet'}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </div>

                {/* Kayıtlı Reçeteler */}
                <div className="mt-6 bg-slate-800 rounded-lg p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-semibold text-white">Kayıtlı Reçeteler</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleUpdatePrices}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Fiyatları Güncelle
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-4">
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
                                    <th className="pb-4">Ürün Adı</th>
                                    <th className="pb-4">Firma</th>
                                    <th className="pb-4">Yoğunluk</th>
                                    <th className="pb-4">Ambalaj</th>
                                    <th className="pb-4">Toplam Maliyet</th>
                                    <th className="pb-4">Ambalaj Fiyatı</th>
                                    <th className="pb-4 text-right">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expandRecipesByPackage(filteredRecipes).map(recipe => {
                                    const packageInfo = recipe.currentPackage ? recipe.currentPackage.split(' ') : ['0', 'L'];
                                    const packageSize = parseFloat(packageInfo[0]);
                                    const packageUnit = packageInfo[1];
                                    
                                    const costPerKg = recipe.total_cost ? recipe.total_cost / 1000 : 0;
                                    let packagePrice = 0;
                                    let ambalajMaliyeti = 0;

                                    // Seçili ambalajın fiyatını bul
                                    const packageId = recipe.currentPackage ? 
                                        packages.find(p => `${p.size} ${p.unit}` === recipe.currentPackage)?.id : 
                                        recipe.packages ? recipe.packages[0] : null;
                                    
                                    const selectedPackage = packages.find(p => p.id === parseInt(packageId));
                                    ambalajMaliyeti = selectedPackage ? selectedPackage.price : 0;

                                    if (packageUnit === 'KG' || packageUnit === 'Kg' || packageUnit === 'kg') {
                                        packagePrice = (costPerKg * packageSize) + ambalajMaliyeti;
                                    } else {
                                        const density = parseFloat(recipe.density) || 1.20;
                                        packagePrice = (costPerKg * packageSize * density) + ambalajMaliyeti;
                                    }

                                    return (
                                        <tr key={recipe.displayId || recipe.id} className="border-b border-slate-700">
                                            <td className="py-4 text-white">{recipe.name}</td>
                                            <td className="py-4 text-white">
                                                {customers.find(c => c.id === recipe.customer_id)?.name || '-'}
                                            </td>
                                            <td className="py-4 text-white">{recipe.density}</td>
                                            <td className="py-4 text-white">
                                                {recipe.currentPackage || recipe.packages.map(pid => {
                                                    const pkg = packages.find(p => p.id === parseInt(pid));
                                                    return pkg ? `${pkg.size} ${pkg.unit}` : '';
                                                }).join(', ')}
                                            </td>
                                            <td className="py-4 text-white">
                                                {recipe.total_cost ? recipe.total_cost.toFixed(2) : '0.00'} TL
                                            </td>
                                            <td className="py-4">
                                                <div className="flex flex-col text-white">
                                                    <span>{packagePrice.toFixed(2)} TL</span>
                                                    <span className="text-xs text-slate-400">
                                                        (Ambalaj: {ambalajMaliyeti.toFixed(2)} TL)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEditRecipe(recipe)}
                                                        className="text-slate-400 hover:text-blue-400"
                                                    >
                                                        <Edit size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleCopyRecipe(recipe.id)}
                                                        className="text-slate-400 hover:text-blue-400"
                                                    >
                                                        <Copy size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteRecipe(recipe.id)}
                                                        className="text-slate-400 hover:text-red-400"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 