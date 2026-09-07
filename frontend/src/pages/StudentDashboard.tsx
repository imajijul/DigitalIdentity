import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CreditCard,
  FileCheck2,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCw,
  QrCode,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { idCardApi, applicationApi } from '../api/index.ts';
import { StudentIdCard, IdCardApplication } from '../types/index.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState<StudentIdCard | null>(null);
  const [applications, setApplications] = useState<IdCardApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      idCardApi.getMyCard().catch(() => ({ success: true, data: { card: null } })),
      applicationApi.listMy().catch(() => ({ success: true, data: { applications: [], total: 0 } }))
    ])
      .then(([cardRes, appRes]) => {
        if (cardRes?.success && cardRes.data) setActiveCard(cardRes.data.card || null);
        if (appRes?.success && appRes.data) {
          const appList = Array.isArray(appRes.data.applications)
            ? appRes.data.applications
            : Array.isArray(appRes.data)
            ? appRes.data
            : [];
          setApplications(appList);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Enrolled Student Credential
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Your tamper-evident institutional digital ID card is active and cryptographically verifiable anywhere on or off campus.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/student/card"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            View Full Digital Card
          </Link>
          <Link
            to="/student/applications"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <FileCheck2 className="w-4 h-4 text-amber-400" />
            Request Replacement
          </Link>
        </div>
      </div>

      {/* Main Student Hub Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Active Card Viewer Widget */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                Live Digital ID Card
              </h2>
              <p className="text-xs text-slate-400">Tap card to flip front/back</p>
            </div>

            {activeCard && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${
                  activeCard.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {activeCard.status === 'ACTIVE' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {activeCard.status} (v{activeCard.version})
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-xs">
              Loading your student ID credentials...
            </div>
          ) : activeCard ? (
            <div className="flex justify-center py-2">
              <DigitalIdCard card={activeCard} showControls={true} />
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <CreditCard className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm font-semibold text-white">No Digital ID Card Issued Yet</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit an application to request your official student digital ID card credentials.
              </p>
              <Link
                to="/student/applications"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Submit Application Now →
              </Link>
            </div>
          )}
        </div>

        {/* Side Panel: Applications & Security Advice */}
        <div className="space-y-4">
          {/* Card Details Quick Specs */}
          {activeCard && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Credential Verification Info
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Card Number</span>
                  <span className="font-mono font-bold text-white">{activeCard.card_number}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Issue Date</span>
                  <span className="text-slate-200">{activeCard.issue_date}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Valid Through</span>
                  <span className="text-slate-200">{activeCard.expiry_date}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Verification Scheme</span>
                  <span className="text-blue-400 font-mono text-[11px]">SHA-256 Token</span>
                </div>
              </div>
            </div>
          )}

          {/* Recent Applications Tracker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                My Card Requests
              </h3>
              <Link to="/student/applications" className="text-[11px] text-blue-400 hover:underline">
                View all
              </Link>
            </div>

            {(applications || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No active card replacement requests.</p>
            ) : (
              <div className="space-y-2">
                {(applications || []).slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{app.application_type}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
