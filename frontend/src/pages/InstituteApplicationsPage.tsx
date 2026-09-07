import React, { useState, useEffect, useCallback } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  User,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { applicationApi } from '../api/index.ts';
import { IdCardApplication } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteApplicationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<IdCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationApi.list({
        status: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setApplications(Array.isArray(res.data.applications) ? res.data.applications : []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (appId: string) => {
    setIsProcessing(appId);
    try {
      const res = await applicationApi.approve(appId);
      if (res.success) {
        showToast('Application approved! Digital ID card has been issued to student.', 'success');
        fetchApplications();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to approve application', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (appId: string) => {
    setIsProcessing(appId);
    try {
      const res = await applicationApi.reject(appId);
      if (res.success) {
        showToast('Application has been rejected.', 'info');
        fetchApplications();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reject application', 'error');
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-400" />
            ID Card Applications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review and approve student requests for initial issuance, reissues, or replacement badges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>

          <button
            onClick={fetchApplications}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Request Type</th>
                <th className="px-4 py-3.5">Reason / Justification</th>
                <th className="px-4 py-3.5">Submitted</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Fetching applications...
                  </td>
                </tr>
              ) : (applications || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No student applications found.
                  </td>
                </tr>
              ) : (
                (applications || []).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{app.student_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{app.student_id_number}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">{app.department_name || 'N/A'}</td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {app.application_type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate">
                      {app.reason || 'General student ID card request'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                        {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {app.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {app.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isProcessing === app.id}
                            onClick={() => handleApprove(app.id)}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve & Issue
                          </button>
                          <button
                            disabled={isProcessing === app.id}
                            onClick={() => handleReject(app.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 text-[11px] font-medium transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processed</span>
                      )}
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
