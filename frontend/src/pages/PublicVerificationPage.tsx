import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Building2,
  QrCode,
  Calendar,
  Layers,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { verificationApi } from '../api/index.ts';
import { QrScannerModal } from '../components/QrScannerModal.tsx';

export const PublicVerificationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (token) {
      setLoading(true);
      verificationApi
        .verifyPublic(token)
        .then((res) => {
          if (res.success) {
            setData(res.data);
          }
        })
        .catch((err) => {
          setData({
            isValid: false,
            verificationResult: 'INVALID',
            verificationMessage: err.message || 'Unable to complete verification check.',
            verifiedAt: new Date().toISOString(),
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [token]);

  const getResultHeader = (result?: string) => {
    switch (result) {
      case 'VALID':
        return {
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          cardBorder: 'border-emerald-500/40',
          glow: 'from-emerald-500/20 to-teal-500/5',
          Icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          title: 'Official ID Verified & Active',
        };
      case 'REVOKED':
        return {
          badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          cardBorder: 'border-rose-500/40',
          glow: 'from-rose-500/20 to-red-500/5',
          Icon: AlertOctagon,
          iconColor: 'text-rose-400',
          title: 'ID Card Has Been Revoked',
        };
      case 'EXPIRED':
        return {
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          cardBorder: 'border-amber-500/40',
          glow: 'from-amber-500/20 to-orange-500/5',
          Icon: Clock,
          iconColor: 'text-amber-400',
          title: 'ID Card Validity Expired',
        };
      default:
        return {
          badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          cardBorder: 'border-rose-500/40',
          glow: 'from-rose-500/20 to-red-500/5',
          Icon: XCircle,
          iconColor: 'text-rose-400',
          title: 'Invalid Verification Token',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">
          Querying Institutional Cryptographic Registry...
        </p>
      </div>
    );
  }

  const resultMeta = getResultHeader(data?.verificationResult);
  const StatusIcon = resultMeta.Icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-sm hover:opacity-90">
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Public Verification Service</span>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-blue-400" />
          <span>Scan Another</span>
        </button>
      </header>

      {/* Main Verification Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div
          className={`w-full max-w-xl bg-slate-900/90 rounded-2xl border ${resultMeta.cardBorder} shadow-2xl overflow-hidden backdrop-blur-md bg-gradient-to-b ${resultMeta.glow}`}
        >
          {/* Status Header */}
          <div className="p-6 border-b border-slate-800 text-center space-y-3">
            <div
              className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border shadow-lg ${resultMeta.badgeBg}`}
            >
              <StatusIcon className={`w-9 h-9 ${resultMeta.iconColor}`} />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {resultMeta.title}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {data?.verificationMessage}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
              <span>Timestamp:</span>
              <span>{data?.verifiedAt ? new Date(data.verifiedAt).toLocaleString() : 'Now'}</span>
            </div>
          </div>

          {/* Student Profile & Details (Strictly sanitized public information) */}
          {data?.studentName && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-20 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0 shadow">
                  <img
                    src={
                      data.photoUrl ||
                      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`
                    }
                    alt={data.studentName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {data.studentName}
                  </h2>
                  <div className="text-sm font-mono font-bold text-blue-400">
                    ID: {data.studentIdNumber}
                  </div>
                  <div className="text-xs text-slate-300 font-medium">
                    {data.departmentName}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                    <span>{data.instituteName}</span>
                    <span>•</span>
                    <span>{data.sessionName}</span>
                  </div>
                </div>
              </div>

              {/* Grid of Verified Institutional Attributes */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Current Semester</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{data.currentSemester || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Card Number</div>
                  <div className="text-xs font-mono font-semibold text-white mt-0.5">{data.cardNumber || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Version</div>
                  <div className="text-xs font-semibold text-white mt-0.5">v{data.cardVersion || 1}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Blood Group</div>
                  <div className="text-xs font-semibold text-rose-400 mt-0.5">{data.bloodGroup || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Issue Date</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{data.issueDate || 'N/A'}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Expiration</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{data.expiryDate || 'N/A'}</div>
                </div>
              </div>

              {/* Security Audit Badge */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-200">Public Privacy Enforced:</span> This verification response provides cryptographic authenticity of enrollment without exposing private phone numbers, home addresses, or credentials.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 p-4 text-center text-xs text-slate-500">
        Student Digital ID Card System • Official Institutional Verification Gateway
      </footer>

      <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
};
