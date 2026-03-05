import React from 'react';
import { useLocation } from 'react-router-dom';
import { FiBell, FiUser } from 'react-icons/fi';

const Header = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/store') return 'Store Management System';
    if (path === '/store/multi-sales') return 'Multi-Sales';
    if (path === '/management') return 'Add Product';
    if (path === '/inventory') return 'Warehouse Inventory';
    if (path === '/customers') return 'Customer Management System';
    if (path === '/analytics') return 'Analytics';
    if (path === '/stock-movement') return 'Stock Movement';
    if (path === '/notifications') return 'Notifications';
    if (path === '/settings') return 'Settings';
    return 'Inventory Management System';
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <FiUser size={16} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {user.username || 'admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;