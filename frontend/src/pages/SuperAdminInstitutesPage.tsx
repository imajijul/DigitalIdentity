import React, { useState, useEffect } from 'react';
import { Building2, Plus, CheckCircle, X, Shield, RefreshCw } from 'lucide-react';
import { instituteApi } from '../api/index.ts';
import { Institute } from '../types/index.ts';
import { useToast } from '../contexts/ToastContext.tsx';

export const SuperAdminInstitutesPage: React.FC = () => {
  const { showToast } = useToast();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const fetchInstitutes = async () => {
    try {
      const res = await instituteApi.list();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : ((res.data as any).institutes || []);
        setInstitutes(list);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch institutes', 'error');
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await instituteApi.create({
        name,
        code,
        domain,
        email,
        phone,
        address,
      });
      showToast('Institution registered in cloud registry', 'success');
      setIsModalOpen(false);
      setName('');
      setCode('');
      setDomain('');
      setEmail('');
      fetchInstitutes();
    } catch (err: any) {
      showToast(err.message || 'Failed to create institute', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-purple-400" />
            Educational Institutes Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision and configure multi-tenant institutional tenants
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Institution
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(institutes || []).map((inst) => (
          <div
            key={inst.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/60">
                {inst.code}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> ACTIVE TENANT
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-2">{inst.name}</h3>
            <p className="text-xs text-slate-400">{inst.address || 'Campus headquarters'}</p>

            <div className="pt-3 border-t border-slate-800 space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">Domain:</span>
                <span className="font-mono text-slate-300">{inst.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin Email:</span>
                <span className="text-slate-300">{inst.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Provision Institution</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Stanford University of Science"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. STAN"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain *</label>
                  <input
                    type="text"
                    required
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. stanford.edu"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@stanford.edu"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30"
                >
                  Provision Institute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
