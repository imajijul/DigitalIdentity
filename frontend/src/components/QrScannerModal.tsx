import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, QrCode, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');

  // Start camera when modal opens
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      const startCamera = async () => {
        try {
          setCameraError(null);
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
          }
        } catch (err: any) {
          console.warn('Camera access could not be acquired:', err);
          setCameraError('Camera access not available in current window. You can enter or paste a verification token below.');
          setCameraActive(false);
        }
      };

      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    let token = manualToken.trim();
    // Handle full verification URLs pasted by user
    if (token.includes('/verify/')) {
      token = token.split('/verify/')[1]?.split('?')[0] || token;
    }

    onClose();
    navigate(`/verify/${token}`);
  };

  const handleDemoVerify = (token: string) => {
    onClose();
    navigate(`/verify/${token}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <Camera className="w-5 h-5 text-blue-400" />
            <h3>QR Code ID Card Verifier</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Camera View Area */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Scanner Target Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-emerald-400/80 rounded-2xl animate-pulse relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <QrCode className="w-12 h-12 mx-auto text-slate-600 animate-bounce" />
                <p className="text-xs max-w-xs mx-auto text-slate-400">
                  {cameraError || 'Initializing camera video feed...'}
                </p>
              </div>
            )}
          </div>

          {/* Manual Token Verification Form */}
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Or Enter Verification Token / URL Manually
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. vt_apex_a1b2c3d4e5f6..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                Verify
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Preset Demo Tokens for Instant Verification */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Test Verification Records
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoVerify('vt_apex_a1b2c3d4e5f67890123456789abcdef0')}
                className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <div className="text-xs font-bold text-white">Alex Johnson (Active)</div>
                <div className="text-[10px] text-emerald-400 font-mono">Status: ACTIVE • CS Dept</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoVerify('vt_apex_b2c3d4e5f6a17890123456789abcdef1')}
                className="text-left p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <div className="text-xs font-bold text-white">Sarah Williams (Active)</div>
                <div className="text-[10px] text-emerald-400 font-mono">Status: ACTIVE • EE Dept</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
