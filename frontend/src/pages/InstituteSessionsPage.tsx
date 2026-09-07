import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { sessionApi } from '../api/index.ts';
import { AcademicSession } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteSessionsPage: React.FC = () => {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('2024-09-01');
  const [endDate, setEndDate] = useState('2028-06-30');
  const [isCurrent, setIsCurrent] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await sessionApi.list();
      if (res.success && res.data) {
        setSessions(Array.isArray(res.data.sessions) ? res.data.sessions : []);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch sessions', 'error');
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sessionApi.create({
        name,
        start_date: startDate,
        end_date: endDate,
        is_current: isCurrent,
      });
      showToast('Academic session created', 'success');
      setIsModalOpen(false);
      setName('');
      fetchSessions();
    } catch (err: any) {
      showToast(err.message || 'Failed to create session', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionApi.delete(id);
      showToast('Session removed', 'success');
      fetchSessions();
    } catch (e: any) {
      showToast(e.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            Academic Sessions
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure academic batches and graduation calendars</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(sessions || []).map((ses) => (
          <div
            key={ses.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-white">{ses.name}</span>
                {ses.is_current && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Current Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Timeline: <span className="text-slate-200">{ses.start_date}</span> to{' '}
                <span className="text-slate-200">{ses.end_date}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => handleDelete(ses.id)}
                className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Academic Session</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2024-2028 Batch"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isCurrent" className="text-xs text-slate-300">
                  Mark as currently active enrollment cohort
                </label>
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
