import React from 'react';
import { Printer, X, Check, Share2, MessageCircle } from 'lucide-react';
import type { Sale } from '../../types';
import { useStore } from '../../context/StoreContext';
import { UrduBazarsLogo } from '../common/UrduBazarsLogo';

interface PrintableReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ sale, onClose }) => {
  const { settings } = useStore();
  const currency = settings?.currency || 'Rs.';

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    let text = `🧾 *RECEIPT - URDU BAZARS*\n`;
    text += `Invoice: ${sale.invoiceNo}\n`;
    text += `Date: ${new Date(sale.date).toLocaleString()}\n`;
    text += `Customer: ${sale.customerName}\n`;
    text += `------------------------\n`;
    sale.items.forEach((it, idx) => {
      text += `${idx + 1}. ${it.title}\n   ${it.quantity} x ${currency}${it.salePrice} = ${currency}${it.subtotal}\n`;
    });
    text += `------------------------\n`;
    text += `Total: ${currency}${sale.grandTotal}\n`;
    text += `Paid: ${currency}${sale.paidAmount} (${sale.paymentMethod})\n`;
    if (sale.remainingAmount > 0) {
      text += `Remaining Balance: ${currency}${sale.remainingAmount}\n`;
    }
    text += `\nThank you for shopping at Urdu Bazars!`;

    const phone = sale.customerPhone?.replace(/[^0-9]/g, '');
    const url = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs no-print-bg">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Actions Bar (Screen only) */}
        <div className="bg-[#082B4C] text-white p-3.5 px-5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#F47700] rounded-lg">
              <Check className="w-4 h-4 text-white" />
            </span>
            <span className="font-bold text-sm">Sale Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              title="Share on WhatsApp"
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-[#F47700] hover:bg-[#D46600] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Slip Container */}
        <div className="overflow-y-auto p-6 bg-white text-gray-900" id="printable-receipt">
          
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-300">
            <div className="flex justify-center mb-2">
              <UrduBazarsLogo size="sm" variant="vertical" />
            </div>
            <p className="text-xs text-gray-600 mt-1">{settings?.address || 'Urdu Bazar, Lahore'}</p>
            <p className="text-xs text-gray-600">Ph: {settings?.phone || '0300-1234567'} | WhatsApp: {settings?.whatsappNumber}</p>
          </div>

          {/* Invoice Meta */}
          <div className="py-3 border-b border-dashed border-gray-300 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Invoice No:</span>
              <span className="font-bold font-mono text-gray-900">{sale.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Date & Time:</span>
              <span className="text-gray-800">{new Date(sale.date).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Customer:</span>
              <span className="font-semibold text-gray-900">{sale.customerName}</span>
            </div>
            {sale.customerPhone && (
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Phone:</span>
                <span className="text-gray-800 font-mono">{sale.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Cashier:</span>
              <span className="text-gray-800">{sale.cashierName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-gray-300">
            <div className="grid grid-cols-12 text-[11px] font-bold text-gray-500 uppercase tracking-wider pb-1 mb-1 border-b border-gray-200">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-1.5 py-1">
              {sale.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-xs text-gray-800 items-baseline">
                  <div className="col-span-6 font-medium pr-1">
                    <div className="line-clamp-2">{item.title}</div>
                    {item.discount > 0 && (
                      <span className="text-[10px] text-amber-700">Disc: -{currency}{item.discount}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-mono">{item.quantity}</div>
                  <div className="col-span-2 text-right font-mono">{currency}{item.salePrice}</div>
                  <div className="col-span-2 text-right font-bold font-mono">{currency}{item.subtotal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Calculation */}
          <div className="py-3 border-b border-dashed border-gray-300 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">{currency} {sale.subtotal.toLocaleString()}</span>
            </div>

            {(sale.itemDiscount > 0 || sale.billDiscount > 0) && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span className="font-mono font-medium">-{currency} {((sale.itemDiscount || 0) + (sale.billDiscount || 0)).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-[#082B4C] pt-1 border-t border-gray-200">
              <span>Grand Total:</span>
              <span className="font-mono text-base">{currency} {sale.grandTotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-700 pt-1">
              <span>Paid ({sale.paymentMethod}):</span>
              <span className="font-mono font-bold text-gray-900">{currency} {sale.paidAmount.toLocaleString()}</span>
            </div>

            {sale.remainingAmount > 0 && (
              <div className="flex justify-between text-red-700 font-bold bg-red-50 p-1.5 rounded-lg mt-1">
                <span>Udhaar / Balance:</span>
                <span className="font-mono">{currency} {sale.remainingAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer Notes & Urdu Tagline */}
          <div className="text-center pt-4 text-xs space-y-2 text-gray-500">
            <div className="font-urdu text-sm font-bold text-[#082B4C]">
              کتاب سے دنیا تک
            </div>
            <p className="text-[10px] leading-relaxed whitespace-pre-line">
              {settings?.receiptFooter || 'Thank you for your visit!\nExchange within 3 days with receipt.'}
            </p>
            <p className="text-[9px] text-gray-400 font-mono">
              Powered by Urdu Bazars Business Engine
            </p>
          </div>

        </div>

        {/* Action Footer (Screen only) */}
        <div className="bg-gray-50 p-3 px-6 border-t border-gray-100 flex justify-between items-center no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close / New Sale
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-[#082B4C] hover:bg-[#051C33] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
};
