"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Download, Upload, Plus, Pencil, Trash, X } from "lucide-react";
import { toast } from "sonner";

export default function CariPage() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers`
      );
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Müşteri verileri yüklenirken hata:", error);
      toast.error("Müşteri verileri yüklenemedi");
    }
  };

  // Excel'den içe aktar
  const handleImportCustomers = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers/bulk`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.details.added} cari eklendi`);
        loadCustomers(); // Listeyi yenile
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("İçe aktarma hatası:", error);
      toast.error("Cari listesi yüklenemedi: " + error.message);
    }

    // Input'u temizle
    event.target.value = "";
  };

  // Cari düzenleme/ekleme
  const handleSaveCustomer = async (e) => {
    e.preventDefault();

    // Form validasyonu
    if (!editingCustomer?.name?.trim()) {
      toast.error("Cari adı zorunludur");
      return;
    }

    if (!editingCustomer?.type) {
      toast.error("Lütfen cari türünü seçiniz");
      return;
    }

    if (
      !["Müşteri", "Tedarikçi", "Fason", "Diğer", "Bioplant"].includes(
        editingCustomer.type
      )
    ) {
      toast.error("Geçersiz cari türü seçildi");
      return;
    }

    try {
      const url = editingCustomer?.id
        ? `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers/${editingCustomer.id}`
        : `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers`;

      const method = editingCustomer?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingCustomer.name.trim(),
          type: editingCustomer.type,
          email: editingCustomer.email?.trim() || "",
          phone: editingCustomer.phone?.trim() || "",
          address: editingCustomer.address?.trim() || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Bir hata oluştu");
      }

      toast.success(
        data.message ||
          (editingCustomer?.id ? "Cari güncellendi" : "Cari eklendi")
      );
      setShowModal(false);
      setEditingCustomer(null);
      loadCustomers();
    } catch (error) {
      console.error("Cari kaydetme hatası:", error);
      toast.error(error.message);
    }
  };

  // Cari silme
  const handleDeleteCustomer = async (id) => {
    if (!confirm("Bu cariyi silmek istediğinize emin misiniz?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ORIGIN}/api/customers/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Silme işlemi başarısız");

      toast.success("Cari başarıyla silindi");
      loadCustomers();
    } catch (error) {
      console.error("Cari silinirken hata:", error);
      toast.error("Cari silinemedi");
    }
  };

  // Filtrelenmiş müşteri listesi
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Başlık ve Butonlar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cari Hesaplar</h1>
          <p className="text-slate-400 text-sm">
            Toplam {customers.length} kayıtlı cari hesap
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setEditingCustomer({
                name: "",
                type: "Müşteri",
                email: "",
                phone: "",
                address: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            <Plus size={20} />
            <span>Yeni Cari</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors cursor-pointer">
            <Upload size={20} />
            <span>Excel'den Yükle</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportCustomers}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Arama */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Cari adı, e-posta veya telefon ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-slate-300 placeholder-slate-500 focus:outline-none focus:border-slate-600"
          />
          <Search
            className="absolute right-3 top-2.5 text-slate-500"
            size={20}
          />
        </div>
      </div>

      {/* Cari Ekleme/Düzenleme Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingCustomer?.id ? "Cari Düzenle" : "Yeni Cari"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-400 hover:text-slate-300"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Cari Adı
                  </label>
                  <input
                    type="text"
                    value={editingCustomer?.name || ""}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Türü
                  </label>
                  <select
                    value={editingCustomer?.type || "Müşteri"}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    required
                  >
                    <option value="">Seçiniz...</option>
                    <option value="Müşteri">Müşteri</option>
                    <option value="Tedarikçi">Tedarikçi</option>
                    <option value="Fason">Fason</option>
                    <option value="Diğer">Diğer</option>
                    <option value="Bioplant">Bioplant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={editingCustomer?.email || ""}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={editingCustomer?.phone || ""}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Adres
                  </label>
                  <textarea
                    value={editingCustomer?.address || ""}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingCustomer?.id ? "Güncelle" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-4 text-slate-400">ID</th>
                <th className="text-left p-4 text-slate-400">CARİ ADI</th>
                <th className="text-left p-4 text-slate-400">TÜRÜ</th>
                <th className="text-left p-4 text-slate-400">E-POSTA</th>
                <th className="text-left p-4 text-slate-400">TELEFON</th>
                <th className="text-left p-4 text-slate-400">ADRES</th>
                <th className="text-left p-4 text-slate-400">BAKİYE</th>
                <th className="text-left p-4 text-slate-400">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr className="border-b border-slate-700">
                  <td colSpan="8" className="p-4 text-center text-slate-500">
                    {searchTerm
                      ? "Aranan kriterlere uygun cari bulunamadı"
                      : "Henüz cari hesap kaydı bulunmuyor"}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-slate-700">
                    <td className="p-4 text-slate-300">{customer.id}</td>
                    <td className="p-4 text-slate-300">{customer.name}</td>
                    <td className="p-4 text-slate-300">{customer.type}</td>
                    <td className="p-4 text-slate-300">{customer.email}</td>
                    <td className="p-4 text-slate-300">{customer.phone}</td>
                    <td className="p-4 text-slate-300">{customer.address}</td>
                    <td className="p-4 text-slate-300">₺{customer.balance}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCustomer(customer);
                            setShowModal(true);
                          }}
                          className="p-1 hover:text-blue-500 text-slate-400"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
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
    </div>
  );
}
