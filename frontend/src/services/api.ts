const API_URL = `${process.env.NEXT_PUBLIC_API_ORIGIN}/api`;

export interface Customer {
  id: number;
  name: string;
  balance: number;
}

export interface Stock {
  id: number;
  code: string;
  name: string;
  quantity: number;
  min_quantity: number;
}

export interface Order {
  id: number;
  customer_id: number;
  status: string;
  total: number;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  segment: string;
}

// API çağrıları
export const api = {
  // Müşteriler
  getCustomers: async (): Promise<Customer[]> => {
    const response = await fetch(`${API_URL}/customers`);
    return response.json();
  },

  // Stok
  getStock: async (): Promise<Stock[]> => {
    const response = await fetch(`${API_URL}/stock`);
    return response.json();
  },

  // Siparişler
  getOrders: async (): Promise<Order[]> => {
    const response = await fetch(`${API_URL}/orders`);
    return response.json();
  },

  // Reçeteler
  getRecipes: async (): Promise<Recipe[]> => {
    const response = await fetch(`${API_URL}/recipes`);
    return response.json();
  },
};
