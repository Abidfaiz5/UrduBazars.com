import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  BookOpen, 
  Package, 
  Users, 
  Building2, 
  ShoppingBag, 
  Settings, 
  Globe, 
  Shield, 
  Menu, 
  X, 
  RefreshCw,
  LogOut,
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { UrduBazarsLogo } from '../common/UrduBazarsLogo';
import type { UserRole } from '../../types';

export type ActiveTab = 
  | 'storefront'
  | 'dashboard' 
  | 'pos' 
  | 'books' 
  | 'purchases' 
  | 'customers' 
  | 'suppliers' 
  | 'orders' 
  | 'settings';

interface AppLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const { currentUser, switchUserRole, isOwnerOrAdmin } = useAuth();
  const { isLoading, lastSyncTime, orders, books } = useStore();
  const { cartCount, setIsCartOpen } = useCart();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const lowStockCount = books.filter(b => b.availableStock <= b.minStockAlert).length;

  const isStoreMode = activeTab === 'storefront';

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Owner Dashboard', icon: LayoutDashboard, badge: null, roles: ['Owner', 'Manager', 'Cashier', 'Staff'] },
    { id: 'pos' as ActiveTab, label: 'POS Billing & Barcode', icon: Calculator, badge: null, roles: ['Owner', 'Manager', 'Cashier'] },
    { id: 'books' as ActiveTab, label: 'Books & Inventory', icon: BookOpen, badge: lowStockCount > 0 ? `${lowStockCount} Low` : null, roles: ['Owner', 'Manager', 'Cashier', 'Staff'] },
    { id: 'purchases' as ActiveTab, label: 'Purchases & Inward', icon: Package, badge: null, roles: ['Owner', 'Manager'] },
    { id: 'customers' as ActiveTab, label: 'Customer Khata (ادھار)', icon: Users, badge: null, roles: ['Owner', 'Manager', 'Cashier'] },
    { id: 'suppliers' as ActiveTab, label: 'Suppliers & Payables', icon: Building2, badge: null, roles: ['Owner', 'Manager'] },
    { id: 'orders' as ActiveTab, label: 'Web Orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} New` : null, roles: ['Owner', 'Manager', 'Cashier', 'Staff'] },
    { id: 'settings' as ActiveTab, label: 'Store Settings', icon: Settings, badge: null, roles: ['Owner', 'Manager'] },
  ];

  const handleRoleChange = (role: UserRole) => {
    switchUserRole(role);
    setIsRoleDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7EEE3]/30">
      
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-[#EADBC8] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveTab('storefront')}
              className="cursor-pointer flex items-center"
            >
              <UrduBazarsLogo size="sm" variant="horizontal" />
            </div>
          </div>

          {/* Center Mode Switcher Tabs */}
          <div className="hidden md:flex items-center p-1 bg-[#F7EEE3] rounded-2xl border border-[#EADBC8] text-xs font-bold">
            <button
              onClick={() => setActiveTab('storefront')}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                isStoreMode
                  ? 'bg-[#082B4C] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Globe className="w-4 h-4 text-[#F47700]" />
              <span>Public Online Bookstore</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'storefront' ? 'dashboard' : activeTab)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                !isStoreMode
                  ? 'bg-[#082B4C] text-white shadow-xs'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#F47700]" />
              <span>Shop POS & Management Suite</span>
            </button>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            
            {/* Live Sync Status indicator */}
            <div 
              title="Real-time Database synchronization heartbeat across all tabs & devices"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-700"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Sync</span>
            </div>

            {/* Shopping Bag Button if in Storefront mode */}
            {isStoreMode && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#082B4C] hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#F47700] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher Menu */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-gray-100 hover:bg-[#F7EEE3] border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition-colors"
              >
                <Shield className="w-4 h-4 text-[#F47700]" />
                <span className="hidden sm:inline">{currentUser?.name}</span>
                <span className="px-1.5 py-0.5 bg-[#082B4C] text-white text-[10px] rounded-md">
                  {currentUser?.role}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Switch Active User Role
                  </div>
                  {(['OWNER', 'ADMIN', 'CASHIER', 'STAFF'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                        currentUser?.role === role ? 'font-bold text-[#082B4C] bg-[#F7EEE3]/50' : 'text-gray-700'
                      }`}
                    >
                      <span>{role}</span>
                      {currentUser?.role === role && <UserCheck className="w-4 h-4 text-[#F47700]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main App Body */}
      {isStoreMode ? (
        /* Public Storefront Mode: Full Width Content */
        <main className="flex-1">
          {children}
        </main>
      ) : (
        /* Management Mode: Sidebar + Content Layout */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col lg:flex-row gap-6 pt-5">
          
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-2">
            <div className="bg-white rounded-2xl p-3 border border-[#EADBC8] shadow-xs space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[#082B4C] text-white shadow-xs'
                        : 'text-gray-700 hover:bg-[#F7EEE3] hover:text-[#082B4C]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#F47700]' : 'text-gray-500'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isActive ? 'bg-[#F47700] text-white' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-2 mt-2 border-t border-gray-100">
                <button
                  onClick={() => setActiveTab('storefront')}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#F7EEE3] flex items-center gap-2.5 transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#082B4C]" />
                  <span>Switch to Online Store</span>
                </button>
              </div>
            </div>

            {/* Urdu Bazars Branding Slogan Box */}
            <div className="p-4 bg-[#082B4C] text-white rounded-2xl shadow-xs text-center space-y-1">
              <div className="font-urdu text-sm font-bold text-[#EADBC8]">
                کتاب سے دنیا تک
              </div>
              <p className="text-[10px] text-white/70">
                Lahore Urdu Bazar Unified Inventory
              </p>
            </div>
          </aside>

          {/* Mobile Slide-down Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden bg-white p-4 rounded-2xl border border-gray-200 shadow-xl space-y-2 mb-4">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Management Modules
              </div>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                      isActive ? 'bg-[#082B4C] text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setActiveTab('storefront');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-[#F47700] hover:bg-orange-50 flex items-center gap-2 pt-2 border-t"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Online Bookstore</span>
              </button>
            </div>
          )}

          {/* Main Module Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

        </div>
      )}

      {/* Global Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6 text-center text-xs text-gray-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#082B4C]">Urdu Bazars</span>
            <span>&bull;</span>
            <span className="font-urdu text-sm font-bold text-[#082B4C]">کتاب سے دنیا تک</span>
          </div>
          <div className="text-[11px] text-gray-400">
            All-in-one Book Shop Management, POS, Inventory, E-Commerce & Remote Owner Dashboard
          </div>
        </div>
      </footer>

    </div>
  );
};
