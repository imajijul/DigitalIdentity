import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'STUDENT') navigate('/student/dashboard');
      else navigate('/portal/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login({ email: demoEmail, password: demoPass });
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed.');
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
          Sign In to Portal
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Access your digital credentials or institutional administration console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <KeyRound className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@apex.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
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
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Fast Demo Logins */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick Role Test Logins
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@apex.edu', 'admin123')}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-blue-600/20 border border-slate-700/80 hover:border-blue-500/40 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-blue-400">Inst Admin</div>
                <div className="text-[9px] text-slate-400 truncate">admin@apex.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@apex.edu', 'student123')}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-amber-600/20 border border-slate-700/80 hover:border-amber-500/40 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-amber-400">Student</div>
                <div className="text-[9px] text-slate-400 truncate">alex@apex.edu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('super@educloud.org', 'super123')}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-purple-600/20 border border-slate-700/80 hover:border-purple-500/40 text-left transition-colors group"
              >
                <div className="text-[11px] font-bold text-white group-hover:text-purple-400">Super Admin</div>
                <div className="text-[9px] text-slate-400 truncate">super@educloud</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 pt-2">
            New student?{' '}
            <Link to="/signup" className="text-blue-400 hover:underline font-semibold">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
