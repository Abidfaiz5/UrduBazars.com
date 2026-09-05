import React, { useState } from 'react';
import { Search, X, Package, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import type { WebsiteOrder } from '../../types';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ isOpen, onClose }) => {
  const { orders, settings } = useStore();
  const [query, setQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<WebsiteOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;
  const currency = settings?.currency || 'Rs.';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    const found = orders.find(o => 
      o.orderNumber.toLowerCase() === q || 
      o.customerPhone.replace(/[^0-9]/g, '') === q.replace(/[^0-9]/g, '')
    );
    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
        
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-bold text-lg text-[#082B4C] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#F47700]" />
              Track Online Order
            </h3>
            <p className="text-xs text-gray-500">Enter your Order # (e.g. ORD-1001) or Mobile Phone</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID (e.g. ORD-1001) or 03001234567"
            className="flex-1 text-xs px-3.5 py-2.5 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#082B4C] hover:bg-[#051C33] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Search className="w-4 h-4 text-[#F47700]" />
            <span>Track</span>
          </button>
        </form>

        {hasSearched && (
          <div>
            {searchedOrder ? (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#082B4C]">{searchedOrder.orderNumber}</span>
                    <p className="text-xs text-gray-500">Ordered on: {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    searchedOrder.orderStatus === 'New' ? 'bg-amber-100 text-amber-800' :
                    searchedOrder.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                    searchedOrder.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                    searchedOrder.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {searchedOrder.orderStatus}
                  </span>
                </div>

                {/* Tracking timeline */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Order Placed & Stock Reserved</span>
                  </div>
                  {(searchedOrder.orderStatus === 'Confirmed' || searchedOrder.orderStatus === 'Shipped' || searchedOrder.orderStatus === 'Delivered') && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Order Confirmed by Urdu Bazars team</span>
                    </div>
                  )}
                  {(searchedOrder.orderStatus === 'Shipped' || searchedOrder.orderStatus === 'Delivered') && (
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>Dispatched via Courier</span>
                    </div>
                  )}
                  {searchedOrder.orderStatus === 'Delivered' && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-700">Delivered Successfully!</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t text-xs flex justify-between font-bold text-[#082B4C]">
                  <span>Total Payable:</span>
                  <span className="font-mono">{currency} {searchedOrder.totalAmount.toLocaleString()} ({searchedOrder.paymentMethod})</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-gray-500 bg-red-50/50 rounded-2xl border border-red-200">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                No order found with the provided details. Please verify your order number or phone.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
