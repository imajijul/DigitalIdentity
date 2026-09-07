import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.tsx';
import { Sidebar } from './Sidebar.tsx';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Role-Aware Sidebar */}
        <Sidebar />

        {/* Dynamic Main Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
