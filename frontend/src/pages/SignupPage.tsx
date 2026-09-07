import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, UserPlus, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { instituteApi } from '../api/index.ts';
import { Institute } from '../types/index.ts';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [instituteId, setInstituteId] = useState('');
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/portal/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    instituteApi
      .list()
      .then((res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data.institutes)
            ? res.data.institutes
            : Array.isArray(res.data)
            ? res.data
            : [];
          setInstitutes(list);
          if (list.length > 0) {
            setInstituteId(list[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await signup({
        full_name: fullName,
        email,
        password,
        institute_id: instituteId,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Create Student Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Register to access your digital student identity card
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Jordan Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jordan.smith@apex.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Educational Institution *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  required
                  value={instituteId}
                  onChange={(e) => setInstituteId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(institutes || []).map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password * (minimum 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already registered?{' '}
            <Link to="/login" className="text-blue-400 hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
