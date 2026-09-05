import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  Book, 
  Sale, 
  Purchase, 
  Customer, 
  Supplier, 
  WebsiteOrder, 
  StockMovement, 
  AuditLog, 
  ShopSettings, 
  DashboardStats 
} from '../types';
import { api } from '../services/api';

interface StoreContextType {
  books: Book[];
  sales: Sale[];
  purchases: Purchase[];
  customers: Customer[];
  suppliers: Supplier[];
  orders: WebsiteOrder[];
  stockMovements: StockMovement[];
  auditLogs: AuditLog[];
  settings: ShopSettings | null;
  dashboardStats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  syncVersion: number;
  refreshAll: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshDashboard: (filter?: string) => Promise<void>;
  getBookStock: (bookId: string) => { physical: number; reserved: number; available: number };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<WebsiteOrder[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [syncVersion, setSyncVersion] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, []);

  const fetchDashboard = useCallback(async (filter: string = 'today') => {
    try {
      const data = await api.getDashboardStats(filter);
      setDashboardStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        bData,
        sData,
        pData,
        cData,
        supData,
        oData,
        smData,
        alData,
        settData,
        dashData,
        syncData
      ] = await Promise.all([
        api.getBooks(),
        api.getSales(),
        api.getPurchases(),
        api.getCustomers(),
        api.getSuppliers(),
        api.getOrders(),
        api.getStockMovements(),
        api.getAuditLogs(),
        api.getSettings(),
        api.getDashboardStats('today'),
        api.getSyncVersion()
      ]);

      setBooks(bData);
      setSales(sData);
      setPurchases(pData);
      setCustomers(cData);
      setSuppliers(supData);
      setOrders(oData);
      setStockMovements(smData);
      setAuditLogs(alData);
      setSettings(settData);
      setDashboardStats(dashData);
      setSyncVersion(syncData.version);
    } catch (err: unknown) {
      console.error('StoreProvider initial load error:', err);
      setError(err instanceof Error ? err.message : 'Database connection error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Periodic heartbeat sync to maintain single source of truth across all windows
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const syncRes = await api.getSyncVersion();
        if (syncRes.version !== syncVersion) {
          console.log(`[Sync] Remote DB updated (v${syncVersion} -> v${syncRes.version}). Refreshing store state.`);
          setSyncVersion(syncRes.version);
          await refreshAll();
        }
      } catch {
        // quiet fail on network blip
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [syncVersion, refreshAll]);

  const getBookStock = useCallback((bookId: string) => {
    const b = books.find(x => x.id === bookId);
    if (!b) return { physical: 0, reserved: 0, available: 0 };
    return {
      physical: b.physicalStock,
      reserved: b.reservedStock || 0,
      available: b.availableStock
    };
  }, [books]);

  return (
    <StoreContext.Provider
      value={{
        books,
        sales,
        purchases,
        customers,
        suppliers,
        orders,
        stockMovements,
        auditLogs,
        settings,
        dashboardStats,
        isLoading,
        error,
        syncVersion,
        refreshAll,
        refreshBooks: fetchBooks,
        refreshOrders: fetchOrders,
        refreshDashboard: fetchDashboard,
        getBookStock
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
