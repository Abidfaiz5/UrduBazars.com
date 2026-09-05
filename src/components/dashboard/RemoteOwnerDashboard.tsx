import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import type { Book } from '../../types';

export const RemoteOwnerDashboard: React.FC = () => {
  const { 
    books, 
    sales, 
    purchases, 
    orders, 
    customers, 
    suppliers, 
    settings, 
    dashboardSummary 
  } = useStore();
  const { currentUser } = useAuth();

  const currency = settings?.currency || 'Rs.';

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations for Today & Historical
  const todaySales = useMemo(() => {
    return sales.filter(s => s.date.startsWith(todayStr));
  }, [sales, todayStr]);

  const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);

  // Today's Estimated Profit: sum of ((salePrice - purchasePrice) * qty - itemDiscount - billDiscount)
  const todayProfit = useMemo(() => {
    return todaySales.reduce((profit, s) => {
      const grossMargin = s.items.reduce((itemMargin, it) => {
        const cost = (it.purchasePrice || 0) * it.quantity;
        const revenue = it.subtotal;
        return itemMargin + (revenue - cost);
      }, 0);
      return profit + (grossMargin - (s.billDiscount || 0));
    }, 0);
  }, [todaySales]);

  // Low stock books
  const lowStockBooks = useMemo(() => {
    return books.filter(b => b.availableStock <= b.minStockAlert);
  }, [books]);

  // Out of stock books
  const outOfStockBooks = useMemo(() => {
    return books.filter(b => b.availableStock <= 0);
  }, [books]);

  // Total receivables (Customer Udhaar)
  const totalCustomerUdhaar = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.remainingBalance, 0);
  }, [customers]);

  // Total payables (Supplier Udhaar)
  const totalSupplierPayables = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.remainingPayable, 0);
  }, [suppliers]);

  // Top Selling Books (Aggregated from sales items)
  const topSellingBooks = useMemo(() => {
    const map: Record<string, { title: string; count: number; revenue: number }> = {};
    sales.forEach(s => {
      s.items.forEach(it => {
        if (!map[it.bookId]) {
          map[it.bookId] = { title: it.title, count: 0, revenue: 0 };
        }
        map[it.bookId].count += it.quantity;
        map[it.bookId].revenue += it.subtotal;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sales]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome & Live Status Banner */}
      <div className="bg-linear-to-r from-[#082B4C] to-[#0D3B66] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F47700]">
                Live Cloud Sync Active
              </span>
            </div>
            <h1 className="text-2xl font-black">
              Remote Executive Dashboard
            </h1>
            <p className="text-xs text-white/80 mt-1 max-w-xl">
              Real-time monitoring for shop operations, online bookstore orders, cash flow, profit margins and inventory status.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 px-4 rounded-2xl border border-white/10 text-xs">
            <div>
              <div className="text-white/60 text-[10px] uppercase font-bold">Current User</div>
              <div className="font-bold flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F47700]" />
                <span>{currentUser?.name} ({currentUser?.role})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative motif */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
          <BookOpen className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Primary KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-[#082B4C]">
            {currency} {todayRevenue.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
            <span className="font-bold text-gray-800">{todaySales.length}</span>
            <span>shop sales completed today</span>
          </div>
        </div>

        {/* Today Estimated Profit */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Profit</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-emerald-700">
            {currency} {todayProfit.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
            <span>Net Gross Margin (Sale - Cost)</span>
          </div>
        </div>

        {/* Customer Udhaar Receivables */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Customer Khata (Receivable)</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-red-600">
            {currency} {totalCustomerUdhaar.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            <span>Outstanding balance across customers</span>
          </div>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Supplier Payables</span>
            <div className="p-2 bg-blue-50 text-[#082B4C] rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="font-mono text-2xl font-black text-[#082B4C]">
            {currency} {totalSupplierPayables.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            <span>Payable to publishers & distributors</span>
          </div>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-[#F7EEE3]/80 rounded-2xl p-4 border border-[#EADBC8]">
          <div className="text-[11px] font-bold text-gray-600 uppercase">Total Inventory Value</div>
          <div className="font-mono text-lg font-black text-[#082B4C] mt-1">
            {currency} {dashboardSummary.inventoryValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {books.reduce((acc, b) => acc + b.physicalStock, 0)} total physical units
          </div>
        </div>

        <div className="bg-[#F7EEE3]/80 rounded-2xl p-4 border border-[#EADBC8]">
          <div className="text-[11px] font-bold text-gray-600 uppercase">Total Catalog Titles</div>
          <div className="font-mono text-lg font-black text-[#082B4C] mt-1">
            {books.length} Books
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {books.filter(b => b.websiteVisible).length} active on web store
          </div>
        </div>

        <div className="bg-[#F7EEE3]/80 rounded-2xl p-4 border border-[#EADBC8]">
          <div className="text-[11px] font-bold text-gray-600 uppercase">Pending Web Orders</div>
          <div className="font-mono text-lg font-black text-[#F47700] mt-1">
            {orders.filter(o => o.status === 'Pending').length} Orders
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Holding reserved stock
          </div>
        </div>

        <div className="bg-[#F7EEE3]/80 rounded-2xl p-4 border border-[#EADBC8]">
          <div className="text-[11px] font-bold text-gray-600 uppercase">Lifetime Sales Revenue</div>
          <div className="font-mono text-lg font-black text-emerald-800 mt-1">
            {currency} {dashboardSummary.totalSales.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {sales.length} lifetime invoices
          </div>
        </div>

      </div>

      {/* Main Analysis Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Recent Shop Sales & Top Books */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Recent Sales Ledger */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#F47700]" />
                Recent Sales Transactions
              </h3>
              <span className="text-xs text-gray-500">Live feed</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-4 text-right">Udhaar / Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sales.slice(0, 6).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#082B4C]">
                        {s.invoiceNo}
                      </td>
                      <td className="py-2.5 px-3 font-medium">
                        {s.customerName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-semibold">
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                        {currency} {s.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {s.remainingAmount > 0 ? (
                          <span className="font-bold text-red-600">
                            {currency} {s.remainingAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-[11px]">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Selling Titles */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F47700]" />
              Top Selling Book Titles
            </h3>

            <div className="space-y-3">
              {topSellingBooks.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-[#082B4C] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-gray-800 line-clamp-1">{item.title}</span>
                  </div>
                  <div className="text-right shrink-0 pl-3">
                    <span className="font-bold font-mono text-[#082B4C]">{item.count} sold</span>
                    <span className="text-gray-400 text-[10px] ml-2 font-mono">({currency} {item.revenue.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Inventory Alerts & Pending Orders */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Low Stock & Out of Stock Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Critical Inventory Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                {lowStockBooks.length} items
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {lowStockBooks.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  All book stocks are healthy and above threshold.
                </div>
              ) : (
                lowStockBooks.map(b => (
                  <div key={b.id} className="p-3 bg-red-50/50 rounded-xl border border-red-200 flex justify-between items-center text-xs">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 line-clamp-1">{b.title}</div>
                      <div className="text-[10px] text-gray-500">
                        Class: {b.class} | Rack: <span className="font-mono font-semibold">{b.rackShelf}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-gray-500 font-medium">Available</div>
                      <div className="font-mono font-extrabold text-sm text-red-600">
                        {b.availableStock} / {b.minStockAlert}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Online Orders Quick Glance */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#F47700]" />
                Pending Web Store Orders
              </h3>
              <span className="text-xs font-mono font-bold text-amber-700">
                {orders.filter(o => o.status === 'Pending').length} Pending
              </span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {orders.filter(o => o.status === 'Pending').length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No pending web orders to dispatch</p>
              ) : (
                orders.filter(o => o.status === 'Pending').map(o => (
                  <div key={o.id} className="p-2.5 bg-gray-50 rounded-xl border flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-[#082B4C]">{o.orderNumber}</span>
                      <div className="text-[11px] text-gray-600">{o.customerName} - {o.city}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-gray-900">{currency} {o.grandTotal}</span>
                      <div className="text-[10px] text-amber-700 font-semibold">{o.paymentMethod}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
