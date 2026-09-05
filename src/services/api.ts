import type {
  Book,
  Sale,
  Purchase,
  Customer,
  CustomerTransaction,
  Supplier,
  SupplierTransaction,
  WebsiteOrder,
  StockMovement,
  AuditLog,
  ShopSettings,
  DashboardStats,
  OrderStatus
} from "../types";

const API_BASE = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers
      },
      ...options
    });

    if (!res.ok) {
      let errorMessage = `HTTP error ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData?.error) errorMessage = errorData.error;
      } catch {
        // use default
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`[API Error] ${url}:`, err.message);
      throw err;
    }
    throw new Error(String(err));
  }
}

export const api = {
  // Sync version
  getSyncVersion: () => request<{ version: number; updatedAt: string }>(`${API_BASE}/sync/version`),

  // Dashboard stats
  getDashboardStats: (filter: string = "today") => 
    request<DashboardStats>(`${API_BASE}/stats/dashboard?filter=${filter}`),

  // Books / Inventory
  getBooks: (params?: { 
    search?: string; 
    class?: string; 
    category?: string; 
    websiteVisible?: boolean; 
    featured?: boolean; 
    bestSeller?: boolean;
    lowStock?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.class) query.append("class", params.class);
    if (params?.category) query.append("category", params.category);
    if (params?.websiteVisible !== undefined) query.append("websiteVisible", String(params.websiteVisible));
    if (params?.featured !== undefined) query.append("featured", String(params.featured));
    if (params?.bestSeller !== undefined) query.append("bestSeller", String(params.bestSeller));
    if (params?.lowStock !== undefined) query.append("lowStock", String(params.lowStock));

    const qs = query.toString();
    return request<Book[]>(`${API_BASE}/books${qs ? `?${qs}` : ""}`);
  },

  getBookById: (id: string) => request<Book>(`${API_BASE}/books/${id}`),

  createBook: (bookData: Partial<Book> & { userName?: string }) =>
    request<Book>(`${API_BASE}/books`, {
      method: "POST",
      body: JSON.stringify(bookData)
    }),

  updateBook: (id: string, bookData: Partial<Book> & { userName?: string; adjustmentReason?: string }) =>
    request<Book>(`${API_BASE}/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookData)
    }),

  deleteBook: (id: string, userName?: string) =>
    request<{ success: boolean; message: string }>(`${API_BASE}/books/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ userName })
    }),

  adjustStock: (data: { bookId: string; newStock: number; reason: string; notes?: string; userName?: string }) =>
    request<{ success: boolean; book: Book }>(`${API_BASE}/inventory/adjust`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  getStockMovements: () => request<StockMovement[]>(`${API_BASE}/inventory/movements`),

  // Sales & POS
  getSales: () => request<Sale[]>(`${API_BASE}/sales`),

  createSale: (saleData: {
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    items: Array<{
      bookId: string;
      title: string;
      isbn?: string;
      barcode?: string;
      purchasePrice: number;
      salePrice: number;
      quantity: number;
      discount?: number;
      subtotal: number;
    }>;
    subtotal: number;
    itemDiscount: number;
    billDiscount: number;
    grandTotal: number;
    paidAmount: number;
    remainingAmount: number;
    paymentMethod: string;
    notes?: string;
    cashierName: string;
  }) =>
    request<Sale>(`${API_BASE}/sales`, {
      method: "POST",
      body: JSON.stringify(saleData)
    }),

  cancelSale: (id: string, userName?: string) =>
    request<{ success: boolean; sale: Sale }>(`${API_BASE}/sales/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ userName })
    }),

  // Purchases
  getPurchases: () => request<Purchase[]>(`${API_BASE}/purchases`),

  createPurchase: (purchaseData: {
    supplierId: string;
    supplierName: string;
    items: Array<{
      bookId: string;
      title: string;
      quantity: number;
      purchasePrice: number;
      discount?: number;
      subtotal: number;
    }>;
    subtotal: number;
    discount?: number;
    grandTotal: number;
    paidAmount: number;
    remainingAmount: number;
    paymentMethod: string;
    notes?: string;
    userName?: string;
  }) =>
    request<Purchase>(`${API_BASE}/purchases`, {
      method: "POST",
      body: JSON.stringify(purchaseData)
    }),

  // Customers & Khata
  getCustomers: () => request<Customer[]>(`${API_BASE}/customers`),

  createCustomer: (customerData: Partial<Customer> & { openingBalance?: number; userName?: string }) =>
    request<Customer>(`${API_BASE}/customers`, {
      method: "POST",
      body: JSON.stringify(customerData)
    }),

  updateCustomer: (id: string, customerData: Partial<Customer>) =>
    request<Customer>(`${API_BASE}/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customerData)
    }),

  getCustomerLedger: (customerId: string) =>
    request<CustomerTransaction[]>(`${API_BASE}/customers/${customerId}/ledger`),

  recordCustomerPayment: (customerId: string, data: { amount: number; paymentMethod: string; notes?: string; userName?: string }) =>
    request<{ success: boolean; customer: Customer; transaction: CustomerTransaction }>(`${API_BASE}/customers/${customerId}/payments`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Suppliers & Payables
  getSuppliers: () => request<Supplier[]>(`${API_BASE}/suppliers`),

  createSupplier: (supplierData: Partial<Supplier> & { openingBalance?: number; userName?: string }) =>
    request<Supplier>(`${API_BASE}/suppliers`, {
      method: "POST",
      body: JSON.stringify(supplierData)
    }),

  updateSupplier: (id: string, supplierData: Partial<Supplier>) =>
    request<Supplier>(`${API_BASE}/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(supplierData)
    }),

  getSupplierLedger: (supplierId: string) =>
    request<SupplierTransaction[]>(`${API_BASE}/suppliers/${supplierId}/ledger`),

  recordSupplierPayment: (supplierId: string, data: { amount: number; paymentMethod: string; notes?: string; userName?: string }) =>
    request<{ success: boolean; supplier: Supplier; transaction: SupplierTransaction }>(`${API_BASE}/suppliers/${supplierId}/payments`, {
      method: "POST",
      body: JSON.stringify(data)
    }),

  // Online Orders
  getOrders: () => request<WebsiteOrder[]>(`${API_BASE}/orders`),

  createOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    city: string;
    items: Array<{
      bookId: string;
      title: string;
      image?: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
  }) =>
    request<WebsiteOrder>(`${API_BASE}/orders`, {
      method: "POST",
      body: JSON.stringify(orderData)
    }),

  updateOrderStatus: (id: string, data: { status: OrderStatus; paymentStatus?: 'Pending' | 'Paid'; userName?: string }) =>
    request<{ success: boolean; order: WebsiteOrder }>(`${API_BASE}/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),

  // Reports
  getReports: (params?: { startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const qs = query.toString();
    return request<any>(`${API_BASE}/reports${qs ? `?${qs}` : ""}`);
  },

  // Settings & Audit
  getSettings: () => request<ShopSettings>(`${API_BASE}/settings`),

  updateSettings: (settings: Partial<ShopSettings> & { userName?: string }) =>
    request<ShopSettings>(`${API_BASE}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings)
    }),

  getAuditLogs: () => request<AuditLog[]>(`${API_BASE}/audit-logs`),

  resetDatabase: () =>
    request<{ success: boolean; message: string }>(`${API_BASE}/database/reset`, {
      method: "POST"
    })
};
