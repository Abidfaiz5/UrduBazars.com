import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  CreditCard, 
  Phone, 
  MapPin, 
  Printer, 
  CheckCircle, 
  DollarSign, 
  X,
  History,
  TrendingDown,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { Customer, CustomerTransaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UrduBazarsLogo } from '../common/UrduBazarsLogo';

export const CustomersKhataView: React.FC = () => {
  const { customers, settings, refreshAll } = useStore();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [ledgerTxs, setLedgerTxs] = useState<CustomerTransaction[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  // Modals
  const [isAddCustModalOpen, setIsAddCustModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', phone: '', address: '', notes: '', openingBalance: 0 });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isPrintingStatement, setIsPrintingStatement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = settings?.currency || 'Rs.';

  const filteredCustomers = customers.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || (filteredCustomers.length > 0 ? filteredCustomers[0] : null);

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerLedger(selectedCustomer.id);
    }
  }, [selectedCustomer?.id]);

  const loadCustomerLedger = async (custId: string) => {
    setIsLedgerLoading(true);
    try {
      const txs = await api.getCustomerLedger(custId);
      setLedgerTxs(txs);
    } catch (err) {
      console.error('Error loading ledger:', err);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.createCustomer({
        name: newCust.name.trim(),
        phone: newCust.phone.trim(),
        address: newCust.address.trim(),
        notes: newCust.notes.trim(),
        openingBalance: Number(newCust.openingBalance) || 0,
        userName: currentUser?.name || 'Admin'
      });
      setIsAddCustModalOpen(false);
      setNewCust({ name: '', phone: '', address: '', notes: '', openingBalance: 0 });
      setSelectedCustomerId(created.id);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const amt = Number(paymentAmount);
    if (amt <= 0) return;

    setIsSubmitting(true);
    try {
      await api.recordCustomerPayment(selectedCustomer.id, {
        amount: amt,
        paymentMethod,
        notes: paymentNotes,
        userName: currentUser?.name || 'Cashier'
      });
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNotes('');
      await refreshAll();
      await loadCustomerLedger(selectedCustomer.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <Users className="w-6 h-6 text-[#F47700]" />
            Customer Khata & Credit Ledgers (ادھار کھاتہ)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Track credit sales, receive payments and manage customer credit balances in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustModalOpen(true)}
          className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left List: Customers Directory */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
          
          <div className="p-3.5 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone or academy..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No customers found.
              </div>
            ) : (
              filteredCustomers.map(c => {
                const isSelected = selectedCustomer?.id === c.id;
                const hasUdhaar = c.remainingBalance > 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCustomerId(c.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#F7EEE3] border-l-4 border-[#082B4C]' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#082B4C] line-clamp-1">{c.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{c.phone || 'No phone'}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Udhaar Balance</div>
                        <div className={`font-mono text-xs font-bold ${
                          hasUdhaar ? 'text-red-600' : 'text-emerald-700'
                        }`}>
                          {currency} {c.remainingBalance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Pane: Selected Customer Ledger & Actions */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col min-h-[700px] overflow-hidden">
          {selectedCustomer ? (
            <div className="flex flex-col h-full">
              
              {/* Customer Banner Header */}
              <div className="p-5 bg-[#082B4C] text-white flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-white/80 mt-1">
                    <span className="font-mono">Ph: {selectedCustomer.phone || 'N/A'}</span>
                    {selectedCustomer.address && <span>Loc: {selectedCustomer.address}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Receive Payment</span>
                  </button>

                  <button
                    onClick={handlePrintStatement}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Print Statement"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-b border-gray-200">
                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Total Purchases</div>
                  <div className="font-mono text-base font-bold text-[#082B4C] mt-1">
                    {currency} {selectedCustomer.totalPurchases.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200">
                  <div className="text-[11px] font-bold text-gray-500 uppercase">Total Paid</div>
                  <div className="font-mono text-base font-bold text-emerald-700 mt-1">
                    {currency} {selectedCustomer.totalPaid.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-red-200">
                  <div className="text-[11px] font-bold text-red-600 uppercase">Remaining Udhaar</div>
                  <div className="font-mono text-base font-extrabold text-red-600 mt-1">
                    {currency} {selectedCustomer.remainingBalance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Ledger Transactions Table */}
              <div className="flex-1 overflow-y-auto p-4" id="printable-statement">
                
                {/* Print Only Header */}
                <div className="hidden print:block pb-4 mb-4 border-b">
                  <UrduBazarsLogo size="sm" variant="horizontal" />
                  <h2 className="text-base font-bold mt-2">Customer Account Statement / Khata Ledger</h2>
                  <p className="text-xs">Customer: {selectedCustomer.name} | Phone: {selectedCustomer.phone}</p>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-[#082B4C] uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#F47700]" />
                    Transaction History & Statement
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
                        <th className="p-2.5 text-right text-red-700">Debit (Udhaar)</th>
                        <th className="p-2.5 text-right text-emerald-700">Credit (Paid)</th>
                        <th className="p-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerTxs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400">
                            No ledger transactions recorded for this customer.
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
                              {tx.debit > 0 ? `${currency} ${tx.debit.toLocaleString()}` : '-'}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600">
                              {tx.credit > 0 ? `${currency} ${tx.credit.toLocaleString()}` : '-'}
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
              <Users className="w-12 h-12 mb-2 opacity-30 text-[#082B4C]" />
              <p className="text-sm font-semibold">No Customer Selected</p>
              <p className="text-xs text-gray-400">Select a customer from the left list or create a new one</p>
            </div>
          )}
        </div>

      </div>

      {/* Add Customer Modal */}
      {isAddCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#082B4C]">Add New Customer to Khata</h3>
              <button onClick={() => setIsAddCustModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Al-Huda Academy / Prof. Tariq"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCust.phone}
                  onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address / Area</label>
                <input
                  type="text"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  placeholder="e.g. Lahore"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Opening Udhaar Balance ({currency})</label>
                <input
                  type="number"
                  min="0"
                  value={newCust.openingBalance || ''}
                  onChange={(e) => setNewCust({ ...newCust, openingBalance: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={newCust.notes}
                  onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
                  placeholder="e.g. Regular wholesale buyer"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddCustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#082B4C] hover:bg-[#051C33] rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#082B4C]">Receive Udhaar Payment</h3>
                <p className="text-xs text-gray-500">{selectedCustomer.name}</p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs flex justify-between items-center">
                <span className="text-red-700 font-medium">Outstanding Balance:</span>
                <span className="font-mono font-bold text-sm text-red-700">{currency} {selectedCustomer.remainingBalance.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Amount Received ({currency}) *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedCustomer.remainingBalance > 0 ? selectedCustomer.remainingBalance * 2 : 999999}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={selectedCustomer.remainingBalance.toString()}
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
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Receipt Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Received cash at counter"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  {isSubmitting ? 'Recording...' : 'Save Payment & Update Khata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
