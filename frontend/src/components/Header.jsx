import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FiBell, FiUser, FiMenu } from 'react-icons/fi';
import { canAccessPath, getUserRole, roleLabel } from '../auth/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Header = ({ sidebarOpen, onToggleSidebar }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [alertCount, setAlertCount] = useState(0);
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Admin Dashboard';
    if (path === '/users') return 'Account Roles';
    if (path === '/store') return 'Store';
    if (path === '/store/sales') return 'New Sale';
    if (path === '/store/payment') return 'Payment';
    if (path === '/orders') return 'Orders';
    if (path === '/management') return 'Add Product';
    if (path === '/inventory') return 'Warehouse Inventory';
    if (path === '/raw-materials') return 'Raw Materials';
    if (path === '/customers') return 'Customers';
    if (path.startsWith('/customers/')) return 'Customer Details';
    if (path === '/analytics' || path === '/report') return 'Report';
    if (path === '/stock-movement') return 'Stock Movement';
    if (path === '/notifications') return 'Notifications';
    if (path === '/settings') return 'Settings';
    if (path === '/pending') return 'Access Pending';
    return 'Inventory Management System';
  };

  useEffect(() => {
    if (!canAccessPath('/notifications', user.role)) return;
    axios
      .get(`${API_URL}/notifications`, { params: { role: getUserRole(user) } })
      .then((response) => {
        const items = Array.isArray(response.data) ? response.data : [];
        setAlertCount(items.filter((item) => item.type === 'deadline' && !item.read).length);
      })
      .catch(() => setAlertCount(0));
  }, [location.pathname, user.role]);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="px-3 sm:px-5 py-2.5 sm:py-3 flex justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 shrink-0"
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Open sidebar'}
            title={sidebarOpen ? 'Hide sidebar' : 'Open sidebar'}
          >
            <FiMenu size={20} />
          </button>
          <h1 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">{getPageTitle()}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          {canAccessPath('/notifications', user.role) && (
            <Link
              to="/notifications"
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              {alertCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {user.username || user.name || 'User'}
              </p>
              <p className="text-xs text-gray-400">{roleLabel(user.role)}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
