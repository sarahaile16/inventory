import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { getStoredUser, roleTheme } from '../auth/roles';

const Layout = () => {
  const theme = roleTheme(getStoredUser()?.role);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) return saved === 'true';
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className={`flex h-screen ${theme.page}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto min-w-0 ${theme.page}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
