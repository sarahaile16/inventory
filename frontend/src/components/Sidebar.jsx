import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiShoppingBag, FiPackage, FiUsers, 
  FiBarChart2, FiTruck, FiBell, FiSettings, FiLogOut,
  FiMenu, FiX
} from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/store', icon: FiShoppingBag, label: 'Store' },
    { 
      path: '/management', 
      icon: FiPackage, 
      label: 'Management',
      subItems: [
        { path: '/management/add-product', label: 'Add Product' },
        { path: '/inventory', label: 'Inventory' },
      ]
    },
    { path: '/inventory', icon: FiPackage, label: 'Inventory' },
    { path: '/customers', icon: FiUsers, label: 'Customers' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/stock-movement', icon: FiTruck, label: 'Stock Movement' },
  ];

  const bottomMenuItems = [
    { path: '/notifications', icon: FiBell, label: 'Notifications' },
    { path: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:static
        w-64 bg-white shadow-lg
        flex flex-col
        transition-transform duration-300
        z-40
        h-screen
      `}>
        {/* Logo */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Inventory System</h2>
          <p className="text-xs text-gray-500">Management</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`
              }
            >
              <item.icon className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Bottom Menu */}
        <div className="border-t py-4">
          {bottomMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                }`
              }
            >
              <item.icon className="mr-3" />
              {item.label}
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 w-full"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0  bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;