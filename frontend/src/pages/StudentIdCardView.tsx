import React, { useState, useEffect } from 'react';
import { Award, CreditCard, RefreshCw, Download, ExternalLink, QrCode } from 'lucide-react';
import { idCardApi } from '../api/index.ts';
import { StudentIdCard } from '../types/index.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { Link } from 'react-router-dom';

export const StudentIdCardView: React.FC = () => {
  const [card, setCard] = useState<StudentIdCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    idCardApi
      .getMyCard()
      .then((res) => {
        if (res.success && res.data) {
          setCard(res.data.card);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-400" />
            My Digital Student ID Card
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tap or use the toggle to flip between the front credential and reverse verification details
          </p>
        </div>

        {card && (
          <Link
            to={`/verify/${card.verification_token}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            Open Public Verification Page
          </Link>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Loading cryptographic ID card...
          </div>
        ) : card ? (
          <div className="w-full flex flex-col items-center">
            <DigitalIdCard card={card} showControls={true} />
            <div className="mt-8 text-center text-xs text-slate-400 max-w-md">
              <p>
                This digital card is tamper-evident. The embedded QR code resolves securely to the institution's official public verification registry.
              </p>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Digital ID Card Issued</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              You currently do not have an active student ID card assigned to your account. Please submit an issuance application.
            </p>
            <Link
              to="/student/applications"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Apply for ID Card
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
