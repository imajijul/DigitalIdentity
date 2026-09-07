import React, { useState, useEffect } from 'react';
import { Building2, Users, CreditCard, ScanLine, ShieldCheck, Plus, ExternalLink } from 'lucide-react';
import { instituteApi, statsApi } from '../api/index.ts';
import { Institute } from '../types/index.ts';
import { Link } from 'react-router-dom';

export const SuperAdminDashboard: React.FC = () => {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instituteApi
      .list()
      .then((res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : ((res.data as any).institutes || []);
          setInstitutes(list);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-900 border border-purple-800/40 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Platform Super Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Multi-Tenant Educational Cloud
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Global governance of institutions, security isolation domains, and system verification registries
          </p>
        </div>

        <Link
          to="/admin/institutes"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Manage Institutes
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Enrolled Institutions</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{institutes.length}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">100% Isolated Tenants</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Security Isolation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">Active</div>
          <div className="text-[11px] text-slate-400 font-mono">Row-Level SQL Enforced</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Audit Trail</span>
            <ScanLine className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">Cryptographic</div>
          <div className="text-[11px] text-blue-400 font-semibold">Immutable Append-Only</div>
        </div>
      </div>

      {/* Institutes Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Connected Educational Institutions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Institution Name</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Contact Email</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(institutes || []).map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    {inst.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-purple-300">{inst.code}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{inst.domain || 'apex.edu'}</td>
                  <td className="px-4 py-3 text-slate-400">{inst.email || 'admin@' + inst.domain}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {inst.is_active ? 'ACTIVE' : 'SUSPENDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
