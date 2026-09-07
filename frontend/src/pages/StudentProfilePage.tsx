import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building2, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { idCardApi } from '../api/index.ts';
import { StudentIdCard } from '../types/index.ts';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [card, setCard] = useState<StudentIdCard | null>(null);

  useEffect(() => {
    idCardApi
      .getMyCard()
      .then((res) => {
        if (res.success && res.data) setCard(res.data.card);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-blue-400" />
          Student Academic Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Personal identification record and enrolled institutional credentials
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-800">
          <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800 flex-shrink-0 shadow-lg">
            <img
              src={
                card?.photo_url ||
                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`
              }
              alt={user?.full_name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">{user?.full_name}</h2>
            <div className="text-xs font-mono font-bold text-blue-400">
              Student ID: {card?.student_id_number || 'STU-APEX-2024'}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {card?.department_name || 'Department of Computer Science'}
            </div>
            <div className="text-xs text-slate-400">
              {card?.institute_name || 'Apex Institute of Technology'} • Semester {card?.current_semester || '4th'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" /> Institutional Email
            </span>
            <div className="text-sm font-semibold text-white">{user?.email}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" /> Blood Group
            </span>
            <div className="text-sm font-semibold text-rose-400">{card?.blood_group || 'O+'}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Academic Session
            </span>
            <div className="text-sm font-semibold text-white">{card?.session_name || '2024-2028'}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Digital Card Status
            </span>
            <div className="text-sm font-semibold text-emerald-400">
              {card ? `ACTIVE (Card #${card.card_number} v${card.version})` : 'Pending Application'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
