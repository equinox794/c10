// API Tipleri
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  created_at: string;
}

export interface Stock {
  id: number;
  name: string;
  code: string;
  quantity: number;
  min_quantity: number;
  unit: string;
  category: string;
  price: number;
}

export interface Order {
  id: number;
  customer_id: number;
  total: number;
  status: "Beklemede" | "Onaylandı" | "İptal";
  created_at: string;
}

export interface Recipe {
  id: number;
  name: string;
  code: string;
  description: string;
  category: string;
  created_at: string;
}

// API Endpoint'leri
const API_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}/api`;

// API İstekleri
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  if (!response.ok) {
    throw new Error(`API isteği başarısız: ${response.statusText}`);
  }
  return response.json();
}

// API Servisi
export const api = {
  // Müşteriler
  getCustomers: () => fetchApi<Customer[]>("/customers"),
  getCustomer: (id: number) => fetchApi<Customer>(`/customers/${id}`),

  // Stok
  getStock: () => fetchApi<Stock[]>("/stock"),
  getStockItem: (id: number) => fetchApi<Stock>(`/stock/${id}`),
  addStocks: (stocks: Partial<Stock>[]) =>
    fetchApi<Stock[]>("/stock/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stocks),
    }),
  updateStock: (id: number, stock: Partial<Stock>) =>
    fetchApi<Stock>(`/stock/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stock),
    }),
  deleteStock: (id: number) =>
    fetchApi<void>(`/stock/${id}`, {
      method: "DELETE",
    }),

  // Siparişler
  getOrders: () => fetchApi<Order[]>("/orders"),
  getOrder: (id: number) => fetchApi<Order>(`/orders/${id}`),

  // Reçeteler
  getRecipes: () => fetchApi<Recipe[]>("/recipes"),
  getRecipe: (id: number) => fetchApi<Recipe>(`/recipes/${id}`),
};
