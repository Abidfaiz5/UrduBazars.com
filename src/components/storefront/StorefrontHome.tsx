import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingBag, 
  BookOpen, 
  Truck, 
  ShieldCheck, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  X, 
  ArrowRight, 
  MessageCircle, 
  Sparkles,
  Building2,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import type { Book, WebsiteOrder } from '../../types';
import { OrderTrackingModal } from './OrderTrackingModal';

export const StorefrontHome: React.FC = () => {
  const { books, settings, refreshAll } = useStore();
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    cartCount, 
    cartSubtotal, 
    isCartOpen, 
    setIsCartOpen 
  } = useCart();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPublisher, setSelectedPublisher] = useState('All');
  const [selectedBookForModal, setSelectedBookForModal] = useState<Book | null>(null);

  // Extract all unique publishers and their counts
  const publisherStats = useMemo(() => {
    const map = new Map<string, number>();
    books.forEach(b => {
      if (b.isActive && b.websiteVisible && b.publisher && b.publisher.trim()) {
        const pub = b.publisher.trim();
        map.set(pub, (map.get(pub) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [books]);

  // Featured top publishers list for fast cards/chips
  const topFeaturedPublishers = [
    { name: 'AZ International', shortName: 'AZ International', emblem: '📘' },
    { name: 'Booktime Publication', shortName: 'Booktime Publication', emblem: '📕' },
    { name: 'Punjab Curriculum and Textbook Board', shortName: 'PTB (Punjab Board)', emblem: '🏛️' },
    { name: 'Caravan Book House', shortName: 'Caravan Books', emblem: '📖' },
    { name: 'Ilmi Kitab Khana', shortName: 'Ilmi Kitab Khana', emblem: '✍️' },
    { name: 'Scholar Publications', shortName: 'Scholar Publications', emblem: '🎓' },
    { name: 'Dogar Brothers', shortName: 'Dogar Brothers (Dogar Books)', emblem: '🎯' },
    { name: 'Ferozsons', shortName: 'Ferozsons Lahore', emblem: '📜' },
    { name: 'Maktaba Dar-us-Salam', shortName: 'Dar-us-Salam', emblem: '🕌' },
    { name: 'Oxford University Press', shortName: 'Oxford (OUP)', emblem: '🌐' }
  ];

  // Available classes in sequence
  const availableClasses = useMemo(() => {
    const classSequence = ['All', 'Playgroup', 'Nursery', 'Prep', 'Pre 1', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'O/A-Level', 'General', 'Other'];
    const present = new Set<string>();
    books.forEach(b => {
      if (b.isActive && b.websiteVisible && b.class) present.add(b.class);
    });
    return classSequence.filter(c => c === 'All' || present.has(c));
  }, [books]);

  // Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'JazzCash' | 'Easypaisa' | 'Bank'>('COD');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<WebsiteOrder | null>(null);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const currency = settings?.currency || 'Rs.';
  const deliveryCharges = settings?.deliveryCharge ?? 250;
  const freeShippingThreshold = settings?.freeDeliveryThreshold ?? 3000;
  const effectiveDelivery = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : deliveryCharges;
  const orderGrandTotal = cartSubtotal + effectiveDelivery;

  // Filter books visible on web
  const visibleBooks = useMemo(() => {
    return books.filter(b => {
      if (!b.isActive || !b.websiteVisible) return false;
      if (selectedClass !== 'All' && b.class !== selectedClass) return false;
      if (selectedCategory !== 'All' && b.category !== selectedCategory) return false;
      if (selectedPublisher !== 'All' && b.publisher !== selectedPublisher) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        b.title.toLowerCase().includes(q) ||
        (b.urduTitle && b.urduTitle.toLowerCase().includes(q)) ||
        b.author.toLowerCase().includes(q) ||
        b.subject.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q)
      );
    });
  }, [books, selectedClass, selectedCategory, selectedPublisher, searchTerm]);

  const handleAddToCart = (book: Book) => {
    addToCart(book, 1);
    setAddedAnimationId(book.id);
    setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName || !customerPhone || !shippingAddress) {
      alert('Please fill out all required delivery fields.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: shippingAddress.trim(),
        city: city.trim(),
        items: cart.map(it => ({
          bookId: it.book.id,
          title: it.book.title,
          image: it.book.image,
          quantity: it.quantity,
          unitPrice: it.book.salePrice,
          subtotal: it.quantity * it.book.salePrice
        })),
        subtotal: cartSubtotal,
        shippingFee: effectiveDelivery,
        totalAmount: orderGrandTotal,
        paymentMethod: paymentMethod,
        notes: orderNotes
      };

      const result = await api.createOrder(orderPayload);
      setConfirmedOrder(result);
      clearCart();
      setIsCheckoutOpen(false);
      await refreshAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7EEE3]/30 pb-20">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#082B4C] text-white text-[11px] py-2 px-4 text-center font-medium flex items-center justify-between">
        <div className="hidden sm:block">
          📚 Direct from Lahore Urdu Bazar to your doorstep!
        </div>
        <div className="mx-auto sm:mx-0 font-bold text-[#F47700]">
          Free Delivery on orders above {currency} {freeShippingThreshold.toLocaleString()}
        </div>
        <div className="hidden md:flex items-center gap-4 text-white/80">
          <button onClick={() => setIsTrackingOpen(true)} className="hover:underline font-semibold">
            Track Order
          </button>
          <span>Helpline: {settings?.phone || '0300-1234567'}</span>
        </div>
      </div>

      {/* Hero Banner with Brand Imagery & Urdu Calligraphy */}
      <div className="bg-linear-to-b from-[#082B4C] to-[#0D3B66] text-white py-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs text-white border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-[#F47700]" />
              <span>100% Authentic Textbooks & Exam Guides</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              Urdu Bazars Online
            </h1>

            <p className="font-urdu text-xl sm:text-2xl text-[#EADBC8] leading-relaxed">
              کتاب سے دنیا تک — پاکستان کا معتبر ترین آن لائن بک سٹور
            </p>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Get 9th, 10th, 11th, 12th Board Textbooks, Solved Notes, Islamic literature, and Stationery with instant nationwide home delivery and live stock availability.
            </p>

            {/* Hero Search Box */}
            <div className="pt-2">
              <div className="relative flex items-center max-w-lg shadow-xl rounded-2xl overflow-hidden bg-white">
                <Search className="w-5 h-5 text-gray-400 absolute left-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search books by title, author, subject, class..."
                  className="w-full pl-12 pr-28 py-3.5 text-xs sm:text-sm text-gray-900 outline-hidden"
                />
                <button
                  type="button"
                  className="absolute right-1.5 px-4 py-2 bg-[#F47700] hover:bg-[#D46600] text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {/* Quick Perks Badge Cards */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-xs shrink-0">
            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
              <Truck className="w-5 h-5 text-[#F47700]" />
              <h4 className="text-xs font-bold">Fast Courier</h4>
              <p className="text-[10px] text-white/70">Cash on Delivery across all cities of Pakistan</p>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold">Live Inventory</h4>
              <p className="text-[10px] text-white/70">Real-time stock from our Lahore Urdu Bazar shop</p>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
              <BookOpen className="w-5 h-5 text-amber-300" />
              <h4 className="text-xs font-bold">PTB & Boards</h4>
              <p className="text-[10px] text-white/70">Complete syllabus books for all educational boards</p>
            </div>

            <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 space-y-1">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold">WhatsApp Order</h4>
              <p className="text-[10px] text-white/70">Instant support & book request service</p>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Top Publishers & Boards Showcase Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-3xl p-5 border border-[#EADBC8] shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#F7EEE3] text-[#082B4C] rounded-xl">
                <Building2 className="w-5 h-5 text-[#F47700]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#082B4C]">
                  Shop by Publisher & Textbook Board
                </h3>
                <p className="text-[11px] text-gray-500">
                  Direct official syllabus books, guide notes, and publications from Urdu Bazar
                </p>
              </div>
            </div>

            {selectedPublisher !== 'All' && (
              <button
                onClick={() => setSelectedPublisher('All')}
                className="self-start sm:self-auto text-xs font-bold text-[#F47700] hover:text-[#D46600] flex items-center gap-1 bg-[#F7EEE3] px-3 py-1 rounded-xl"
              >
                <span>Showing: {selectedPublisher}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Horizontal Publisher Badges / Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <button
              onClick={() => setSelectedPublisher('All')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                selectedPublisher === 'All'
                  ? 'bg-[#082B4C] text-white border-[#082B4C] shadow-sm'
                  : 'bg-gray-50 hover:bg-[#F7EEE3]/60 text-gray-700 border-gray-200'
              }`}
            >
              <div className="text-lg mb-1">📚</div>
              <div>
                <div className="text-xs font-bold leading-tight">All Publishers</div>
                <div className={`text-[10px] mt-0.5 ${selectedPublisher === 'All' ? 'text-white/70' : 'text-gray-400'}`}>
                  {books.filter(b => b.isActive && b.websiteVisible).length} books
                </div>
              </div>
            </button>

            {topFeaturedPublishers.map(pub => {
              const count = publisherStats.find(p => p.name.toLowerCase().includes(pub.name.toLowerCase()) || pub.name.toLowerCase().includes(p.name.toLowerCase()))?.count || 0;
              const isSelected = selectedPublisher === pub.name;

              return (
                <button
                  key={pub.name}
                  onClick={() => setSelectedPublisher(isSelected ? 'All' : pub.name)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F47700] text-white border-[#F47700] shadow-sm'
                      : 'bg-gray-50 hover:bg-[#F7EEE3]/60 text-gray-700 border-gray-200'
                  }`}
                >
                  <div className="text-lg mb-1">{pub.emblem}</div>
                  <div>
                    <div className="text-xs font-bold leading-tight line-clamp-2">{pub.shortName}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {count > 0 ? `${count} books` : 'Official'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Catalog Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Comprehensive Class, Category & Publisher Filter Controls Bar */}
        <div className="bg-white p-4 rounded-3xl border border-[#EADBC8] shadow-xs space-y-3.5">
          
          {/* Row 1: Class Selection Pills */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#F47700]" />
                <span>Class:</span>
              </span>
              {availableClasses.map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedClass === cls
                      ? 'bg-[#082B4C] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cls === 'All' ? 'All Classes' : ['Playgroup', 'Nursery', 'Prep', 'Pre 1', 'General', 'O/A-Level'].includes(cls) ? cls : `${cls} Class`}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-500 font-mono shrink-0 hidden md:block">
              Found <strong className="text-[#082B4C]">{visibleBooks.length}</strong> books
            </div>
          </div>

          {/* Row 2: Category & Publisher Dropdowns / Section Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-0.5">
            
            {/* All Categories Dropdown */}
            <div className="md:col-span-5 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#082B4C]" />
                <span>Category:</span>
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              >
                <option value="All">All Categories (Textbooks, Notes, Guides...)</option>
                <option value="Textbook">Textbooks (PTB / Boards)</option>
                <option value="Notes">Notes / Keybooks / Solutions</option>
                <option value="Guide">Helping Guides & Solved Papers</option>
                <option value="Model Papers">Model & Past Papers</option>
                <option value="Urdu Literature">Urdu Literature & Poetry</option>
                <option value="Islamic">Islamic & Quranic Studies</option>
                <option value="Novel">Novels & General Reading</option>
                <option value="Stationery">Stationery & Student Accessories</option>
                <option value="Other">Other Publications</option>
              </select>
            </div>

            {/* Publishers Section Dropdown */}
            <div className="md:col-span-5 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#082B4C]" />
                <span>Publisher:</span>
              </span>
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="w-full text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              >
                <option value="All">All Publishers ({books.length} titles)</option>
                {publisherStats.map(pub => (
                  <option key={pub.name} value={pub.name}>
                    {pub.name} ({pub.count} books)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Reset Filter Button */}
            <div className="md:col-span-2 flex items-center justify-end">
              {(selectedClass !== 'All' || selectedCategory !== 'All' || selectedPublisher !== 'All' || searchTerm) ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClass('All');
                    setSelectedCategory('All');
                    setSelectedPublisher('All');
                  }}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Filters</span>
                </button>
              ) : (
                <div className="text-[11px] text-gray-400 font-mono text-center w-full">
                  {visibleBooks.length} available
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Books Grid */}
        {visibleBooks.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-200 shadow-xs space-y-3">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">No books found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              We couldn&apos;t find any books matching your criteria. Try selecting another Publisher, Class or Category, or clear all filters.
            </p>
            <button
              onClick={() => { 
                setSearchTerm(''); 
                setSelectedClass('All'); 
                setSelectedCategory('All'); 
                setSelectedPublisher('All'); 
              }}
              className="px-4 py-2 bg-[#082B4C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#051C33]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visibleBooks.map(book => {
              const isOut = book.availableStock <= 0;
              const isAdded = addedAnimationId === book.id;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg hover:border-[#F47700] transition-all flex flex-col justify-between group"
                >
                  {/* Image Container */}
                  <div 
                    onClick={() => setSelectedBookForModal(book)}
                    className="relative aspect-3/4 bg-gray-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Class Tag */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#082B4C] text-white shadow-xs">
                      {book.class}
                    </div>

                    {/* Best Seller / Featured Badge */}
                    {book.bestSeller && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F47700] text-white shadow-xs">
                        Best Seller
                      </div>
                    )}

                    {/* Stock Status Badge */}
                    <div className="absolute bottom-2 left-2 right-2">
                      {isOut ? (
                        <div className="px-2 py-0.5 text-center rounded-md text-[10px] font-bold bg-red-600/90 backdrop-blur-xs text-white">
                          Out of Stock
                        </div>
                      ) : (
                        <div className="px-2 py-0.5 text-center rounded-md text-[10px] font-bold bg-emerald-600/90 backdrop-blur-xs text-white">
                          In Stock ({book.availableStock} copies)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 
                        onClick={() => setSelectedBookForModal(book)}
                        className="text-xs font-bold text-[#082B4C] line-clamp-2 leading-snug cursor-pointer group-hover:text-[#F47700] transition-colors"
                      >
                        {book.title}
                      </h3>
                      {book.urduTitle && (
                        <p className="font-urdu text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                          {book.urduTitle}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
                        {book.publisher || book.author}
                      </p>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-mono text-sm font-extrabold text-[#082B4C]">
                          {currency} {book.salePrice}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={() => handleAddToCart(book)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          isAdded 
                            ? 'bg-emerald-600 text-white scale-110' 
                            : isOut 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-[#082B4C] hover:bg-[#F47700] text-white active:scale-95'
                        }`}
                        title={isOut ? 'Out of Stock' : 'Add to Cart'}
                      >
                        {isAdded ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating View Cart Button (Mobile & Desktop) */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-bounce">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-3.5 bg-[#F47700] hover:bg-[#D46600] text-white font-extrabold text-sm rounded-full shadow-2xl flex items-center gap-3 transition-transform active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-[#082B4C] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            </div>
            <span>View Cart ({currency} {cartSubtotal.toLocaleString()})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slide-over Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 px-6 bg-[#082B4C] text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#F47700]" />
                <h3 className="font-bold text-base">Your Book Bag ({cartCount})</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8 space-y-2">
                  <ShoppingBag className="w-12 h-12 opacity-30 text-[#082B4C]" />
                  <p className="font-bold text-gray-600">Your bag is empty</p>
                  <p className="text-xs">Browse books and add them to your order</p>
                </div>
              ) : (
                cart.map(it => (
                  <div key={it.book.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex gap-3 items-center">
                    <img
                      src={it.book.image}
                      alt={it.book.title}
                      className="w-12 h-16 object-cover rounded-lg bg-gray-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[#082B4C] line-clamp-1">{it.book.title}</h4>
                      <p className="text-[11px] font-mono text-gray-500">{currency} {it.book.salePrice} each</p>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-lg bg-white overflow-hidden">
                          <button
                            onClick={() => updateQuantity(it.book.id, it.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 text-gray-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.book.id, it.quantity + 1)}
                            disabled={it.quantity >= it.book.availableStock}
                            className="px-2 py-0.5 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(it.book.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-xs text-[#082B4C]">
                      {currency} {it.quantity * it.book.salePrice}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Checkout */}
            {cart.length > 0 && (
              <div className="p-4 px-6 bg-gray-50 border-t border-gray-200 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{currency} {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Courier Delivery Charges:</span>
                    <span className="font-mono">
                      {effectiveDelivery === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `${currency} ${effectiveDelivery}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-extrabold text-base text-[#082B4C] pt-2 border-t">
                    <span>Total:</span>
                    <span className="font-mono text-[#F47700]">{currency} {orderGrandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 bg-[#F47700] hover:bg-[#D46600] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBookForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 px-6 bg-[#082B4C] text-white flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F47700]">
                {selectedBookForModal.class} Class Textbook
              </span>
              <button onClick={() => setSelectedBookForModal(null)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
              <div className="sm:col-span-5">
                <img
                  src={selectedBookForModal.image}
                  alt={selectedBookForModal.title}
                  className="w-full aspect-3/4 object-cover rounded-2xl shadow-md border"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="sm:col-span-7 space-y-3 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#082B4C] leading-snug">
                    {selectedBookForModal.title}
                  </h3>
                  {selectedBookForModal.urduTitle && (
                    <p className="font-urdu text-base text-gray-600 mt-1">
                      {selectedBookForModal.urduTitle}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <p><span className="font-semibold text-gray-800">Subject:</span> {selectedBookForModal.subject}</p>
                    <p className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">Publisher:</span> 
                      <button
                        onClick={() => {
                          setSelectedPublisher(selectedBookForModal.publisher);
                          setSelectedBookForModal(null);
                        }}
                        className="text-[#F47700] hover:underline font-bold inline-flex items-center gap-1"
                        title="View all books by this publisher"
                      >
                        <span>{selectedBookForModal.publisher}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </p>
                    <p><span className="font-semibold text-gray-800">Author:</span> {selectedBookForModal.author || 'Board Syllabus'}</p>
                    <p className="font-mono"><span className="font-semibold text-gray-800">ISBN:</span> {selectedBookForModal.isbn}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-3 line-clamp-3">
                    {selectedBookForModal.description || 'Authentic syllabus book prescribed by educational board with clear diagrams, solved examples, and review questions.'}
                  </p>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Price:</span>
                    <span className="font-mono text-2xl font-black text-[#082B4C]">
                      {currency} {selectedBookForModal.salePrice}
                    </span>
                  </div>

                  <button
                    disabled={selectedBookForModal.availableStock <= 0}
                    onClick={() => {
                      handleAddToCart(selectedBookForModal);
                      setSelectedBookForModal(null);
                    }}
                    className="w-full py-3 bg-[#F47700] hover:bg-[#D46600] disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{selectedBookForModal.availableStock <= 0 ? 'Out of Stock' : 'Add to Bag'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95">
            <div className="bg-[#082B4C] text-white p-4 px-6 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#F47700]" />
                Complete Online Book Order
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad..."
                    className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Complete Home / Academy Delivery Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House / Street / Mohallah / Area name"
                    className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
                  />
                </div>

                {/* Payment Selection */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1.5">Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['COD', 'JazzCash', 'Easypaisa', 'Bank'] as const).map(pm => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => setPaymentMethod(pm)}
                        className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                          paymentMethod === pm
                            ? 'bg-[#082B4C] text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pm === 'COD' ? 'Cash on Delivery' : pm}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-600 mb-1">Special Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Call before delivery"
                    className="w-full px-3 py-1.5 border rounded-xl outline-hidden"
                  />
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-3.5 bg-gray-50 rounded-2xl border space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Books Subtotal ({cart.length} items):</span>
                  <span className="font-mono">{currency} {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges:</span>
                  <span className="font-mono">{effectiveDelivery === 0 ? 'FREE' : `${currency} ${effectiveDelivery}`}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#082B4C] pt-1.5 border-t">
                  <span>Total Amount to Pay:</span>
                  <span className="font-mono text-base text-[#F47700]">{currency} {orderGrandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="px-6 py-3 bg-[#F47700] hover:bg-[#D46600] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingOrder ? 'Reserving Stock & Placing Order...' : 'CONFIRM ORDER'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Confirmed Order Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Order Placed Successfully</span>
              <h3 className="text-xl font-black text-[#082B4C] mt-1">Thank you for your order!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Your order ID is <span className="font-mono font-bold text-[#082B4C]">{confirmedOrder.orderNumber}</span>. Your books have been reserved in our inventory.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-xs space-y-1.5 text-left border">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900">{confirmedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Payable:</span>
                <span className="font-mono font-bold text-[#082B4C]">{currency} {confirmedOrder.totalAmount.toLocaleString()} ({confirmedOrder.paymentMethod})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="text-gray-800 truncate max-w-[200px]">{confirmedOrder.shippingAddress}, {confirmedOrder.city}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const msg = `Hi Urdu Bazars, I just placed order ${confirmedOrder.orderNumber} for Rs. ${confirmedOrder.totalAmount}.`;
                  window.open(`https://wa.me/923001234567?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmedOrder(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />

    </div>
  );
};
