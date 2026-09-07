import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  Users,
  CheckCircle2,
  Layers,
  History,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { QrScannerModal } from '../components/QrScannerModal.tsx';

export const HomePage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/portal/dashboard');
    }
  }, [user, navigate]);

  const demoCardSample = {
    id: 'demo-card-1',
    card_number: 'APEX-2024-0001',
    student_id: 'demo-stu-1',
    student_name: 'Alex Johnson',
    student_id_number: 'STU-APEX-001',
    department_name: 'Department of Computer Science',
    current_semester: '4th',
    blood_group: 'O+',
    institute_name: 'Apex Institute of Technology',
    institute_code: 'APEX',
    session_name: '2024-2028',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    issue_date: '2024-09-01',
    expiry_date: '2028-06-30',
    status: 'ACTIVE' as const,
    version: 1,
    verification_token: 'vt_apex_a1b2c3d4e5f67890123456789abcdef0',
    qr_url: '/verify/vt_apex_a1b2c3d4e5f67890123456789abcdef0',
    card_theme: 'navy',
  };

  const handleFastLogin = async (email: string, pass: string) => {
    setIsLoggingIn(true);
    try {
      await login({ email, password: pass });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-4 h-4" /> Multi-Tenant Institutional Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Student Digital ID Card Management & QR Verification
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            A production-ready digital identity ecosystem featuring multi-tenant PostgreSQL isolation, cryptographic QR codes, replacement versioning with full history preservation, and immutable audit logs.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => handleFastLogin('admin@apex.edu', 'admin123')}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              <Building2 className="w-4 h-4" />
              {isLoggingIn ? 'Entering...' : 'Enter as Institute Admin'}
            </button>

            <button
              onClick={() => handleFastLogin('alex@apex.edu', 'student123')}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
            >
              <Users className="w-4 h-4" />
              Enter as Student
            </button>

            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              Scan / Test QR
            </button>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
              <div className="text-[11px] text-slate-400 font-medium">Tenant Isolated</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">SHA-256</div>
              <div className="text-[11px] text-slate-400 font-medium">Token Verification</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">Versioning</div>
              <div className="text-[11px] text-slate-400 font-medium">Replacement Audit</div>
            </div>
          </div>
        </div>

        {/* Hero Interactive Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Interactive 3D Card Preview
            </span>
            <p className="text-[11px] text-slate-400">Tap the card or switch theme below</p>
          </div>
          <DigitalIdCard card={demoCardSample} showControls={true} />
        </div>
      </div>

      {/* Architectural Pillars Section */}
      <div className="pt-10 border-t border-slate-800/80 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Institutional Security & Verification Architecture
          </h2>
          <p className="text-xs text-slate-400">
            Built to prevent forged student badges, protect private data during public scans, and preserve complete credential lifecycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every database query and API operation strictly enforces institutional boundaries through <code className="text-blue-400 font-mono">institute_id</code> scoping, keeping university records fully isolated.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Sanitized Public Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scanning the card QR code hits <code className="text-emerald-400 font-mono">/verify/:token</code>, returning cryptographically authenticated enrollment info without exposing phone numbers, addresses, or private credentials.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-white">Historical Versioning (v1, v2...)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When an ID card is reissued or replaced, the prior card is set to <span className="text-rose-400 font-bold">REVOKED</span> while a new card increments to <span className="text-emerald-400 font-bold">Version + 1</span>, preserving complete audit trails.
            </p>
          </div>
        </div>
      </div>

      <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
};
