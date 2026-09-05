import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  DollarSign, 
  Phone, 
  MapPin, 
  History, 
  X,
  CreditCard,
  Truck
} from 'lucide-react';
import type { Supplier, SupplierTransaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SuppliersView: React.FC = () => {
  const { suppliers, settings, refreshAll } = useStore();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [ledgerTxs, setLedgerTxs] = useState<SupplierTransaction[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  // Modals
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSup, setNewSup] = useState({ name: '', company: '', phone: '', address: '', notes: '', openingBalance: 0 });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = settings?.currency || 'Rs.';

  const filteredSuppliers = suppliers.filter(s => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.company.toLowerCase().includes(q) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || (filteredSuppliers.length > 0 ? filteredSuppliers[0] : null);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierLedger(selectedSupplier.id);
    }
  }, [selectedSupplier?.id]);

  const loadSupplierLedger = async (supId: string) => {
    setIsLedgerLoading(true);
    try {
      const txs = await api.getSupplierLedger(supId);
      setLedgerTxs(txs);
    } catch (err) {
      console.error('Error loading supplier ledger:', err);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.createSupplier({
        name: newSup.name.trim(),
        company: newSup.company.trim(),
        phone: newSup.phone.trim(),
        address: newSup.address.trim(),
        notes: newSup.notes.trim(),
        openingBalance: Number(newSup.openingBalance) || 0,
        userName: currentUser?.name || 'Admin'
      });
      setIsAddSupplierOpen(false);
      setNewSup({ name: '', company: '', phone: '', address: '', notes: '', openingBalance: 0 });
      setSelectedSupplierId(created.id);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    const amt = Number(paymentAmount);
    if (amt <= 0) return;

    setIsSubmitting(true);
    try {
      await api.recordSupplierPayment(selectedSupplier.id, {
        amount: amt,
        paymentMethod,
        notes: paymentNotes,
        userName: currentUser?.name || 'Admin'
      });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNotes('');
      await refreshAll();
      await loadSupplierLedger(selectedSupplier.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#F47700]" />
            Suppliers & Publisher Payables
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage book publishers, stationery wholesalers, purchase history and supplier payment ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsAddSupplierOpen(true)}
          className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Supplier</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Supplier Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
          
          <div className="p-3.5 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search publisher, company or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No suppliers found.
              </div>
            ) : (
              filteredSuppliers.map(s => {
                const isSelected = selectedSupplier?.id === s.id;
                const hasPayable = s.remainingPayable > 0;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSupplierId(s.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#F7EEE3] border-l-4 border-[#082B4C]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#082B4C] line-clamp-1">{s.name}</h4>
                        <div className="text-[11px] text-gray-600 font-medium line-clamp-1">{s.company}</div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{s.phone}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Payable Balance</div>
                        <div className={`font-mono text-xs font-bold ${
                          hasPayable ? 'text-red-600' : 'text-emerald-700'
                        }`}>
                          {currency} {s.remainingPayable.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right: Selected Supplier Ledger */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[700px] overflow-hidden">
          {selectedSupplier ? (
            <div className="flex flex-col h-full">
              
              {/* Banner Header */}
              <div className="p-5 bg-[#082B4C] text-white flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {selectedSupplier.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/80 mt-1">
                    <span className="font-semibold">{selectedSupplier.company}</span>
                    <span className="font-mono">Ph: {selectedSupplier.phone}</span>
                    {selectedSupplier.address && <span>Loc: {selectedSupplier.address}</span>}
                  </div>
                </div>

                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Record Payment to Supplier</span>
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Total Purchases</div>
                  <div className="font-mono text-base font-bold text-[#082B4C] mt-1">
                    {currency} {selectedSupplier.totalPurchases.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Total Paid to Supplier</div>
                  <div className="font-mono text-base font-bold text-emerald-700 mt-1">
                    {currency} {selectedSupplier.totalPaid.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-red-200">
                  <div className="text-[11px] font-bold text-red-600 uppercase">Remaining Payable</div>
                  <div className="font-mono text-base font-extrabold text-red-600 mt-1">
                    {currency} {selectedSupplier.remainingPayable.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-[#082B4C] uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#F47700]" />
                    Supplier Ledger Transactions
                  </h4>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {ledgerTxs.length} entries
                  </span>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-semibold text-[11px]">
                      <tr>
                        <th className="p-2.5 px-3">Date</th>
                        <th className="p-2.5 px-3">Description</th>
                        <th className="p-2.5 text-right text-red-700">Credit (We Owe)</th>
                        <th className="p-2.5 text-right text-emerald-700">Debit (We Paid)</th>
                        <th className="p-2.5 px-3 text-right">Payable Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerTxs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">
                            No ledger records for this supplier.
                          </td>
                        </tr>
                      ) : (
                        ledgerTxs.map(tx => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="p-2.5 px-3 font-mono text-gray-600">
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="p-2.5 px-3 font-medium text-gray-800">
                              {tx.description}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-red-600">
                              {tx.credit > 0 ? `${currency} ${tx.credit.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                              {tx.debit > 0 ? `${currency} ${tx.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2.5 px-3 text-right font-mono font-extrabold text-[#082B4C]">
                              {currency} {tx.balanceAfter.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-gray-400">
              <Building2 className="w-12 h-12 mb-2 opacity-30 text-[#082B4C]" />
              <p className="text-sm font-semibold">No Supplier Selected</p>
              <p className="text-xs text-gray-400">Select a supplier or add a new publisher</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#082B4C]">Add New Supplier / Publisher</h3>
              <button onClick={() => setIsAddSupplierOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Person Name *</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder="e.g. M. Aslam (Manager)"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Publisher / Company Name</label>
                <input
                  type="text"
                  value={newSup.company}
                  onChange={(e) => setNewSup({ ...newSup, company: e.target.value })}
                  placeholder="e.g. Caravan Book House / Oxford"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newSup.phone}
                  onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                  placeholder="e.g. 042-37353510"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address / Depot Location</label>
                <input
                  type="text"
                  value={newSup.address}
                  onChange={(e) => setNewSup({ ...newSup, address: e.target.value })}
                  placeholder="e.g. Kabir Street, Urdu Bazar, Lahore"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Opening Payable Balance ({currency})</label>
                <input
                  type="number"
                  min="0"
                  value={newSup.openingBalance || ''}
                  onChange={(e) => setNewSup({ ...newSup, openingBalance: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddSupplierOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#082B4C] hover:bg-[#051C33] rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment to Supplier Modal */}
      {isPaymentModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#082B4C]">Record Supplier Payment</h3>
                <p className="text-xs text-gray-500">{selectedSupplier.name} ({selectedSupplier.company})</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs flex justify-between items-center">
                <span className="text-red-700 font-medium">Payable Amount:</span>
                <span className="font-mono font-bold text-sm text-red-700">{currency} {selectedSupplier.remainingPayable.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid ({currency}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={selectedSupplier.remainingPayable.toString()}
                  className="w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                >
                  <option value="Bank">Bank Transfer / Cheque</option>
                  <option value="Cash">Cash at Shop</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Reference / Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Meezan Bank Online Transfer Trx #44592"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#082B4C] hover:bg-[#051C33] rounded-xl"
                >
                  {isSubmitting ? 'Recording...' : 'Record Payment & Deduct Payable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
