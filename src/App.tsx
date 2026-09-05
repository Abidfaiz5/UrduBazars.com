import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { AppLayout, type ActiveTab } from './components/layout/AppLayout';

// Modules
import { StorefrontHome } from './components/storefront/StorefrontHome';
import { RemoteOwnerDashboard } from './components/dashboard/RemoteOwnerDashboard';
import { PosBillingView } from './components/pos/PosBillingView';
import { BookInventoryView } from './components/books/BookInventoryView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { CustomersKhataView } from './components/customers/CustomersKhataView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { OnlineOrdersAdminView } from './components/orders/OnlineOrdersAdminView';
import { StoreSettingsView } from './components/settings/StoreSettingsView';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('storefront');

  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'storefront' && <StorefrontHome />}
            {activeTab === 'dashboard' && <RemoteOwnerDashboard />}
            {activeTab === 'pos' && <PosBillingView />}
            {activeTab === 'books' && <BookInventoryView />}
            {activeTab === 'purchases' && <PurchasesView />}
            {activeTab === 'customers' && <CustomersKhataView />}
            {activeTab === 'suppliers' && <SuppliersView />}
            {activeTab === 'orders' && <OnlineOrdersAdminView />}
            {activeTab === 'settings' && <StoreSettingsView />}
          </AppLayout>
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
