import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSettings, FiUser, FiUsers, FiDatabase,
  FiList, FiTag, FiShield, FiBell, FiChevronRight, FiSave
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  PageShell,
  PageHero,
  Panel,
  SoftButton,
  HeroLink
} from '../components/ui/PageChrome';

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30';

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer shrink-0">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600" />
  </label>
);

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

  const [customFields, setCustomFields] = useState([
    { id: 1, name: 'Batch number', type: 'text', required: true },
    { id: 2, name: 'Unit', type: 'options', options: ['KIT', 'PCS', 'SET'], required: true },
    { id: 3, name: 'ITEM ID', type: 'text', required: true },
    { id: 4, name: 'Serial Number', type: 'text', required: false },
    { id: 5, name: 'Expire Date', type: 'number', required: false },
    { id: 6, name: 'PART NUMBER', type: 'text', required: false }
  ]);

  const [categories, setCategories] = useState([
    'Sofas & Couches',
    'Beds & Mattresses',
    'Tables',
    'Chairs & Seating',
    'Cabinets & Wardrobes',
    'Shelves & Storage',
    'Dining Sets',
    'Office Furniture',
    'Outdoor Furniture',
    'Kids Furniture',
    'Decor & Accessories'
  ]);

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
    { id: 'fields', label: 'Fields', icon: FiDatabase },
    { id: 'options', label: 'Options', icon: FiList },
    { id: 'notifications', label: 'Alerts', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'inventory', label: 'Inventory', icon: FiTag }
  ];

  return (
    <PageShell>
      <PageHero
        tone="slate"
        eyebrow="System"
        title="Settings"
        subtitle="Manage preferences and configurations"
        actions={
          <HeroLink to="/settings/add-user" primary>
            <FiUser size={12} /> Add User
          </HeroLink>
        }
      />

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="lg:w-52 shrink-0">
          <Panel title="Management" bodyClassName="p-1.5 sm:p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left whitespace-nowrap transition ${
                      active
                        ? 'bg-teal-50 text-teal-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={14} className="shrink-0" />
                    <span className="flex-1">{tab.label}</span>
                    <FiChevronRight
                      size={12}
                      className={`hidden lg:block ${active ? 'text-teal-600' : 'text-slate-300'}`}
                    />
                  </button>
                );
              })}
            </nav>
          </Panel>
        </div>

        <div className="flex-1 min-w-0">
          <Panel
            title={tabs.find((t) => t.id === activeTab)?.label}
            action={
              <SoftButton
                onClick={handleSaveSettings}
                disabled={loading}
                className={`bg-teal-600 text-white hover:bg-teal-700 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <FiSave size={12} /> Save
                  </>
                )}
              </SoftButton>
            }
          >
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'companyName', label: 'Company Name', type: 'text' },
                  { key: 'companyEmail', label: 'Company Email', type: 'email' },
                  { key: 'companyPhone', label: 'Company Phone', type: 'text' },
                  { key: 'address', label: 'Address', type: 'text' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={settings.general[field.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, [field.key]: e.target.value }
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Currency
                  </label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, currency: e.target.value }
                      })
                    }
                    className={inputClass}
                  >
                    <option value="ETB">ETB - Ethiopian Birr</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Timezone
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, timezone: e.target.value }
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Africa/Addis_Ababa">Addis Ababa (GMT+3)</option>
                    <option value="Africa/Nairobi">Nairobi (GMT+3)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'fields' && (
              <div>
                <h3 className="text-xs font-semibold text-slate-700 mb-2">Custom fields</h3>
                <div className="space-y-1.5 mb-4">
                  {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between gap-2 p-2.5 border border-slate-100 rounded-xl"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-medium truncate">{field.name}</span>
                        <span className="text-[10px] text-slate-500 ml-1">– {field.type}</span>
                        {field.required && (
                          <span className="ml-1.5 text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-md">
                            Required
                          </span>
                        )}
                      </div>
                      <SoftButton className="text-rose-500 hover:bg-rose-50 shrink-0">
                        Delete
                      </SoftButton>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">Add new field</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Field name"
                      className={`${inputClass} flex-1`}
                    />
                    <select className={`${inputClass} sm:w-32`}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="options">Options</option>
                      <option value="date">Date</option>
                    </select>
                    <SoftButton className="bg-teal-600 text-white hover:bg-teal-700">
                      Add
                    </SoftButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'options' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">Colors</h3>
                  <div className="space-y-1 mb-2">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-slate-100 rounded-lg"
                      >
                        <span className="text-xs">{color}</span>
                        <SoftButton
                          onClick={() => handleDeleteOption('colors', index)}
                          className="text-rose-500 hover:bg-rose-50"
                        >
                          Delete
                        </SoftButton>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add color"
                      value={newOption.type === 'colors' ? newOption.value : ''}
                      onChange={(e) => setNewOption({ type: 'colors', value: e.target.value })}
                      className={`${inputClass} flex-1`}
                    />
                    <SoftButton
                      onClick={handleAddOption}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Add
                    </SoftButton>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-700 mb-2">Categories</h3>
                  <div className="space-y-1 mb-2 max-h-48 overflow-y-auto">
                    {categories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border border-slate-100 rounded-lg"
                      >
                        <span className="text-xs truncate">{category}</span>
                        <SoftButton
                          onClick={() => handleDeleteOption('categories', index)}
                          className="text-rose-500 hover:bg-rose-50 shrink-0"
                        >
                          Delete
                        </SoftButton>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add category"
                      value={newOption.type === 'categories' ? newOption.value : ''}
                      onChange={(e) =>
                        setNewOption({ type: 'categories', value: e.target.value })
                      }
                      className={`${inputClass} flex-1`}
                    />
                    <SoftButton
                      onClick={handleAddOption}
                      className="bg-teal-600 text-white hover:bg-teal-700"
                    >
                      Add
                    </SoftButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-2">
                {[
                  {
                    key: 'emailAlerts',
                    title: 'Email Alerts',
                    desc: 'Receive email notifications'
                  },
                  {
                    key: 'lowStockAlerts',
                    title: 'Low Stock Alerts',
                    desc: 'Get notified when stock is low'
                  },
                  {
                    key: 'stockMovementAlerts',
                    title: 'Stock Movement Alerts',
                    desc: 'Get notified about stock movements'
                  },
                  {
                    key: 'dailyReport',
                    title: 'Daily Report',
                    desc: 'Receive daily sales report'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 p-2.5 border border-slate-100 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={settings.notifications[item.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [item.key]: e.target.checked
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 p-2.5 border border-slate-100 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Two-Factor Authentication</p>
                    <p className="text-[10px] text-slate-500">Add extra security to your account</p>
                  </div>
                  <Toggle
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorAuth: e.target.checked }
                      })
                    }
                  />
                </div>

                {[
                  { key: 'sessionTimeout', label: 'Session Timeout (minutes)' },
                  { key: 'passwordExpiry', label: 'Password Expiry (days)' },
                  { key: 'maxLoginAttempts', label: 'Max Login Attempts' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={settings.security[field.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            [field.key]: parseInt(e.target.value)
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Default Restock Level
                    </label>
                    <input
                      type="number"
                      value={settings.inventory.defaultRestockLevel}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          inventory: {
                            ...settings.inventory,
                            defaultRestockLevel: parseInt(e.target.value)
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      value={settings.inventory.lowStockThreshold}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          inventory: {
                            ...settings.inventory,
                            lowStockThreshold: parseInt(e.target.value)
                          }
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {[
                  {
                    key: 'enableBatchTracking',
                    title: 'Enable Batch Tracking',
                    desc: 'Track products by batch numbers'
                  },
                  {
                    key: 'enableExpiryTracking',
                    title: 'Enable Expiry Tracking',
                    desc: 'Track product expiry dates'
                  },
                  {
                    key: 'autoGenerateSKU',
                    title: 'Auto Generate SKU',
                    desc: 'Automatically generate SKU for new products'
                  }
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 p-2.5 border border-slate-100 rounded-xl"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={settings.inventory[item.key]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          inventory: {
                            ...settings.inventory,
                            [item.key]: e.target.checked
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">Account roles</h3>
                <p className="text-xs text-slate-600 mt-1.5 mb-3">
                  New signups start as User. Approve Staff or Management from the dedicated admin
                  page.
                </p>
                <Link
                  to="/users"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600 text-white hover:bg-teal-700"
                >
                  <FiUsers size={12} /> Open role manager
                </Link>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </PageShell>
  );
};

export default Settings;
