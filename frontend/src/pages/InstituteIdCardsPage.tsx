import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  RefreshCw,
  RotateCw,
  AlertOctagon,
  Eye,
  CheckCircle2,
  Clock,
  Layers,
  X,
  ShieldAlert,
} from 'lucide-react';
import { idCardApi, studentApi } from '../api/index.ts';
import { StudentIdCard, Student } from '../types/index.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

export const InstituteIdCardsPage: React.FC = () => {
  const { showToast } = useToast();
  const [cards, setCards] = useState<StudentIdCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [previewCard, setPreviewCard] = useState<StudentIdCard | null>(null);
  const [replaceCardTarget, setReplaceCardTarget] = useState<StudentIdCard | null>(null);
  const [replaceReason, setReplaceReason] = useState('Lost physical badge / updated student semester info');
  const [revokeCardTarget, setRevokeCardTarget] = useState<StudentIdCard | null>(null);
  const [revokeReason, setRevokeReason] = useState('Administrative disciplinary suspension');
  const [isProcessing, setIsProcessing] = useState(false);

  // New Card Issuance Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('navy');

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await idCardApi.list({
        search,
        status: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setCards(Array.isArray(res.data.cards) ? res.data.cards : []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load ID cards', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleOpenGenerate = async () => {
    try {
      const res = await studentApi.list({ limit: 100 });
      if (res.success && res.data) {
        const stuList = Array.isArray(res.data.students) ? res.data.students : [];
        setAllStudents(stuList);
        if (stuList.length > 0) {
          setSelectedStudentId(stuList[0].id);
        }
      }
      setIsGenerateModalOpen(true);
    } catch (err: any) {
      showToast('Could not fetch student list', 'error');
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setIsProcessing(true);
    try {
      const res = await idCardApi.create({
        student_id: selectedStudentId,
        theme: selectedTheme,
      });
      if (res.success) {
        showToast('Digital ID card generated successfully.', 'success');
        setIsGenerateModalOpen(false);
        fetchCards();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to generate card', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Section 19: Versioning replacement
  const handleConfirmReplace = async () => {
    if (!replaceCardTarget) return;
    setIsProcessing(true);
    try {
      const res = await idCardApi.replace(replaceCardTarget.id, { reason: replaceReason });
      if (res.success) {
        showToast(
          `Card replaced! Old card revoked, new card created at Version ${res.data?.card.version}.`,
          'success'
        );
        setReplaceCardTarget(null);
        fetchCards();
      }
    } catch (err: any) {
      showToast(err.message || 'Card replacement failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeCardTarget) return;
    setIsProcessing(true);
    try {
      const res = await idCardApi.revoke(revokeCardTarget.id, { reason: revokeReason });
      if (res.success) {
        showToast(`ID card ${revokeCardTarget.card_number} has been revoked.`, 'success');
        setRevokeCardTarget(null);
        fetchCards();
      }
    } catch (err: any) {
      showToast(err.message || 'Card revocation failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-400" />
            Digital ID Cards Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Issuance, cryptographic token generation, versioning lifecycle, and revocation
          </p>
        </div>

        <button
          onClick={handleOpenGenerate}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Issue New ID Card
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by card number, student name, or ID number..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="REVOKED">REVOKED</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          <button
            onClick={fetchCards}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Card Number</th>
                <th className="px-4 py-3.5">Version</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5">Expiry Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Querying ID card credentials...
                  </td>
                </tr>
              ) : (cards || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No student ID cards found matching your query.
                  </td>
                </tr>
              ) : (
                (cards || []).map((card) => (
                  <tr key={card.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-8 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                        <img
                          src={
                            card.photo_url ||
                            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80`
                          }
                          alt={card.student_name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{card.student_name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{card.student_id_number}</div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                      {card.card_number}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <Layers className="w-3 h-3" /> v{card.version}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">{card.issue_date}</td>
                    <td className="px-4 py-3.5 text-slate-400">{card.expiry_date}</td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          card.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : card.status === 'REVOKED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {card.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {card.status === 'REVOKED' && <AlertOctagon className="w-3 h-3" />}
                        {card.status === 'EXPIRED' && <Clock className="w-3 h-3" />}
                        {card.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewCard(card)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Preview 3D Card"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>

                        {card.status === 'ACTIVE' && (
                          <>
                            <button
                              onClick={() => setReplaceCardTarget(card)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-blue-400 border border-slate-700 hover:border-blue-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              title="Reissue / Increment Version"
                            >
                              <RotateCw className="w-3 h-3" />
                              Replace (v{card.version + 1})
                            </button>

                            <button
                              onClick={() => setRevokeCardTarget(card)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 transition-colors"
                              title="Revoke Card"
                            >
                              <AlertOctagon className="w-4 h-4 text-rose-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D Preview Modal */}
      {previewCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setPreviewCard(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-base font-bold text-white">Student Digital Identity Card</h3>
              <p className="text-xs text-slate-400">Card No: {previewCard.card_number} (Version {previewCard.version})</p>
            </div>
            <DigitalIdCard card={previewCard} showControls={true} />
          </div>
        </div>
      )}

      {/* Versioning Replace Modal */}
      {replaceCardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-blue-400">
              <RotateCw className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Replace ID Card (Versioning)</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Replacing will mark card <span className="font-mono font-bold text-white">{replaceCardTarget.card_number}</span> as <span className="text-rose-400 font-bold">REVOKED</span> and automatically generate a new active card at <span className="text-emerald-400 font-bold">Version {replaceCardTarget.version + 1}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Replacement *
              </label>
              <textarea
                rows={2}
                required
                value={replaceReason}
                onChange={(e) => setReplaceReason(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for replacing card..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplaceCardTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmReplace}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                {isProcessing ? 'Processing Reissue...' : `Reissue at v${replaceCardTarget.version + 1}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revocation Modal */}
      {revokeCardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Revoke ID Card</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to revoke card <span className="font-mono font-bold text-white">{revokeCardTarget.card_number}</span>? Public QR verification will immediately return <span className="text-rose-400 font-bold">REVOKED</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Revocation Reason *
              </label>
              <input
                type="text"
                required
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokeCardTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmRevoke}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30 disabled:opacity-50"
              >
                {isProcessing ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate ID Card Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Issue Student Digital ID Card
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Enrolled Student *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(allStudents || []).map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.first_name} {stu.last_name} ({stu.student_id_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Card Theme Palette
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="navy">Navy Gold (University Classic)</option>
                  <option value="emerald">Emerald Modern (STEM / Tech)</option>
                  <option value="crimson">Crimson Classic (Heritage)</option>
                  <option value="slate">Deep Slate (Minimalist Cyber)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 disabled:opacity-50"
                >
                  {isProcessing ? 'Generating QR & Token...' : 'Generate & Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
