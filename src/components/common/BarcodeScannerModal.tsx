import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, Search, BookOpen, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import type { Book } from '../../types';
import { useStore } from '../../context/StoreContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookScanned: (book: Book) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onBookScanned
}) => {
  const { books } = useStore();
  const [manualCode, setManualCode] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [lastScannedBook, setLastScannedBook] = useState<Book | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'ub-camera-barcode-reader';

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualCode('');
      setScanError(null);
      setLastScannedBook(null);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setScanError(null);
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScanError('No camera found on this device. You can type or paste the barcode/ISBN below.');
        return;
      }

      // Prefer back camera on mobile
      const cameraId = cameras.length > 1 ? cameras[cameras.length - 1].id : cameras[0].id;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 260, height: 160 }
        },
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        () => {
          // ignore transient frame decode errors
        }
      );
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera scan failed to initialize:', err);
      setScanError('Camera permission was denied or camera is unavailable. Use manual barcode/ISBN search below.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setIsCameraActive(false);
    }
  };

  const handleScannedCode = (code: string) => {
    const clean = code.trim().toLowerCase();
    const found = books.find(
      b => b.barcode.toLowerCase() === clean ||
           b.isbn.toLowerCase().replace(/-/g, '') === clean.replace(/-/g, '') ||
           b.id.toLowerCase() === clean
    );

    if (found) {
      setLastScannedBook(found);
      setScanError(null);
      onBookScanned(found);
    } else {
      setScanError(`No book found in catalog with barcode/ISBN: "${code}".`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScannedCode(manualCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#082B4C] text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Camera className="w-5 h-5 text-[#F47700]" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Barcode & ISBN Scanner</h3>
              <p className="text-xs text-white/70">Scan physical book barcode or enter ISBN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Camera Viewport */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900 border-2 border-dashed border-gray-300 min-h-[200px] flex flex-col items-center justify-center text-center p-4">
            <div id={scannerContainerId} className="w-full max-w-[340px]" />

            {!isCameraActive && (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto bg-white/10 rounded-full flex items-center justify-center text-[#F47700]">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm text-gray-300">Use your device camera to scan book barcodes directly</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-[#F47700] hover:bg-[#D46600] text-white text-sm font-semibold rounded-xl shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Start Camera Scanner
                </button>
              </div>
            )}

            {isCameraActive && (
              <button
                type="button"
                onClick={stopCamera}
                className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* Scanned Confirmation */}
          {lastScannedBook && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-xs text-emerald-900">Scanned & Added to Cart:</div>
                  <div className="text-sm font-bold text-gray-900 line-clamp-1">{lastScannedBook.title}</div>
                  <div className="text-xs text-emerald-700 font-medium">Rs. {lastScannedBook.salePrice} | Avail Stock: {lastScannedBook.availableStock}</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {scanError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleManualSearch} className="space-y-2">
            <label className="block text-xs font-bold text-[#082B4C] uppercase tracking-wider">
              Or Enter Barcode / ISBN / ID Manually
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. 896400012011 or 978-969-456-121-1"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#082B4C] focus:bg-white transition-all outline-hidden font-mono"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#082B4C] hover:bg-[#051C33] text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
              >
                Scan / Add
              </button>
            </div>
          </form>

          {/* Quick Demo Barcodes for Fast Testing */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F47700]" />
              <span>Quick Test Barcodes (Click to test instant scan):</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {books.slice(0, 4).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleScannedCode(b.barcode)}
                  className="p-2 text-left bg-gray-50 hover:bg-[#F7EEE3] border border-gray-200 hover:border-[#F47700] rounded-lg transition-all text-xs group"
                >
                  <div className="font-semibold text-gray-800 line-clamp-1 group-hover:text-[#082B4C]">{b.title}</div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">Code: {b.barcode}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
