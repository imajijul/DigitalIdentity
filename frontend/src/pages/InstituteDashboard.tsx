import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CreditCard,
  FileCheck2,
  ScanLine,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { statsApi, verificationApi } from '../api/index.ts';
import { VerificationLog } from '../types/index.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

export const InstituteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalDepartments: 0,
    activeIdCards: 0,
    expiredIdCards: 0,
    pendingApplications: 0,
    totalVerifications: 0,
  });
  const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statsApi.getDashboardStats(),
      verificationApi.listLogs({ limit: 6 }),
    ])
      .then(([statsRes, logsRes]) => {
        if (statsRes.success && statsRes.data) setStats(statsRes.data);
        if (logsRes.success && logsRes.data) {
          setRecentLogs(Array.isArray(logsRes.data.logs) ? logsRes.data.logs : []);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-800/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Multi-Tenant Institutional Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Institutional Administration Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your academic credentials, monitor live QR verifications, and supervise digital identity lifecycles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/portal/students"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Manage Students
          </Link>
          <Link
            to="/portal/id-cards"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <CreditCard className="w-4 h-4 text-blue-400" />
            ID Cards Registry
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Enrolled Students</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">{stats.activeStudents} Active</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Digital ID Cards</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{stats.activeIdCards}</div>
            <div className="text-[11px] text-slate-400 font-mono">Issued & Valid</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Card Requests</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{stats.pendingApplications}</div>
            <Link
              to="/portal/applications"
              className="text-[11px] text-amber-400 hover:underline font-semibold"
            >
              Review queue →
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total QR Verifications</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-white">{stats.totalVerifications}</div>
            <div className="text-[11px] text-blue-400 font-semibold">Live Audit Trail</div>
          </div>
        </div>
      </div>

      {/* Split Section: Recent QR Verifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Verifications Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-blue-400" />
                Live Verification Log Stream
              </h3>
              <p className="text-xs text-slate-400">Real-time scans of institutional student credentials</p>
            </div>
            <Link
              to="/portal/verifications"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Card / Identifier</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {(recentLogs || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500">
                      No recent verification scans recorded yet.
                    </td>
                  </tr>
                ) : (
                  (recentLogs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {log.student_name || 'Anonymous Scan'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {log.card_number || log.token_identifier?.substring(0, 12) + '...'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(log.verified_at).toLocaleTimeString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.verification_result === 'VALID'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : log.verification_result === 'REVOKED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {log.verification_result}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & System Readiness Status */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Identity Health
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300">Multi-Tenancy Isolation</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300">Database Engine</span>
                <span className="text-blue-400 font-mono font-semibold">
                  PostgreSQL Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300">QR Cryptographic Token</span>
                <span className="text-purple-400 font-mono font-semibold">
                  SHA-256 Digest
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <span className="text-slate-300">Audit Logging</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Immutable
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50 text-xs text-blue-200 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Institutional Best Practice
            </div>
            <p className="text-[11px] leading-relaxed text-blue-300">
              When updating student semester information, re-issuing digital ID cards will automatically preserve prior versions while incrementing credential revisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
