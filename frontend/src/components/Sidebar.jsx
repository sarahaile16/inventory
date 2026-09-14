import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, FiShoppingBag, FiPackage, FiUsers, 
  FiBarChart2, FiTruck, FiBell, FiSettings, FiLogOut,
  FiClipboard, FiClock, FiShield, FiChevronsLeft
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
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/stock-movement', icon: FiTruck, label: 'Stock Movement' },
    { path: '/pending', icon: FiClock, label: 'Access status' },
  ].filter((item) => visible(item.path));

  const bottomMenuItems = [
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ].filter((item) => visible(item.path));

  return (
    <>
      <div className={`
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'}
        fixed lg:static
        ${theme.sidebar} shadow-lg
        flex flex-col
        transition-all duration-300
        z-40
        h-screen
        overflow-hidden
        shrink-0
      `}>
        <div className="p-4 border-b border-white/10 flex items-start justify-between gap-2 min-w-64">
          <div>
            <h2 className={`text-xl font-bold ${theme.brand}`}>Inventory System</h2>
            <p className={`text-xs ${theme.muted}`}>{roleLabel(user?.role)} workspace</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className={`p-2 rounded-lg ${theme.link} shrink-0`}
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            <FiChevronsLeft size={18} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 min-w-64">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 ${theme.link} ${isActive ? theme.active : ''}`
              }
            >
              <item.icon className="mr-3 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="border-t border-white/10 py-4 min-w-64">
          {bottomMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 ${theme.link} ${isActive ? theme.active : ''}`
              }
            >
              <item.icon className="mr-3 shrink-0" />
              {item.label}
            </NavLink>
          ))}
          
          <button
            type="button"
            onClick={handleLogout}
            className={`flex items-center px-4 py-3 ${theme.link} w-full`}
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;
