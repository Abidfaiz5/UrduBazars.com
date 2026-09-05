import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Store, 
  Truck, 
  Database, 
  Download, 
  Check 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { ShopSettings } from '../../types';

export const StoreSettingsView: React.FC = () => {
  const { settings, refreshAll } = useStore();
  const { isOwnerOrAdmin } = useAuth();

  const [formSettings, setFormSettings] = useState<ShopSettings>({
    shopName: settings?.shopName || 'Urdu Bazars',
    shopUrduName: settings?.shopUrduName || 'اردو بازار',
    tagline: settings?.tagline || 'کتاب سے دنیا تک',
    shopLogo: settings?.shopLogo || '/logo.svg',
    phone: settings?.phone || '042-37353510 / 0300-1234567',
    whatsappNumber: settings?.whatsappNumber || '923001234567',
    email: settings?.email || 'contact@urdubazars.pk',
    address: settings?.address || 'Shop # 14, Main Urdu Bazar, Near Anarkali, Lahore',
    city: settings?.city || 'Lahore',
    currency: settings?.currency || 'Rs.',
    receiptHeader: settings?.receiptHeader || 'URDU BAZARS - LAHORE',
    receiptFooter: settings?.receiptFooter || 'Thank you for choosing Urdu Bazars!\nExchange allowed within 3 days with original bill.',
    defaultLowStockThreshold: settings?.defaultLowStockThreshold || 5,
    deliveryCharge: settings?.deliveryCharge || 250,
    freeDeliveryThreshold: settings?.freeDeliveryThreshold || 3000,
    bankDetails: settings?.bankDetails || {
      bankName: 'Meezan Bank Ltd',
      accountTitle: 'Urdu Bazars Bookstore',
      accountNumber: '02010108920192',
      iban: 'PK45MEZN0002010108920192'
    },
    jazzCashNumber: settings?.jazzCashNumber || '0300-1234567',
    easypaisaNumber: settings?.easypaisaNumber || '0300-1234567'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateSettings(formSettings);
      await refreshAll();
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = () => {
    window.open('/api/backup/export', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-[#EADBC8] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#082B4C] flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#F47700]" />
            Shop & System Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure shop identity, receipt templates, shipping rules and business parameters.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Shop Information */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2 border-b pb-2">
            <Store className="w-4 h-4 text-[#F47700]" />
            Business Profile & Receipts
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Bookstore Name</label>
              <input
                type="text"
                required
                value={formSettings.shopName}
                onChange={(e) => setFormSettings({ ...formSettings, shopName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Bookstore Urdu Name</label>
              <input
                type="text"
                dir="rtl"
                value={formSettings.shopUrduName}
                onChange={(e) => setFormSettings({ ...formSettings, shopUrduName: e.target.value })}
                className="w-full font-urdu px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Urdu Slogan / Tagline</label>
              <input
                type="text"
                dir="rtl"
                value={formSettings.tagline}
                onChange={(e) => setFormSettings({ ...formSettings, tagline: e.target.value })}
                className="w-full font-urdu px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                required
                value={formSettings.currency}
                onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                className="w-full font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Shop Phone / Landline</label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">WhatsApp Helpline Number</label>
              <input
                type="text"
                value={formSettings.whatsappNumber}
                onChange={(e) => setFormSettings({ ...formSettings, whatsappNumber: e.target.value })}
                placeholder="923001234567"
                className="w-full font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={formSettings.address}
                onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Receipt Printed Footer Notice</label>
              <textarea
                rows={2}
                value={formSettings.receiptFooter}
                onChange={(e) => setFormSettings({ ...formSettings, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>
          </div>
        </div>

        {/* E-Commerce Shipping Rules */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2 border-b pb-2">
            <Truck className="w-4 h-4 text-[#F47700]" />
            Online Store Shipping Rules
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Standard Courier Delivery Charges ({formSettings.currency})</label>
              <input
                type="number"
                min="0"
                value={formSettings.deliveryCharge}
                onChange={(e) => setFormSettings({ ...formSettings, deliveryCharge: Number(e.target.value) })}
                className="w-full font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Free Delivery Threshold ({formSettings.currency})</label>
              <input
                type="number"
                min="0"
                value={formSettings.freeDeliveryThreshold}
                onChange={(e) => setFormSettings({ ...formSettings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full font-mono px-3 py-2 border rounded-xl outline-hidden focus:ring-2 focus:ring-[#082B4C]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-[#082B4C] hover:bg-[#051C33] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-colors"
          >
            <Save className="w-4 h-4 text-[#F47700]" />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

      {/* Database Backup & Maintenance Section */}
      {isOwnerOrAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-sm text-[#082B4C] flex items-center gap-2 border-b pb-2">
            <Database className="w-4 h-4 text-[#F47700]" />
            Database Backup & Data Portability
          </h3>
          <p className="text-xs text-gray-600">
            Export the complete single-source-of-truth JSON database containing all books, sales, purchases, customer ledgers, and audit logs.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-4 py-2 bg-gray-100 hover:bg-[#082B4C] hover:text-white text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON Database Backup</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
