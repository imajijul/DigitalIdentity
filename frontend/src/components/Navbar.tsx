import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  QrCode,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { notificationApi } from '../api/index.ts';
import { Notification } from '../types/index.ts';
import { QrScannerModal } from './QrScannerModal.tsx';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      notificationApi
        .list()
        .then((res) => {
          if (res.success && res.data) {
            setNotifications(res.data.notifications || []);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => !n.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleBadgeClass = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'INSTITUTE_ADMIN':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'TEACHER':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'STUDENT':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                <span>Student Digital ID</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Cloud
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Identity & QR Verification Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-3">
          {/* Quick QR Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            title="Scan QR Code to Verify"
          >
            <QrCode className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Verify QR</span>
          </button>

          {user ? (
            <>
              {/* Notification Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-blue-400" /> Notifications ({unreadCount})
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                      {safeNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications at this time.
                        </div>
                      ) : (
                        safeNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 text-xs transition-colors ${
                              n.is_read ? 'opacity-60 bg-transparent' : 'bg-blue-950/20'
                            }`}
                          >
                            <div className="font-semibold text-white mb-0.5">{n.title}</div>
                            <div className="text-slate-300 text-[11px] leading-relaxed">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                              {new Date(n.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-xs font-semibold text-white leading-tight">
                      {user.full_name}
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeClass(
                        user.role
                      )}`}
                    >
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5">
                    <div className="p-2 border-b border-slate-800 mb-1">
                      <div className="text-xs font-bold text-white">{user.full_name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    </div>

                    {user.role === 'STUDENT' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                        My Profile & ID Card
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors hidden sm:inline"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* QR Scanner Modal */}
      <QrScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </>
  );
};
