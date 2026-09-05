import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Eye, 
  CheckCircle, 
  Truck, 
  XCircle, 
  X
} from 'lucide-react';
import type { WebsiteOrder, OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const OnlineOrdersAdminView: React.FC = () => {
  const { orders, settings, refreshAll } = useStore();
  const { currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<WebsiteOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const currency = settings?.currency || 'Rs.';

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.orderStatus !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.updateOrderStatus(orderId, {
        status: newStatus,
        paymentStatus: newStatus === 'Delivered' ? 'Paid' : selectedOrder?.paymentStatus,
        userName: currentUser?.name || 'Staff'
      });
      setSelectedOrder(res.order);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#F47700]" />
            E-Commerce Online Orders
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronized web orders. Pending orders reserve live inventory until delivered or cancelled.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl border text-xs font-semibold">
          {['All', 'New', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st 
                  ? 'bg-[#082B4C] text-white shadow-xs' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {st} ({st === 'All' ? orders.length : orders.filter(o => o.orderStatus === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search order #, customer, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
            />
          </div>

          <span className="text-xs text-gray-500 font-mono">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#082B4C] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3 text-center">Items</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    No web orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#082B4C]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-gray-600 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {order.city}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold">
                      {order.items.reduce((acc, it) => acc + it.quantity, 0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#082B4C]">
                      {currency} {order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'New' ? 'bg-amber-100 text-amber-800' :
                        order.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-gray-100 hover:bg-[#082B4C] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-[#082B4C] text-white p-4 px-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#F47700]" />
                  Manage Web Order: {selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-white/70">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Customer Info Card */}
              <div className="p-4 bg-gray-50 rounded-xl border space-y-2">
                <div className="font-bold text-xs text-[#082B4C] uppercase tracking-wider">
                  Shipping & Customer Destination
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-900">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span> <span className="font-mono font-semibold text-gray-900">{selectedOrder.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">City:</span> <span className="font-medium text-gray-900">{selectedOrder.city}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span> <span className="font-bold text-gray-900">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Address:</span> <span className="text-gray-900">{selectedOrder.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 font-semibold text-gray-700">
                    <tr>
                      <th className="p-2.5 px-3">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.items.map(it => (
                      <tr key={it.bookId} className="hover:bg-gray-50">
                        <td className="p-2.5 px-3 font-semibold text-gray-800">{it.title}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-[#082B4C]">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono">{currency} {it.unitPrice}</td>
                        <td className="p-2.5 text-right font-mono font-bold">{currency} {it.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{currency} {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges:</span>
                  <span className="font-mono">{currency} {selectedOrder.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#082B4C] pt-1 border-t">
                  <span>Grand Total:</span>
                  <span className="font-mono">{currency} {selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Status Change & Action Box */}
              <div className="p-4 bg-[#F7EEE3] rounded-xl border border-amber-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#082B4C] uppercase">
                    Current Status: <span className="text-[#F47700] underline">{selectedOrder.orderStatus}</span>
                  </span>
                  {(selectedOrder.orderStatus === 'New' || selectedOrder.orderStatus === 'Confirmed' || selectedOrder.orderStatus === 'Processing') && (
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">
                      Reserved in Inventory
                    </span>
                  )}
                </div>

                {/* Status Transition Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200">
                  {selectedOrder.orderStatus !== 'Confirmed' && selectedOrder.orderStatus !== 'Delivered' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Confirmed')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Confirm Order
                    </button>
                  )}

                  {selectedOrder.orderStatus !== 'Shipped' && selectedOrder.orderStatus !== 'Delivered' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark Shipped</span>
                    </button>
                  )}

                  {selectedOrder.orderStatus !== 'Delivered' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Delivered (Deducts Stock)</span>
                    </button>
                  )}

                  {selectedOrder.orderStatus !== 'Cancelled' && selectedOrder.orderStatus !== 'Delivered' && (
                    <button
                      disabled={isUpdatingStatus}
                      onClick={() => {
                        if (window.confirm('Cancel order? This will release reserved stock back into available inventory.')) {
                          handleUpdateStatus(selectedOrder.id, 'Cancelled');
                        }
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel (Release Stock)</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
