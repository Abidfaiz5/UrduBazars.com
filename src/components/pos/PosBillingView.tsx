import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Camera, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Check, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  BookOpen, 
  RefreshCw,
  ShoppingBag,
  Percent,
  X
} from 'lucide-react';
import type { Book, Customer, PaymentMethod, Sale } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BarcodeScannerModal } from '../common/BarcodeScannerModal';
import { PrintableReceipt } from './PrintableReceipt';

interface PosCartItem {
  book: Book;
  quantity: number;
  salePrice: number;
  discount: number;
  subtotal: number;
}

export const PosBillingView: React.FC = () => {
  const { books, customers, settings, refreshAll } = useStore();
  const { currentUser } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [saleNotes, setSaleNotes] = useState('');
  
  // Modals & Feedback
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currency = settings?.currency || 'Rs.';

  // Unique publishers list
  const uniquePublishers = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => {
      if (b.publisher && b.publisher.trim()) {
        set.add(b.publisher.trim());
      }
    });
    return Array.from(set).sort();
  }, [books]);

  // Unique classes list
  const uniqueClasses = useMemo(() => {
    const order = ['All', 'Playgroup', 'Nursery', 'Prep', 'Pre 1', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'O/A-Level', 'General', 'Other'];
    const present = new Set<string>();
    books.forEach(b => {
      if (b.class) present.add(b.class);
    });
    return order.filter(c => c === 'All' || present.has(c));
  }, [books]);

  // Filter books for POS catalog grid
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      if (!b.isActive) return false;
      if (selectedClass !== 'All' && b.class !== selectedClass) return false;
      if (selectedPublisher !== 'All' && b.publisher !== selectedPublisher) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        b.title.toLowerCase().includes(q) ||
        (b.urduTitle && b.urduTitle.toLowerCase().includes(q)) ||
        b.barcode.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q)
      );
    });
  }, [books, selectedClass, selectedPublisher, searchTerm]);

  // Selected customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Add book to POS Cart
  const addBookToCart = (book: Book) => {
    setErrorMessage(null);
    if (book.availableStock <= 0) {
      setErrorMessage(`'${book.title}' is currently Out of Stock.`);
      return;
    }

    setPosCart(prev => {
      const existing = prev.find(it => it.book.id === book.id);
      if (existing) {
        if (existing.quantity + 1 > book.availableStock) {
          setErrorMessage(`Cannot add more than ${book.availableStock} available in stock for '${book.title}'.`);
          return prev;
        }
        return prev.map(it => {
          if (it.book.id === book.id) {
            const nextQty = it.quantity + 1;
            return {
              ...it,
              quantity: nextQty,
              subtotal: (nextQty * it.salePrice) - it.discount
            };
          }
          return it;
        });
      } else {
        return [
          ...prev,
          {
            book,
            quantity: 1,
            salePrice: book.salePrice,
            discount: 0,
            subtotal: book.salePrice
          }
        ];
      }
    });
  };

  const updateCartItemQty = (bookId: string, delta: number) => {
    setErrorMessage(null);
    setPosCart(prev => {
      return prev.map(it => {
        if (it.book.id === bookId) {
          const nextQty = it.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > it.book.availableStock) {
            setErrorMessage(`Maximum available stock for '${it.book.title}' is ${it.book.availableStock}.`);
            return it;
          }
          return {
            ...it,
            quantity: nextQty,
            subtotal: (nextQty * it.salePrice) - it.discount
          };
        }
        return it;
      }).filter(Boolean) as PosCartItem[];
    });
  };

  const updateCartItemDiscount = (bookId: string, disc: number) => {
    setPosCart(prev =>
      prev.map(it => {
        if (it.book.id === bookId) {
          const d = Math.max(0, disc);
          return {
            ...it,
            discount: d,
            subtotal: Math.max(0, (it.quantity * it.salePrice) - d)
          };
        }
        return it;
      })
    );
  };

  const removeCartItem = (bookId: string) => {
    setPosCart(prev => prev.filter(it => it.book.id !== bookId));
  };

  const clearPosCart = () => {
    setPosCart([]);
    setBillDiscount(0);
    setPaidAmountInput('');
    setErrorMessage(null);
  };

  // Calculations
  const cartSubtotal = posCart.reduce((sum, it) => sum + (it.quantity * it.salePrice), 0);
  const totalItemDiscount = posCart.reduce((sum, it) => sum + (it.discount || 0), 0);
  const calculatedGrandTotal = Math.max(0, cartSubtotal - totalItemDiscount - (billDiscount || 0));

  const effectivePaidAmount = paidAmountInput === '' 
    ? (paymentMethod === 'Udhaar' ? 0 : calculatedGrandTotal)
    : Number(paidAmountInput);

  const remainingAmount = Math.max(0, calculatedGrandTotal - effectivePaidAmount);

  // Complete Sale
  const handleCompleteSale = async () => {
    if (posCart.length === 0) {
      setErrorMessage('Cart is empty. Please select books to sell.');
      return;
    }

    // Udhaar validation: must have customer selected
    if (paymentMethod === 'Udhaar' || remainingAmount > 0) {
      if (!selectedCustomerId) {
        setErrorMessage('Please select a customer for Udhaar (Credit) or partial payment sales.');
        return;
      }
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const salePayload = {
        customerId: selectedCustomerId || undefined,
        customerName: selectedCustomer ? selectedCustomer.name : (customerSearch.trim() || 'Walk-in Customer'),
        customerPhone: selectedCustomer ? selectedCustomer.phone : '',
        items: posCart.map(it => ({
          bookId: it.book.id,
          title: it.book.title,
          isbn: it.book.isbn,
          barcode: it.book.barcode,
          purchasePrice: it.book.purchasePrice,
          salePrice: it.salePrice,
          quantity: it.quantity,
          discount: it.discount,
          subtotal: it.subtotal
        })),
        subtotal: cartSubtotal,
        itemDiscount: totalItemDiscount,
        billDiscount: Number(billDiscount) || 0,
        grandTotal: calculatedGrandTotal,
        paidAmount: effectivePaidAmount,
        remainingAmount: remainingAmount,
        paymentMethod: paymentMethod,
        notes: saleNotes,
        cashierName: currentUser?.name || 'Cashier'
      };

      const result = await api.createSale(salePayload);
      setCompletedSale(result);
      clearPosCart();
      await refreshAll();
    } catch (err: unknown) {
      console.error('POS Sale Error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to complete sale');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;
    try {
      const created = await api.createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        address: newCustAddress.trim(),
        userName: currentUser?.name || 'Cashier'
      });
      setSelectedCustomerId(created.id);
      setIsQuickCustomerOpen(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error adding customer');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-5 pb-8">
      
      {/* LEFT COLUMN: Book Catalog & Instant Search */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4">
        
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EADBC8] flex flex-wrap items-center gap-3 justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Title, Urdu name, Subject, Author, Barcode, ISBN..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#082B4C] focus:bg-white transition-all outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2.5 bg-[#082B4C] hover:bg-[#051C33] text-white text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Camera className="w-4 h-4 text-[#F47700]" />
            <span>Scan Barcode</span>
          </button>
        </div>

        {/* Class / Subject & Publisher Fast Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
            {uniqueClasses.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedClass === cls
                    ? 'bg-[#F47700] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-[#F7EEE3] border border-gray-200'
                }`}
              >
                {cls === 'All' ? 'All Classes' : ['Playgroup', 'Nursery', 'Prep', 'Pre 1', 'General', 'Other', 'O/A-Level'].includes(cls) ? cls : `${cls} Class`}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <select
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              className="w-full sm:w-48 text-xs font-semibold bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
            >
              <option value="All">All Publishers</option>
              {uniquePublishers.map(pub => (
                <option key={pub} value={pub}>
                  {pub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {filteredBooks.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-700">No books found</h4>
              <p className="text-xs text-gray-500 mt-1">Try another search keyword or clear filters</p>
            </div>
          ) : (
            filteredBooks.map(book => {
              const isLowStock = book.availableStock <= book.minStockAlert;
              const isOut = book.availableStock <= 0;

              return (
                <div
                  key={book.id}
                  onClick={() => !isOut && addBookToCart(book)}
                  className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer flex flex-col justify-between group ${
                    isOut 
                      ? 'opacity-60 border-red-200 bg-red-50/20 cursor-not-allowed'
                      : 'hover:shadow-md hover:border-[#F47700] border-gray-200 active:scale-[0.98]'
                  }`}
                >
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#082B4C] text-white">
                      {book.class}
                    </div>

                    {isOut ? (
                      <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-600 text-white">
                        Out of Stock
                      </div>
                    ) : (
                      <div className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isLowStock ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        Stock: {book.availableStock}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[#082B4C] line-clamp-2 leading-snug group-hover:text-[#F47700] transition-colors">
                      {book.title}
                    </h4>
                    {book.urduTitle && (
                      <p className="font-urdu text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {book.urduTitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-mono text-sm font-extrabold text-[#082B4C]">
                      {currency} {book.salePrice}
                    </span>
                    <button
                      disabled={isOut}
                      className="p-1.5 rounded-lg bg-[#F7EEE3] group-hover:bg-[#F47700] text-[#082B4C] group-hover:text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: POS Billing Cart & Checkout Terminal */}
      <div className="w-full lg:w-[420px] shrink-0 bg-white rounded-2xl shadow-lg border border-[#EADBC8] flex flex-col h-full overflow-hidden">
        
        {/* Terminal Header */}
        <div className="bg-[#082B4C] text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F47700]" />
            <div>
              <h3 className="font-bold text-base leading-tight">Sale Terminal</h3>
              <p className="text-[11px] text-white/70">Single Central Inventory Engine</p>
            </div>
          </div>
          {posCart.length > 0 && (
            <button
              onClick={clearPosCart}
              className="text-xs text-red-300 hover:text-white font-medium hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Customer Selector */}
        <div className="p-3 bg-[#F7EEE3]/60 border-b border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#082B4C] uppercase tracking-wider">
              Customer / Khata
            </label>
            <button
              type="button"
              onClick={() => setIsQuickCustomerOpen(true)}
              className="text-[11px] font-bold text-[#F47700] hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> New Customer
            </button>
          </div>

          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-gray-300 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
          >
            <option value="">Walk-in Customer (Cash / Online)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone}) - Udhaar: {currency} {c.remainingBalance}
              </option>
            ))}
          </select>

          {selectedCustomer && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-amber-200 text-[11px] flex justify-between items-center text-gray-700">
              <span>Current Udhaar Balance:</span>
              <span className="font-bold font-mono text-red-600">{currency} {selectedCustomer.remainingBalance}</span>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[160px] max-h-[300px]">
          {posCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-8">
              <ShoppingBag className="w-10 h-10 mb-2 opacity-40 text-[#082B4C]" />
              <p className="text-xs font-semibold text-gray-600">Terminal Cart is Empty</p>
              <p className="text-[11px] text-gray-400">Click books or scan barcode to add</p>
            </div>
          ) : (
            posCart.map(item => (
              <div key={item.book.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-[#082B4C] line-clamp-1">{item.book.title}</h5>
                    <div className="text-[11px] text-gray-500 font-mono">
                      {currency} {item.salePrice} each | Avail: {item.book.availableStock}
                    </div>
                  </div>
                  <button
                    onClick={() => removeCartItem(item.book.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden">
                    <button
                      onClick={() => updateCartItemQty(item.book.id, -1)}
                      className="px-2 py-1 hover:bg-gray-100 text-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-bold font-mono min-w-[24px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItemQty(item.book.id, 1)}
                      disabled={item.quantity >= item.book.availableStock}
                      className="px-2 py-1 hover:bg-gray-100 text-gray-600 disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Discount Input */}
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-gray-400">Disc:</span>
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ''}
                      onChange={(e) => updateCartItemDiscount(item.book.id, Number(e.target.value))}
                      placeholder="0"
                      className="w-14 px-1.5 py-0.5 text-right font-mono bg-white border border-gray-200 rounded text-xs"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="text-right font-bold font-mono text-xs text-[#082B4C]">
                    {currency} {item.subtotal}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-4 mb-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Calculation & Payment Area */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
          
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{currency} {cartSubtotal.toLocaleString()}</span>
            </div>

            {totalItemDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Items Discount:</span>
                <span className="font-mono">-{currency} {totalItemDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Bill Extra Discount:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{currency}</span>
                <input
                  type="number"
                  min="0"
                  value={billDiscount || ''}
                  onChange={(e) => setBillDiscount(Number(e.target.value))}
                  placeholder="0"
                  className="w-20 px-2 py-0.5 text-right font-mono bg-white border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex justify-between text-base font-extrabold text-[#082B4C] pt-2 border-t border-gray-300">
              <span>Grand Total:</span>
              <span className="font-mono text-lg text-[#F47700]">{currency} {calculatedGrandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-5 gap-1">
              {(['Cash', 'Bank', 'JazzCash', 'Easypaisa', 'Udhaar'] as PaymentMethod[]).map(pm => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => {
                    setPaymentMethod(pm);
                    if (pm === 'Udhaar') {
                      setPaidAmountInput('0');
                    } else if (paidAmountInput === '0') {
                      setPaidAmountInput('');
                    }
                  }}
                  className={`py-1.5 px-1 text-center rounded-lg text-[11px] font-bold transition-all truncate ${
                    paymentMethod === pm
                      ? 'bg-[#082B4C] text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Paid / Remaining inputs for partial / split payments */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Paid Amount</label>
              <input
                type="number"
                min="0"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                placeholder={calculatedGrandTotal.toString()}
                className="w-full px-2.5 py-1.5 font-mono text-xs bg-white border border-gray-300 rounded-lg outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">Remaining (Udhaar)</label>
              <div className={`px-2.5 py-1.5 font-mono text-xs rounded-lg font-bold ${
                remainingAmount > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-600'
              }`}>
                {currency} {remainingAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Complete Button */}
          <button
            type="button"
            onClick={handleCompleteSale}
            disabled={isProcessing || posCart.length === 0}
            className="w-full py-3.5 bg-[#F47700] hover:bg-[#D46600] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Sale...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>COMPLETE SALE ({currency} {calculatedGrandTotal.toLocaleString()})</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onBookScanned={(scannedBook) => {
          addBookToCart(scannedBook);
        }}
      />

      {/* Printable Receipt Modal */}
      {completedSale && (
        <PrintableReceipt
          sale={completedSale}
          onClose={() => setCompletedSale(null)}
        />
      )}

      {/* Quick Add Customer Modal */}
      {isQuickCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#082B4C]">Quick Add Customer</h3>
              <button onClick={() => setIsQuickCustomerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickAddCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Prof. Tariq Mahmood"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Address / Academy</label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="e.g. Lahore"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#082B4C] hover:bg-[#051C33] rounded-xl"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
