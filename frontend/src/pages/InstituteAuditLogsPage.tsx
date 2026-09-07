import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw } from 'lucide-react';
import { auditApi } from '../api/index.ts';
import { AuditLog } from '../types/index.ts';

export const InstituteAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ limit: 50 });
      if (res.success && res.data) {
        setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" />
            Security Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable administrative event logging for all database modifications and card actions
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-4 py-3.5">Entity</th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Details</th>
                <th className="px-5 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Fetching immutable audit entries...
                  </td>
                </tr>
              ) : (logs || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                (logs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${
                          log.action.includes('REVOKE') || log.action.includes('DELETE')
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : log.action.includes('CREATE') || log.action.includes('REPLACE')
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      {log.entity_name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {log.user_email || 'System Daemon'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 max-w-sm truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
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
