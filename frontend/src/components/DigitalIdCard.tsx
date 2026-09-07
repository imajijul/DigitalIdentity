import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RotateCw, ShieldCheck, AlertOctagon, Clock, Download, CheckCircle2 } from 'lucide-react';
import { StudentIdCard } from '../types/index.ts';

interface DigitalIdCardProps {
  card: StudentIdCard;
  showControls?: boolean;
}

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ card, showControls = true }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(card.theme || 'navy');

  const verifyUrl = `${window.location.origin}/verify/${card.verification_token}`;

  // Theme palettes
  const themes: Record<string, { bg: string; text: string; accent: string; border: string; banner: string }> = {
    navy: {
      bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950',
      text: 'text-white',
      accent: 'text-amber-400',
      border: 'border-blue-700/50',
      banner: 'bg-blue-900/60 border-b border-blue-700/40',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950',
      text: 'text-white',
      accent: 'text-emerald-400',
      border: 'border-emerald-700/50',
      banner: 'bg-emerald-900/60 border-b border-emerald-700/40',
    },
    crimson: {
      bg: 'bg-gradient-to-br from-slate-900 via-rose-950 to-red-950',
      text: 'text-white',
      accent: 'text-rose-400',
      border: 'border-rose-700/50',
      banner: 'bg-rose-900/60 border-b border-rose-700/40',
    },
    slate: {
      bg: 'bg-gradient-to-br from-gray-900 via-slate-800 to-zinc-900',
      text: 'text-white',
      accent: 'text-cyan-400',
      border: 'border-slate-700/60',
      banner: 'bg-slate-800/80 border-b border-slate-700/50',
    },
  };

  const currentTheme = themes[selectedTheme] || themes.navy;

  const getStatusBadge = () => {
    switch (card.status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active Verified
          </span>
        );
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertOctagon className="w-3.5 h-3.5" /> Revoked
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Clock className="w-3.5 h-3.5" /> Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/40">
            {card.status}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Card Container */}
      <div
        id="digital-id-card"
        className="w-full max-w-[420px] aspect-[1/1.55] relative perspective-1000 select-none cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`w-full h-full relative transition-transform duration-700 preserve-3d rounded-2xl shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT SIDE */}
          <div
            className={`absolute inset-0 backface-hidden rounded-2xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text} flex flex-col justify-between overflow-hidden shadow-2xl p-5`}
          >
            {/* Top Header Banner */}
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center backdrop-blur-sm border border-white/15">
                    {card.institute_logo_url ? (
                      <img
                        src={card.institute_logo_url}
                        alt="Logo"
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ShieldCheck className={`w-7 h-7 ${currentTheme.accent}`} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight line-clamp-1">
                      {card.institute_name || 'Apex State University'}
                    </h3>
                    <p className="text-[10px] text-white/60 uppercase tracking-widest font-semibold">
                      Official Student Identity Card
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {getStatusBadge()}
                  <span className="text-[10px] text-white/50 mt-1 font-mono">v{card.version}</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Photo & Basic Details */}
            <div className="flex gap-4 items-center my-auto py-2">
              <div className="relative">
                <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-white/30 shadow-md bg-slate-800 flex-shrink-0">
                  <img
                    src={
                      card.photo_url ||
                      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80`
                    }
                    alt={card.student_name || 'Student'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {card.blood_group && (
                  <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-md shadow border border-rose-400">
                    {card.blood_group}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-bold leading-snug tracking-tight">
                  {card.student_name || 'Student Name'}
                </h2>

                <div className="text-xs font-mono font-bold text-amber-400">
                  {card.student_id_number || 'STU-2026-0000'}
                </div>

                <div className="text-xs text-white/80 line-clamp-1 font-medium">
                  {card.department_name || 'Department of Computer Science'}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-white/60">
                  <span>{card.session_name || '2024-2028'}</span>
                  <span>•</span>
                  <span>{card.current_semester || '4th Semester'}</span>
                </div>

                <div className="text-[10px] text-white/50 font-mono pt-1">
                  Card No: {card.card_number}
                </div>
              </div>
            </div>

            {/* Bottom Section: QR & Verification Badge */}
            <div className="border-t border-white/10 pt-3 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Validity Period</div>
                <div className="text-xs font-semibold text-white/90">
                  {card.issue_date} <span className="text-white/40">to</span> {card.expiry_date}
                </div>
                <div className="text-[10px] text-white/40 italic flex items-center gap-1">
                  <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '8s' }} />
                  Tap card to view reverse
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col items-center">
                <QRCodeSVG
                  value={verifyUrl}
                  size={68}
                  level="M"
                  includeMargin={false}
                />
                <span className="text-[8px] font-bold text-slate-800 mt-1 uppercase tracking-tighter">
                  Scan to Verify
                </span>
              </div>
            </div>
          </div>

          {/* BACK SIDE */}
          <div
            className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text} flex flex-col justify-between overflow-hidden shadow-2xl p-6`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="font-bold text-sm tracking-wide uppercase">Institutional Terms & Contacts</h4>
                <span className="text-[10px] font-mono text-white/50">SEC-ID: {card.verification_token.substring(0, 8)}</span>
              </div>

              <div className="space-y-3 mt-4 text-xs text-white/80 leading-relaxed">
                <div>
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-white/50">
                    Institutional Property
                  </span>
                  This digital credential is the official property of {card.institute_name || 'the institution'}. Unauthorized duplication, tampering, or loaning is strictly prohibited.
                </div>

                <div>
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-white/50">
                    Emergency Hotline & Support
                  </span>
                  Campus Security: +1 (555) 019-2831 • Registrar Office: registrar@{card.institute_name?.toLowerCase().replace(/\s+/g, '') || 'apex'}.edu
                </div>

                <div>
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wider text-white/50">
                    Lost or Damaged Card
                  </span>
                  If found, please return to any campus administrative desk or mail to the institution registry office.
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="text-[10px] text-white/40">
                Authorized Signature
                <div className="font-serif italic text-sm text-white/70 mt-1">Registrar General</div>
              </div>

              <div className="text-right text-[10px] text-white/40">
                Tamper-Resistant Digital ID
                <div className="text-[9px] font-mono text-white/30 mt-0.5">HASH-PROTECTED</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {isFlipped ? 'Show Front' : 'Flip to Back'}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {(['navy', 'emerald', 'crimson', 'slate'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTheme(t)}
                className={`w-5 h-5 rounded-md transition-all ${
                  t === 'navy'
                    ? 'bg-blue-700'
                    : t === 'emerald'
                    ? 'bg-emerald-600'
                    : t === 'crimson'
                    ? 'bg-rose-600'
                    : 'bg-slate-600'
                } ${selectedTheme === t ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'}`}
                title={`Theme: ${t}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
