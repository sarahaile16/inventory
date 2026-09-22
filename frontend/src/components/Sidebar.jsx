import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiShoppingBag, FiPackage, FiUsers,
  FiBarChart2, FiTruck, FiBell, FiSettings, FiLogOut,
  FiClipboard, FiClock, FiShield, FiChevronsLeft, FiX, FiLayers
} from 'react-icons/fi';
import { canAccessPath, getStoredUser, roleLabel, roleTheme } from '../auth/roles';

const Sidebar = ({ isOpen, onToggle }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const user = getStoredUser();
  const theme = roleTheme(user?.role);
  const visible = (path) => canAccessPath(path, user?.role);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/users', icon: FiShield, label: 'Users' },
    { path: '/store', icon: FiShoppingBag, label: 'Store' },
    { path: '/orders', icon: FiClipboard, label: 'Orders' },
    { path: '/management', icon: FiPackage, label: 'Add Product' },
    { path: '/inventory', icon: FiPackage, label: 'Inventory' },
    { path: '/raw-materials', icon: FiLayers, label: 'Raw Materials' },
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/stock-movement', icon: FiTruck, label: 'Stock Movement' },
    { path: '/pending', icon: FiClock, label: 'Access status' },
  ].filter((item) => visible(item.path));

  const bottomMenuItems = [
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ].filter((item) => visible(item.path));

  const closeIfMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onToggle();
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 lg:px-3.5 lg:py-2.5 text-xs lg:text-sm rounded-lg mx-2 ${theme.link} ${
      isActive ? theme.active : ''
    }`;

  return (
    <>
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          flex flex-col overflow-hidden shrink-0
          ${theme.sidebar} shadow-xl lg:shadow-lg
          transition-transform duration-300 ease-out
          w-[min(15rem,78vw)] lg:w-56
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isOpen ? 'lg:w-56' : 'lg:w-0'}
        `}
      >
        <div className="px-3 py-2.5 lg:px-3.5 lg:py-3 border-b border-white/10 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className={`text-sm lg:text-base font-bold truncate ${theme.brand}`}>FurniStock</h2>
            <p className={`text-[10px] truncate ${theme.muted}`}>{roleLabel(user?.role)}</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={`p-1.5 rounded-lg ${theme.link} shrink-0`}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <span className="lg:hidden"><FiX size={16} /></span>
            <span className="hidden lg:inline"><FiChevronsLeft size={16} /></span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeIfMobile}
              className={linkClass}
            >
              <item.icon className="shrink-0" size={15} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 py-2 space-y-0.5">
          {bottomMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeIfMobile}
              className={linkClass}
            >
              <item.icon className="shrink-0" size={15} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center gap-2.5 px-3 py-2 lg:px-3.5 lg:py-2.5 text-xs lg:text-sm rounded-lg mx-2 w-[calc(100%-1rem)] ${theme.link}`}
          >
            <FiLogOut className="shrink-0" size={15} />
            Logout
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
