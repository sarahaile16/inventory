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

  // Keep drawer closed by default on small screens; open by default on desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    // Only force-close when crossing into mobile, not every resize spam
    const mq = window.matchMedia('(max-width: 1023px)');
    const handle = (e) => {
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener?.('change', handle);
    if (mq.matches) setSidebarOpen(false);
    return () => mq.removeEventListener?.('change', handle);
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <div className={`flex h-screen ${theme.page}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto min-w-0 ${theme.page}`}>
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
