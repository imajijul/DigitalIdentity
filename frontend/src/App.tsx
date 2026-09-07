import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { Layout } from './components/Layout.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

// Pages
import { HomePage } from './pages/HomePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SignupPage } from './pages/SignupPage.tsx';
import { PublicVerificationPage } from './pages/PublicVerificationPage.tsx';

// Portal (Institute Admin & Teacher)
import { InstituteDashboard } from './pages/InstituteDashboard.tsx';
import { InstituteStudentsPage } from './pages/InstituteStudentsPage.tsx';
import { InstituteIdCardsPage } from './pages/InstituteIdCardsPage.tsx';
import { InstituteApplicationsPage } from './pages/InstituteApplicationsPage.tsx';
import { InstituteDepartmentsPage } from './pages/InstituteDepartmentsPage.tsx';
import { InstituteSessionsPage } from './pages/InstituteSessionsPage.tsx';
import { InstituteTeachersPage } from './pages/InstituteTeachersPage.tsx';
import { InstituteVerificationsPage } from './pages/InstituteVerificationsPage.tsx';
import { InstituteAuditLogsPage } from './pages/InstituteAuditLogsPage.tsx';

// Student Portal
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { StudentIdCardView } from './pages/StudentIdCardView.tsx';
import { StudentApplicationsPage } from './pages/StudentApplicationsPage.tsx';
import { StudentProfilePage } from './pages/StudentProfilePage.tsx';

// Super Admin
import { SuperAdminDashboard } from './pages/SuperAdminDashboard.tsx';
import { SuperAdminInstitutesPage } from './pages/SuperAdminInstitutesPage.tsx';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Standalone Public Verification View */}
            <Route path="/verify/:token" element={<PublicVerificationPage />} />

            {/* Application Shell Routes with Navbar, Sidebar, and Toasts */}
            <Route element={<Layout />}>
              {/* Public Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Institute Admin & Faculty Routes */}
              <Route element={<ProtectedRoute allowedRoles={['INSTITUTE_ADMIN', 'TEACHER', 'SUPER_ADMIN']} />}>
                <Route path="/portal/dashboard" element={<InstituteDashboard />} />
                <Route path="/portal/students" element={<InstituteStudentsPage />} />
                <Route path="/portal/id-cards" element={<InstituteIdCardsPage />} />
                <Route path="/portal/applications" element={<InstituteApplicationsPage />} />
                <Route path="/portal/departments" element={<InstituteDepartmentsPage />} />
                <Route path="/portal/sessions" element={<InstituteSessionsPage />} />
                <Route path="/portal/teachers" element={<InstituteTeachersPage />} />
                <Route path="/portal/verifications" element={<InstituteVerificationsPage />} />
                <Route path="/portal/audit-logs" element={<InstituteAuditLogsPage />} />
              </Route>

              {/* Protected Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/card" element={<StudentIdCardView />} />
                <Route path="/student/applications" element={<StudentApplicationsPage />} />
                <Route path="/student/profile" element={<StudentProfilePage />} />
              </Route>

              {/* Protected Super Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
                <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
                <Route path="/admin/institutes" element={<SuperAdminInstitutesPage />} />
                <Route path="/admin/audit-logs" element={<InstituteAuditLogsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
