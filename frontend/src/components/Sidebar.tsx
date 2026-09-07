import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Building2,
  GraduationCap,
  CalendarDays,
  FileCheck2,
  ScanLine,
  History,
  ShieldAlert,
  UserCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role;

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between p-4 flex-shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* Navigation Groups */}
        {role === 'SUPER_ADMIN' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Super Admin Console
            </div>
            <NavLink to="/admin/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>
            <NavLink to="/admin/institutes" className={navItemClass}>
              <Building2 className="w-4 h-4" /> Institutes
            </NavLink>
            <NavLink to="/admin/audit-logs" className={navItemClass}>
              <History className="w-4 h-4" /> Global Audit Logs
            </NavLink>
          </div>
        )}

        {role === 'INSTITUTE_ADMIN' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Institutional Portal
            </div>
            <NavLink to="/portal/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </NavLink>
            <NavLink to="/portal/students" className={navItemClass}>
              <Users className="w-4 h-4" /> Students Directory
            </NavLink>
            <NavLink to="/portal/id-cards" className={navItemClass}>
              <CreditCard className="w-4 h-4" /> Digital ID Cards
            </NavLink>
            <NavLink to="/portal/applications" className={navItemClass}>
              <FileCheck2 className="w-4 h-4" /> Card Applications
            </NavLink>
            <NavLink to="/portal/teachers" className={navItemClass}>
              <UserCheck className="w-4 h-4" /> Faculty & Staff
            </NavLink>
            <NavLink to="/portal/departments" className={navItemClass}>
              <GraduationCap className="w-4 h-4" /> Departments
            </NavLink>
            <NavLink to="/portal/sessions" className={navItemClass}>
              <CalendarDays className="w-4 h-4" /> Academic Sessions
            </NavLink>
            <NavLink to="/portal/verifications" className={navItemClass}>
              <ScanLine className="w-4 h-4" /> Verification Logs
            </NavLink>
            <NavLink to="/portal/audit-logs" className={navItemClass}>
              <History className="w-4 h-4" /> Security Audit
            </NavLink>
          </div>
        )}

        {role === 'STUDENT' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Student Workspace
            </div>
            <NavLink to="/student/dashboard" className={navItemClass}>
              <LayoutDashboard className="w-4 h-4" /> Overview
            </NavLink>
            <NavLink to="/student/card" className={navItemClass}>
              <Award className="w-4 h-4" /> My Digital ID Card
            </NavLink>
            <NavLink to="/student/applications" className={navItemClass}>
              <FileCheck2 className="w-4 h-4" /> ID Applications
            </NavLink>
            <NavLink to="/student/profile" className={navItemClass}>
              <Users className="w-4 h-4" /> Student Profile
            </NavLink>
          </div>
        )}
      </div>

      {/* Institutional Info Footer */}
      <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Multi-Tenant Isolation
        </div>
        <div className="text-xs font-semibold text-white mt-0.5 truncate">
          Active Institution Vault
        </div>
        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
          Secure DB Connection
        </div>
      </div>
    </aside>
  );
};
