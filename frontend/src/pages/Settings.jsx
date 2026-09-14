import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSettings, FiUser, FiUsers, FiDatabase, 
  FiList, FiTag, FiSliders, FiShield,
  FiBell, FiMail, FiLock, FiGlobe,
  FiChevronRight, FiSave
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      companyName: 'Inventory Management System',
      companyEmail: 'admin@inventory.com',
      companyPhone: '+251 911 234 567',
      address: 'Addis Ababa, Ethiopia',
      currency: 'ETB',
      timezone: 'Africa/Addis_Ababa'
    },
    notifications: {
      emailAlerts: true,
      lowStockAlerts: true,
      stockMovementAlerts: true,
      salesAlerts: true,
      dailyReport: false,
      weeklyReport: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      maxLoginAttempts: 5
    },
    inventory: {
      defaultRestockLevel: 10,
      lowStockThreshold: 5,
      enableBatchTracking: true,
      enableExpiryTracking: true,
      autoGenerateSKU: true
    }
  });

  // Mock data for custom fields based on screenshot #13
  const [customFields, setCustomFields] = useState([
    { id: 1, name: 'Batch number', type: 'text', required: true },
    { id: 2, name: 'Unit', type: 'options', options: ['KIT', 'PCS', 'SET'], required: true },
    { id: 3, name: 'ITEM ID', type: 'text', required: true },
    { id: 4, name: 'Serial Number', type: 'text', required: false },
    { id: 5, name: 'Expire Date', type: 'number', required: false },
    { id: 6, name: 'PART NUMBER', type: 'text', required: false }
  ]);

  // Mock data for categories based on screenshot #13
  const [categories, setCategories] = useState([
    'Dinnerware',
    'Plates',
    'Salad & Side Plates',
    'Bowls',
    'Deep Plates'
  ]);

  // Mock data for colors
  const [colors, setColors] = useState([
    'Blue',
    'Red',
    'Green',
    'Black',
    'White'
  ]);

  const [newOption, setNewOption] = useState({
    type: 'colors',
    value: ''
  });

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setLoading(false);
    }, 1000);
  };

  const handleAddOption = () => {
    if (newOption.value) {
      if (newOption.type === 'colors') {
        setColors([...colors, newOption.value]);
      } else if (newOption.type === 'categories') {
        setCategories([...categories, newOption.value]);
      }
      setNewOption({ ...newOption, value: '' });
      toast.success('Option added successfully');
    }
  };

  const handleDeleteOption = (type, index) => {
    if (type === 'colors') {
      setColors(colors.filter((_, i) => i !== index));
    } else if (type === 'categories') {
      setCategories(categories.filter((_, i) => i !== index));
    }
    toast.success('Option deleted');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: FiSettings },
    { id: 'users', label: 'Users', icon: FiUsers },
    { id: 'fields', label: 'Manage Fields', icon: FiDatabase },
    { id: 'options', label: 'Manage Options', icon: FiList },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'inventory', label: 'Inventory', icon: FiTag }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your system preferences and configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation - Matching screenshot #12 */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="font-semibold">Management</h2>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="mr-3" size={18} />
                    <span className="flex-1">{tab.label}</span>
                    <FiChevronRight size={16} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                  </button>
                );
              })}
            </nav>

            {/* Add User Button - From screenshot #12 */}
            <div className="p-4 border-t">
              <Link
                to="/settings/add-user"
                className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <FiUser className="mr-2" />
                Add User
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {/* Tab Header */}
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        value={settings.general.companyName}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, companyName: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Company Email</label>
                      <input
                        type="email"
                        value={settings.general.companyEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, companyEmail: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Company Phone</label>
                      <input
                        type="text"
                        value={settings.general.companyPhone}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, companyPhone: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Address</label>
                      <input
                        type="text"
                        value={settings.general.address}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, address: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Currency</label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, currency: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ETB">ETB - Ethiopian Birr</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Timezone</label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, timezone: e.target.value }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Africa/Addis_Ababa">Addis Ababa (GMT+3)</option>
                        <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Manage Fields - Based on screenshot #13 */}
              {activeTab === 'fields' && (
                <div>
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Custom Fields List</h3>
                    <div className="space-y-2">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">{field.name}</span>
                            <span className="text-sm text-gray-500 ml-2">– {field.type}</span>
                            {field.required && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <button className="text-red-500 hover:text-red-700">
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Add New Field</h3>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Enter Field Name"
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select className="w-40 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="options">Options</option>
                        <option value="date">Date</option>
                      </select>
                      <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manage Options - Based on screenshot #13 */}
              {activeTab === 'options' && (
                <div className="space-y-8">
                  {/* Colors */}
                  <div>
                    <h3 className="font-semibold mb-4">Colors</h3>
                    <div className="space-y-2 mb-4">
                      {colors.map((color, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{color}</span>
                          <button
                            onClick={() => handleDeleteOption('colors', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add Color"
                        value={newOption.type === 'colors' ? newOption.value : ''}
                        onChange={(e) => setNewOption({ type: 'colors', value: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddOption}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold mb-4">Categories</h3>
                    <div className="space-y-2 mb-4">
                      {categories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{category}</span>
                          <button
                            onClick={() => handleDeleteOption('categories', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add Category"
                        value={newOption.type === 'categories' ? newOption.value : ''}
                        onChange={(e) => setNewOption({ type: 'categories', value: e.target.value })}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddOption}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Alerts</p>
                      <p className="text-sm text-gray-500">Receive email notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.emailAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, emailAlerts: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when stock is low</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.lowStockAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, lowStockAlerts: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Stock Movement Alerts</p>
                      <p className="text-sm text-gray-500">Get notified about stock movements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.stockMovementAlerts}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, stockMovementAlerts: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Daily Report</p>
                      <p className="text-sm text-gray-500">Receive daily sales report</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications.dailyReport}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: { ...settings.notifications, dailyReport: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, twoFactorAuth: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Password Expiry (days)</label>
                    <input
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, passwordExpiry: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                      })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Inventory Settings */}
              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Default Restock Level</label>
                      <input
                        type="number"
                        value={settings.inventory.defaultRestockLevel}
                        onChange={(e) => setSettings({
                          ...settings,
                          inventory: { ...settings.inventory, defaultRestockLevel: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={settings.inventory.lowStockThreshold}
                        onChange={(e) => setSettings({
                          ...settings,
                          inventory: { ...settings.inventory, lowStockThreshold: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable Batch Tracking</p>
                      <p className="text-sm text-gray-500">Track products by batch numbers</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.inventory.enableBatchTracking}
                        onChange={(e) => setSettings({
                          ...settings,
                          inventory: { ...settings.inventory, enableBatchTracking: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Enable Expiry Tracking</p>
                      <p className="text-sm text-gray-500">Track product expiry dates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.inventory.enableExpiryTracking}
                        onChange={(e) => setSettings({
                          ...settings,
                          inventory: { ...settings.inventory, enableExpiryTracking: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Auto Generate SKU</p>
                      <p className="text-sm text-gray-500">Automatically generate SKU for new products</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.inventory.autoGenerateSKU}
                        onChange={(e) => setSettings({
                          ...settings,
                          inventory: { ...settings.inventory, autoGenerateSKU: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Users Management */}
              {activeTab === 'users' && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Account roles</h3>
                  <p className="text-sm text-slate-600 mt-2 mb-4">
                    New signups start as User. Approve Staff or Management from the dedicated admin page.
                  </p>
                  <Link
                    to="/users"
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                  >
                    <FiUsers className="mr-2" />
                    Open role manager
                  </Link>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className={`flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;