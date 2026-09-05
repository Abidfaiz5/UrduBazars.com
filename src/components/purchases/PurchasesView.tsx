import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Truck, 
  FileText, 
  DollarSign, 
  AlertCircle,
  X
} from 'lucide-react';
import type { Book, Supplier, Purchase, PaymentMethod } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface PurchaseDraftItem {
  bookId: string;
  title: string;
  quantity: number;
  purchasePrice: number;
  discount: number;
  subtotal: number;
}

export const PurchasesView: React.FC = () => {
  const { books, suppliers, purchases, settings, refreshAll } = useStore();
  const { currentUser } = useAuth();

  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseDraftItem[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [itemQty, setItemQty] = useState(10);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemDisc, setItemDisc] = useState(0);

  const [billDiscount, setBillDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currency = settings?.currency || 'Rs.';

  const handleBookSelect = (bookId: string) => {
    setSelectedBookId(bookId);
    const book = books.find(b => b.id === bookId);
    if (book) {
      setItemPrice(book.purchasePrice);
    }
  };

  const handleAddItemToDraft = () => {
    if (!selectedBookId) return;
    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;

    const sub = (itemQty * itemPrice) - itemDisc;
    const existingIdx = purchaseItems.findIndex(it => it.bookId === selectedBookId);

    if (existingIdx > -1) {
      setPurchaseItems(prev => {
        const next = [...prev];
        const newQty = next[existingIdx].quantity + itemQty;
        next[existingIdx] = {
          ...next[existingIdx],
          quantity: newQty,
          purchasePrice: itemPrice,
          discount: next[existingIdx].discount + itemDisc,
          subtotal: (newQty * itemPrice) - (next[existingIdx].discount + itemDisc)
        };
        return next;
      });
    } else {
      setPurchaseItems(prev => [
        ...prev,
        {
          bookId: book.id,
          title: book.title,
          quantity: itemQty,
          purchasePrice: itemPrice,
          discount: itemDisc,
          subtotal: sub
        }
      ]);
    }

    setSelectedBookId('');
    setItemQty(10);
    setItemPrice(0);
    setItemDisc(0);
  };

  const handleRemoveItem = (bookId: string) => {
    setPurchaseItems(prev => prev.filter(it => it.bookId !== bookId));
  };

  const draftSubtotal = purchaseItems.reduce((acc, it) => acc + (it.quantity * it.purchasePrice) - it.discount, 0);
  const grandTotal = Math.max(0, draftSubtotal - billDiscount);
  const effectivePaid = paidAmount === '' ? grandTotal : Number(paidAmount);
  const remainingPayable = Math.max(0, grandTotal - effectivePaid);

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setErrorMsg('Please select a supplier for this stock consignment purchase.');
      return;
    }
    if (purchaseItems.length === 0) {
      setErrorMsg('Please add at least one book item to this purchase invoice.');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.createPurchase({
        supplierId: selectedSupplierId,
        supplierName: supplier ? supplier.name : 'Supplier',
        items: purchaseItems,
        subtotal: draftSubtotal,
        discount: billDiscount,
        grandTotal: grandTotal,
        paidAmount: effectivePaid,
        remainingAmount: remainingPayable,
        paymentMethod: paymentMethod,
        notes: notes,
        userName: currentUser?.name || 'Admin'
      });

      setIsNewPurchaseOpen(false);
      setPurchaseItems([]);
      setSelectedSupplierId('');
      setBillDiscount(0);
      setPaidAmount('');
      setNotes('');
      await refreshAll();
    } catch (err: unknown) {
      console.error('Error saving purchase:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <Package className="w-6 h-6 text-[#F47700]" />
            Supplier Purchases & Stock Inward
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Record incoming stock shipments. Stock auto-increments in unified database immediately.
          </p>
        </div>

        <button
          onClick={() => setIsNewPurchaseOpen(true)}
          className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Purchase</span>
        </button>
      </div>

      {/* Purchases History List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#082B4C]">Recent Purchase Invoices</h3>
          <span className="text-xs text-gray-500">Total: {purchases.length} invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#082B4C] text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-3 text-center">Items Qty</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3 text-right">Payable (Udhaar)</th>
                <th className="py-3 px-3">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    No purchase invoices recorded yet. Click &quot;New Stock Purchase&quot; to add.
                  </td>
                </tr>
              ) : (
                purchases.map(p => {
                  const totalQty = p.items.reduce((acc, it) => acc + it.quantity, 0);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#082B4C]">
                        {p.purchaseInvoiceNo}
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {p.supplierName}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-gray-800">
                        {totalQty} books
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#082B4C]">
                        {currency} {p.grandTotal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-700">
                        {currency} {p.paidAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {p.remainingAmount > 0 ? (
                          <span className="font-bold text-red-600">
                            {currency} {p.remainingAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">Paid In Full</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800">
                          {p.paymentMethod}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {isNewPurchaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="bg-[#082B4C] text-white p-4 px-6 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#F47700]" />
                Record Inward Stock Purchase from Supplier
              </h3>
              <button onClick={() => setIsNewPurchaseOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Supplier Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Supplier *</label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company}) - Balance Payable: {currency} {s.remainingPayable}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Udhaar">Udhaar / Credit (Pay Later)</option>
                  </select>
                </div>
              </div>

              {/* Add Books Row */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                <span className="block text-xs font-bold text-[#082B4C] uppercase tracking-wider">
                  Add Book to Consignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <select
                      value={selectedBookId}
                      onChange={(e) => handleBookSelect(e.target.value)}
                      className="w-full text-xs px-2.5 py-2 border rounded-lg bg-white"
                    >
                      <option value="">-- Select Book from Catalog --</option>
                      {books.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.class}) - Current Phys Stock: {b.physicalStock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="Cost Price"
                      value={itemPrice || ''}
                      onChange={(e) => setItemPrice(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-2 border rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddItemToDraft}
                      disabled={!selectedBookId}
                      className="w-full py-2 bg-[#082B4C] hover:bg-[#051C33] disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table in Draft */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-semibold">
                    <tr>
                      <th className="p-2.5 px-3">Book Title</th>
                      <th className="p-2.5 text-center">Quantity</th>
                      <th className="p-2.5 text-right">Cost Price</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchaseItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-gray-400">
                          No items added yet. Choose a book above and click &quot;+ Add Item&quot;.
                        </td>
                      </tr>
                    ) : (
                      purchaseItems.map(it => (
                        <tr key={it.bookId} className="hover:bg-gray-50">
                          <td className="p-2.5 px-3 font-semibold text-gray-800">{it.title}</td>
                          <td className="p-2.5 text-center font-mono font-bold text-[#082B4C]">+{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">{currency} {it.purchasePrice}</td>
                          <td className="p-2.5 text-right font-mono font-bold">{currency} {it.subtotal}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.bookId)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">Consignment Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Delivery challan #9987 from Urdu Bazar depot"
                    className="w-full text-xs p-2 bg-white border rounded-lg outline-hidden"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-mono font-bold">{currency} {draftSubtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Invoice Discount:</span>
                    <input
                      type="number"
                      min="0"
                      value={billDiscount || ''}
                      onChange={(e) => setBillDiscount(Number(e.target.value))}
                      placeholder="0"
                      className="w-24 px-2 py-1 text-right font-mono bg-white border rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-between font-bold text-sm text-[#082B4C] pt-1 border-t">
                    <span>Grand Total:</span>
                    <span className="font-mono">{currency} {grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amount Paid to Supplier:</span>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder={grandTotal.toString()}
                      className="w-24 px-2 py-1 text-right font-mono bg-white border rounded-lg text-xs"
                    />
                  </div>

                  {remainingPayable > 0 && (
                    <div className="flex justify-between font-bold text-red-600 bg-red-50 p-1.5 rounded">
                      <span>Supplier Payable (Credit):</span>
                      <span className="font-mono">{currency} {remainingPayable.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewPurchaseOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || purchaseItems.length === 0}
                  className="px-6 py-2 bg-[#082B4C] hover:bg-[#051C33] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Recording...' : 'Finalize Purchase & Increase Stock'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
