import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  SlidersHorizontal, 
  History, 
  BookOpen, 
  Barcode, 
  X, 
  Save, 
  ArrowUpDown,
  Sparkles
} from 'lucide-react';
import type { Book, BookCategory, BookClass, StockMovement } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const BookInventoryView: React.FC = () => {
  const { books, stockMovements, settings, refreshAll } = useStore();
  const { currentUser, isOwnerOrAdmin } = useAuth();

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [onlyWebsiteVisible, setOnlyWebsiteVisible] = useState(false);

  // Available unique publishers
  const uniquePublishers = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => {
      if (b.publisher && b.publisher.trim()) {
        set.add(b.publisher.trim());
      }
    });
    return Array.from(set).sort();
  }, [books]);

  // Available unique classes
  const uniqueClasses = useMemo(() => {
    const order = ['All', 'Playgroup', 'Nursery', 'Prep', 'Pre 1', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'O/A-Level', 'General', 'Other'];
    const present = new Set<string>();
    books.forEach(b => {
      if (b.class) present.add(b.class);
    });
    return order.filter(c => c === 'All' || present.has(c));
  }, [books]);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [isStockAdjustModalOpen, setIsStockAdjustModalOpen] = useState(false);
  const [adjustTargetBook, setAdjustTargetBook] = useState<Book | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical Count / Audit');
  const [adjustNotes, setAdjustNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = settings?.currency || 'Rs.';

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      if (selectedClass !== 'All' && b.class !== selectedClass) return false;
      if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
      if (selectedPublisher !== 'All' && b.publisher !== selectedPublisher) return false;
      if (onlyLowStock && b.availableStock > b.minStockAlert) return false;
      if (onlyWebsiteVisible && !b.websiteVisible) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      return (
        b.title.toLowerCase().includes(q) ||
        (b.urduTitle && b.urduTitle.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.barcode.toLowerCase().includes(q) ||
        b.rackShelf.toLowerCase().includes(q)
      );
    });
  }, [books, selectedClass, selectedCategory, selectedPublisher, onlyLowStock, onlyWebsiteVisible, searchTerm]);

  // Open Add Book modal
  const handleAddNewBook = () => {
    const randomBarcode = `8964000${Math.floor(10000 + Math.random() * 90000)}`;
    const randomIsbn = `978-969-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-1`;
    setEditingBook({
      title: '',
      urduTitle: '',
      class: '12th',
      subject: '',
      author: '',
      publisher: 'Punjab Curriculum and Textbook Board',
      isbn: randomIsbn,
      barcode: randomBarcode,
      purchasePrice: 0,
      salePrice: 0,
      physicalStock: 10,
      reservedStock: 0,
      availableStock: 10,
      minStockAlert: 5,
      rackShelf: 'A-1',
      sessionYear: '2026',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
      category: 'Textbook',
      description: '',
      language: 'English',
      edition: '2026 Edition',
      websiteVisible: true,
      featured: false,
      bestSeller: false,
      isActive: true
    });
    setIsEditModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook({ ...book });
    setIsEditModalOpen(true);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook || !editingBook.title) return;

    setIsSubmitting(true);
    try {
      if (editingBook.id) {
        await api.updateBook(editingBook.id, {
          ...editingBook,
          userName: currentUser?.name || 'Admin'
        });
      } else {
        await api.createBook({
          ...editingBook,
          userName: currentUser?.name || 'Admin'
        });
      }
      setIsEditModalOpen(false);
      setEditingBook(null);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`Are you sure you want to delete '${book.title}' from catalog?`)) return;
    try {
      await api.deleteBook(book.id, currentUser?.name || 'Admin');
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete book');
    }
  };

  const handleOpenStockAdjust = (book: Book) => {
    setAdjustTargetBook(book);
    setAdjustNewStock(book.physicalStock);
    setAdjustReason('Physical Count / Audit');
    setAdjustNotes('');
    setIsStockAdjustModalOpen(true);
  };

  const handleSaveStockAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetBook) return;

    setIsSubmitting(true);
    try {
      await api.adjustStock({
        bookId: adjustTargetBook.id,
        newStock: Number(adjustNewStock),
        reason: adjustReason,
        notes: adjustNotes,
        userName: currentUser?.name || 'Admin'
      });
      setIsStockAdjustModalOpen(false);
      setAdjustTargetBook(null);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleWebsiteVisibility = async (book: Book) => {
    try {
      await api.updateBook(book.id, {
        websiteVisible: !book.websiteVisible,
        userName: currentUser?.name || 'Admin'
      });
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle visibility');
    }
  };

  return (
    <div className="space-y-5 pb-10">
      
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#F47700]" />
            Books & Unified Inventory
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Single Source of Truth Catalog: Physical, Reserved & Available Stock
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'catalog' ? 'bg-[#082B4C] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Book Catalog ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'movements' ? 'bg-[#082B4C] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Stock Movements ({stockMovements.length})
            </button>
          </div>

          <button
            onClick={handleAddNewBook}
            className="px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3">
              
              {/* Search */}
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, urdu, author, subject, ISBN, barcode, rack..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C] focus:bg-white"
                />
              </div>

              {/* Class Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                >
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>
                      {cls === 'All' ? 'All Classes' : ['Playgroup', 'Nursery', 'Prep', 'Pre 1', 'General', 'Other', 'O/A-Level'].includes(cls) ? cls : `${cls} Class`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                >
                  <option value="All">All Categories</option>
                  <option value="Textbook">Textbook</option>
                  <option value="Notes">Notes / Keybook</option>
                  <option value="Guide">Guide</option>
                  <option value="Stationery">Stationery</option>
                  <option value="Urdu Literature">Urdu Literature</option>
                  <option value="Islamic">Islamic</option>
                  <option value="Novel">Novel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Publisher Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedPublisher}
                  onChange={(e) => setSelectedPublisher(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                >
                  <option value="All">All Publishers</option>
                  {uniquePublishers.map(pub => (
                    <option key={pub} value={pub}>
                      {pub}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Toggles */}
              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    onlyLowStock
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Show only low stock items"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Low Stock</span>
                </button>

                <button
                  onClick={() => setOnlyWebsiteVisible(!onlyWebsiteVisible)}
                  className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                    onlyWebsiteVisible
                      ? 'bg-[#082B4C] text-white border-[#082B4C]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Show website visible items"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Web</span>
                </button>
              </div>

            </div>
          </div>

          {/* Books Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-[#082B4C] text-white text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Book Details</th>
                    <th className="py-3 px-3">Class / Subject</th>
                    <th className="py-3 px-3">Publisher & Rack</th>
                    <th className="py-3 px-3 text-right">Cost Price</th>
                    <th className="py-3 px-3 text-right">Sale Price</th>
                    <th className="py-3 px-3 text-center">Physical</th>
                    <th className="py-3 px-3 text-center">Reserved</th>
                    <th className="py-3 px-3 text-center">Available</th>
                    <th className="py-3 px-3 text-center">Web Store</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBooks.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-gray-500">
                        <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        No books matched the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBooks.map((b) => {
                      const isLowStock = b.availableStock <= b.minStockAlert;
                      return (
                        <tr key={b.id} className="hover:bg-[#F7EEE3]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={b.image}
                                alt={b.title}
                                className="w-10 h-13 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-[#082B4C] line-clamp-1">{b.title}</div>
                                {b.urduTitle && (
                                  <div className="font-urdu text-[11px] text-gray-500 line-clamp-1">{b.urduTitle}</div>
                                )}
                                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                                  <span>Barcode: {b.barcode}</span>
                                  <span>ISBN: {b.isbn}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F7EEE3] text-[#082B4C]">
                              {b.class}
                            </span>
                            <div className="text-gray-600 font-medium text-[11px] mt-0.5">{b.subject}</div>
                            <div className="text-[10px] text-gray-400">{b.category}</div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="text-gray-800 font-medium line-clamp-1">{b.publisher}</div>
                            <div className="text-[11px] text-gray-500">Rack: <span className="font-mono font-bold text-[#082B4C]">{b.rackShelf}</span></div>
                            <div className="text-[10px] text-gray-400">{b.sessionYear}</div>
                          </td>

                          <td className="py-3 px-3 text-right font-mono text-gray-600">
                            {currency} {b.purchasePrice}
                          </td>

                          <td className="py-3 px-3 text-right font-mono font-bold text-[#082B4C]">
                            {currency} {b.salePrice}
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-semibold text-gray-800">
                            {b.physicalStock}
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-amber-700">
                            {b.reservedStock > 0 ? (
                              <span className="px-1.5 py-0.5 bg-amber-100 font-bold rounded">
                                {b.reservedStock}
                              </span>
                            ) : (
                              '0'
                            )}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold font-mono ${
                              b.availableStock <= 0 
                                ? 'bg-red-100 text-red-700' 
                                : isLowStock 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {b.availableStock}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleWebsiteVisibility(b)}
                              title={b.websiteVisible ? 'Visible on Web Store' : 'Hidden from Web Store'}
                              className={`p-1.5 rounded-lg text-xs transition-colors ${
                                b.websiteVisible 
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                            >
                              {b.websiteVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenStockAdjust(b)}
                                title="Adjust Stock (Audit / Damage / Return)"
                                className="p-1.5 bg-gray-100 hover:bg-[#F7EEE3] text-gray-700 hover:text-[#082B4C] rounded-lg transition-colors"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEditBook(b)}
                                title="Edit Book Info"
                                className="p-1.5 bg-gray-100 hover:bg-[#082B4C] text-gray-700 hover:text-white rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {isOwnerOrAdmin && (
                                <button
                                  onClick={() => handleDeleteBook(b)}
                                  title="Delete Book"
                                  className="p-1.5 bg-gray-100 hover:bg-red-600 text-gray-700 hover:text-white rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Stock Movement Audit Log */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2">
              <History className="w-4 h-4 text-[#F47700]" />
              Immutable Stock Movement Ledger
            </h3>
            <span className="text-xs text-gray-500">Every single inventory mutation is logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#082B4C] text-white text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3 text-center">Change</th>
                  <th className="py-3 px-3 text-center">Prev Phys</th>
                  <th className="py-3 px-3 text-center">New Phys</th>
                  <th className="py-3 px-3 text-center">New Avail</th>
                  <th className="py-3 px-3">User / Cashier</th>
                  <th className="py-3 px-4">Notes / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stockMovements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockMovements.map(sm => (
                    <tr key={sm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-gray-600">
                        <div>{sm.date}</div>
                        <div className="text-[10px] text-gray-400">{sm.time}</div>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-gray-900">
                        {sm.bookTitle}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          sm.reason === 'Purchase' ? 'bg-emerald-100 text-emerald-800' :
                          sm.reason === 'Shop Sale' ? 'bg-blue-100 text-blue-800' :
                          sm.reason === 'Website Order' ? 'bg-purple-100 text-purple-800' :
                          sm.reason === 'Website Order Cancelled' ? 'bg-amber-100 text-amber-800' :
                          sm.reason === 'Damage' || sm.reason === 'Loss' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sm.reason}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">
                        <span className={sm.change > 0 ? 'text-emerald-600' : sm.change < 0 ? 'text-red-600' : 'text-gray-600'}>
                          {sm.change > 0 ? `+${sm.change}` : sm.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-gray-500">{sm.previousPhysicalStock}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-gray-800">{sm.newPhysicalStock}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#082B4C]">{sm.newAvailableStock}</td>
                      <td className="py-2.5 px-3 text-gray-700">{sm.userName}</td>
                      <td className="py-2.5 px-4 text-gray-500 text-[11px] font-mono">
                        {sm.notes || sm.referenceId || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Book Modal */}
      {isEditModalOpen && editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
            <div className="bg-[#082B4C] text-white p-4 px-6 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#F47700]" />
                {editingBook.id ? 'Edit Book Details' : 'Add New Book to Inventory'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Book Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingBook.title || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                    placeholder="e.g. 12th Class Physics (Punjab Textbook Board)"
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Book Urdu Title (Optional)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editingBook.urduTitle || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, urduTitle: e.target.value })}
                    placeholder="مثال: فزکس برائے بارہویں جماعت"
                    className="w-full text-xs font-urdu px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Class / Standard *</label>
                  <select
                    value={editingBook.class || '12th'}
                    onChange={(e) => setEditingBook({ ...editingBook, class: e.target.value as BookClass })}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  >
                    <option value="9th">9th Class</option>
                    <option value="10th">10th Class</option>
                    <option value="11th">11th Class</option>
                    <option value="12th">12th Class</option>
                    <option value="General">General / All</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <select
                    value={editingBook.category || 'Textbook'}
                    onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value as BookCategory })}
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  >
                    <option value="Textbook">Textbook</option>
                    <option value="Notes">Notes / Solved Papers</option>
                    <option value="Guide">Guide / Keybook</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Urdu Literature">Urdu Literature</option>
                    <option value="Islamic">Islamic Books</option>
                    <option value="Novel">Novel / Fiction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingBook.subject || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, subject: e.target.value })}
                    placeholder="e.g. Physics, Chemistry, Math..."
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={editingBook.publisher || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, publisher: e.target.value })}
                    placeholder="e.g. Punjab Curriculum & Textbook Board"
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={editingBook.author || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                    placeholder="e.g. Prof. Dr. Rafiq / Umera Ahmed"
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={editingBook.rackShelf || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, rackShelf: e.target.value })}
                    placeholder="e.g. R-12/A"
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={editingBook.barcode || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, barcode: e.target.value })}
                    placeholder="e.g. 896400012011"
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={editingBook.isbn || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                    placeholder="e.g. 978-969-456-121-1"
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Purchase / Cost Price ({currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingBook.purchasePrice ?? ''}
                    onChange={(e) => setEditingBook({ ...editingBook, purchasePrice: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sale Price ({currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingBook.salePrice ?? ''}
                    onChange={(e) => setEditingBook({ ...editingBook, salePrice: Number(e.target.value) })}
                    className="w-full text-xs font-mono font-bold text-[#082B4C] px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Physical Stock Count *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingBook.physicalStock ?? ''}
                    onChange={(e) => setEditingBook({ ...editingBook, physicalStock: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={editingBook.minStockAlert ?? 5}
                    onChange={(e) => setEditingBook({ ...editingBook, minStockAlert: Number(e.target.value) })}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Book Image URL</label>
                  <input
                    type="url"
                    value={editingBook.image || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Book Description</label>
                  <textarea
                    rows={2}
                    value={editingBook.description || ''}
                    onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                    placeholder="Short description for the online book store..."
                    className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                {/* Flags */}
                <div className="md:col-span-2 flex flex-wrap gap-4 pt-2 border-t">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingBook.websiteVisible ?? true}
                      onChange={(e) => setEditingBook({ ...editingBook, websiteVisible: e.target.checked })}
                      className="rounded text-[#082B4C] focus:ring-[#082B4C]"
                    />
                    <span>Website Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingBook.featured ?? false}
                      onChange={(e) => setEditingBook({ ...editingBook, featured: e.target.checked })}
                      className="rounded text-[#082B4C] focus:ring-[#082B4C]"
                    />
                    <span>Featured in Home</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={editingBook.bestSeller ?? false}
                      onChange={(e) => setEditingBook({ ...editingBook, bestSeller: e.target.checked })}
                      className="rounded text-[#082B4C] focus:ring-[#082B4C]"
                    />
                    <span>Best Seller Badge</span>
                  </label>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#082B4C] hover:bg-[#051C33] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Book'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isStockAdjustModalOpen && adjustTargetBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-[#082B4C]">Adjust Physical Stock</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{adjustTargetBook.title}</p>
              </div>
              <button onClick={() => setIsStockAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjust} className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-xl text-xs flex justify-between">
                <div>
                  <span className="text-gray-500">Current Physical Stock:</span>
                  <span className="font-mono font-bold text-gray-800 ml-1">{adjustTargetBook.physicalStock}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reserved (Web):</span>
                  <span className="font-mono font-bold text-amber-700 ml-1">{adjustTargetBook.reservedStock || 0}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">New Physical Stock Count *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustNewStock}
                  onChange={(e) => setAdjustNewStock(Number(e.target.value))}
                  className="w-full text-sm font-mono font-bold px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Adjustment Reason *</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                >
                  <option value="Physical Count / Audit">Physical Count / Shelf Audit</option>
                  <option value="Damage">Damaged Copies Removed</option>
                  <option value="Loss">Loss / Misplaced</option>
                  <option value="Sale Return">Customer Return (Restock)</option>
                  <option value="Manual Adjustment">Manual Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes / Explanation</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. End of month shelf verification"
                  className="w-full text-xs px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#082B4C] hover:bg-[#051C33] rounded-xl"
                >
                  {isSubmitting ? 'Updating...' : 'Update & Log Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
