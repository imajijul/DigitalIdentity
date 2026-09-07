import React, { useState, useEffect } from 'react';
import { FileCheck2, Plus, Clock, CheckCircle2, XCircle, X } from 'lucide-react';
import { applicationApi } from '../api/index.ts';
import { IdCardApplication } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const StudentApplicationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<IdCardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [appType, setAppType] = useState('REPLACEMENT');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.listMy();
      if (res.success && res.data) {
        const appList = Array.isArray(res.data.applications)
          ? res.data.applications
          : Array.isArray(res.data)
          ? res.data
          : [];
        setApplications(appList);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await applicationApi.create({
        application_type: appType,
        reason,
      });
      showToast('Application submitted successfully!', 'success');
      setIsModalOpen(false);
      setReason('');
      fetchApps();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-blue-400" />
            ID Card Applications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit card requests for lost badges, replacement renewals, or initial credentials
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Application
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Request Type</th>
                <th className="px-4 py-3.5">Reason / Notes</th>
                <th className="px-4 py-3.5">Submission Date</th>
                <th className="px-4 py-3.5">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    Loading your applications...
                  </td>
                </tr>
              ) : (applications || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    No card applications submitted yet.
                  </td>
                </tr>
              ) : (
                (applications || []).map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-white">
                      {app.application_type}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{app.reason}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Submit Card Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Application Type *
                </label>
                <select
                  value={appType}
                  onChange={(e) => setAppType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="REPLACEMENT">Card Replacement (Lost / Damaged / Version Update)</option>
                  <option value="NEW">New Student ID Card</option>
                  <option value="RENEWAL">Semester Expiry Renewal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason / Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Lost physical ID card badge during campus transit, need a re-issued credential..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
