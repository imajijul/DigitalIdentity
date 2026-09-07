import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Role } from '../types/index.ts';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <Outlet />;
};
