import React, { useState, useEffect, useCallback } from 'react';
import { ScanLine, CheckCircle2, AlertOctagon, Clock, RefreshCw, XCircle } from 'lucide-react';
import { verificationApi } from '../api/index.ts';
import { VerificationLog } from '../types/index.ts';

export const InstituteVerificationsPage: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultFilter, setResultFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await verificationApi.listLogs({
        result: resultFilter || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [resultFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-blue-400" />
            Verification Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cryptographically recorded authentication attempts across campus check-points
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Verification Results</option>
            <option value="VALID">VALID</option>
            <option value="REVOKED">REVOKED</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="INVALID">INVALID</option>
          </select>
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Card Number</th>
                <th className="px-4 py-3.5">Verification Result</th>
                <th className="px-4 py-3.5">Client IP / Platform</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Audit Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Querying verification records...
                  </td>
                </tr>
              ) : (logs || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    No verification log entries found matching criteria.
                  </td>
                </tr>
              ) : (
                (logs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      {log.student_name || 'Anonymous Verifier'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {log.card_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.verification_result === 'VALID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : log.verification_result === 'REVOKED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : log.verification_result === 'EXPIRED'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {log.verification_result === 'VALID' && <CheckCircle2 className="w-3 h-3" />}
                        {log.verification_result === 'REVOKED' && <AlertOctagon className="w-3 h-3" />}
                        {log.verification_result === 'EXPIRED' && <Clock className="w-3 h-3" />}
                        {log.verification_result === 'INVALID' && <XCircle className="w-3 h-3" />}
                        {log.verification_result}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {new Date(log.verified_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px] truncate max-w-xs">
                      {log.failure_reason || 'Cryptographic check passed.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
