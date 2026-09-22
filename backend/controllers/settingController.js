// ========== IN-MEMORY STORAGE ==========
let settings = {
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
};

let customFields = [
  { id: 1, name: 'Batch number', type: 'text', required: true },
  { id: 2, name: 'Unit', type: 'options', options: ['KIT', 'PCS', 'SET'], required: true },
  { id: 3, name: 'ITEM ID', type: 'text', required: true },
  { id: 4, name: 'Serial Number', type: 'text', required: false },
  { id: 5, name: 'Expire Date', type: 'date', required: false },
  { id: 6, name: 'PART NUMBER', type: 'text', required: false }
];

let categories = [
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
];

let units = ['PCS', 'SET', 'UNIT'];

let colors = ['Blue', 'Red', 'Green', 'Black', 'White'];

// ========== GENERAL SETTINGS ==========

// @desc    Get all settings
// @route   GET /api/settings
// @access  Private/Admin
const getAllSettings = (req, res) => {
  res.json({
    general: settings.general,
    notifications: settings.notifications,
    security: settings.security,
    inventory: settings.inventory
  });
};

// @desc    Get general settings
// @route   GET /api/settings/general
// @access  Private/Admin
const getGeneralSettings = (req, res) => {
  res.json(settings.general);
};

// @desc    Update general settings
// @route   PUT /api/settings/general
// @access  Private/Admin
const updateGeneralSettings = (req, res) => {
  settings.general = {
    ...settings.general,
    ...req.body
  };
  res.json({
    message: 'General settings updated successfully',
    settings: settings.general
  });
};

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private/Admin
const getNotificationSettings = (req, res) => {
  res.json(settings.notifications);
};

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private/Admin
const updateNotificationSettings = (req, res) => {
  settings.notifications = {
    ...settings.notifications,
    ...req.body
  };
  res.json({
    message: 'Notification settings updated successfully',
    settings: settings.notifications
  });
};

// @desc    Get security settings
// @route   GET /api/settings/security
// @access  Private/Admin
const getSecuritySettings = (req, res) => {
  res.json(settings.security);
};

// @desc    Update security settings
// @route   PUT /api/settings/security
// @access  Private/Admin
const updateSecuritySettings = (req, res) => {
  settings.security = {
    ...settings.security,
    ...req.body
  };
  res.json({
    message: 'Security settings updated successfully',
    settings: settings.security
  });
};

// @desc    Get inventory settings
// @route   GET /api/settings/inventory
// @access  Private/Admin
const getInventorySettings = (req, res) => {
  res.json(settings.inventory);
};

// @desc    Update inventory settings
// @route   PUT /api/settings/inventory
// @access  Private/Admin
const updateInventorySettings = (req, res) => {
  settings.inventory = {
    ...settings.inventory,
    ...req.body
  };
  res.json({
    message: 'Inventory settings updated successfully',
    settings: settings.inventory
  });
};

// ========== CATEGORIES ==========

// @desc    Get all categories
// @route   GET /api/settings/categories
// @access  Public
const getCategories = (req, res) => {
  res.json(categories);
};

// @desc    Create category
// @route   POST /api/settings/categories
// @access  Private/Admin
const createCategory = (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  if (categories.includes(name)) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  categories.push(name);
  res.status(201).json({
    message: 'Category created successfully',
    category: name,
    categories
  });
};

// @desc    Update category
// @route   PUT /api/settings/categories/:index
// @access  Private/Admin
const updateCategory = (req, res) => {
  const index = parseInt(req.params.index);
  const { name } = req.body;

  if (index < 0 || index >= categories.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const oldName = categories[index];
  categories[index] = name;
  
  res.json({
    message: 'Category updated successfully',
    old: oldName,
    new: name,
    categories
  });
};

// @desc    Delete category
// @route   DELETE /api/settings/categories/:index
// @access  Private/Admin
const deleteCategory = (req, res) => {
  const index = parseInt(req.params.index);

  if (index < 0 || index >= categories.length) {
    return res.status(404).json({ message: 'Category not found' });
  }

  const deleted = categories.splice(index, 1)[0];
  res.json({
    message: 'Category deleted successfully',
    category: deleted,
    categories
  });
};

// ========== UNITS ==========

// @desc    Get all units
// @route   GET /api/settings/units
// @access  Public
const getUnits = (req, res) => {
  res.json(units);
};

// @desc    Create unit
// @route   POST /api/settings/units
// @access  Private/Admin
const createUnit = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Unit name is required' });
  }

  if (units.includes(name)) {
    return res.status(400).json({ message: 'Unit already exists' });
  }

  units.push(name);
  res.status(201).json({
    message: 'Unit created successfully',
    unit: name,
    units
  });
};

// @desc    Delete unit
// @route   DELETE /api/settings/units/:index
// @access  Private/Admin
const deleteUnit = (req, res) => {
  const index = parseInt(req.params.index);

  if (index < 0 || index >= units.length) {
    return res.status(404).json({ message: 'Unit not found' });
  }

  const deleted = units.splice(index, 1)[0];
  res.json({
    message: 'Unit deleted successfully',
    unit: deleted,
    units
  });
};

// ========== COLORS ==========

// @desc    Get all colors
// @route   GET /api/settings/colors
// @access  Private/Admin
const getColors = (req, res) => {
  res.json(colors);
};

// @desc    Create color
// @route   POST /api/settings/colors
// @access  Private/Admin
const createColor = (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Color name is required' });
  }

  if (colors.includes(name)) {
    return res.status(400).json({ message: 'Color already exists' });
  }

  colors.push(name);
  res.status(201).json({
    message: 'Color created successfully',
    color: name,
    colors
  });
};

// @desc    Delete color
// @route   DELETE /api/settings/colors/:index
// @access  Private/Admin
const deleteColor = (req, res) => {
  const index = parseInt(req.params.index);

  if (index < 0 || index >= colors.length) {
    return res.status(404).json({ message: 'Color not found' });
  }

  const deleted = colors.splice(index, 1)[0];
  res.json({
    message: 'Color deleted successfully',
    color: deleted,
    colors
  });
};

// ========== CUSTOM FIELDS ==========

// @desc    Get all custom fields
// @route   GET /api/settings/custom-fields
// @access  Private/Admin
const getCustomFields = (req, res) => {
  res.json(customFields);
};

// @desc    Create custom field
// @route   POST /api/settings/custom-fields
// @access  Private/Admin
const createCustomField = (req, res) => {
  const { name, type, required, options } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and type are required' });
  }

  const newField = {
    id: customFields.length + 1,
    name,
    type,
    required: required || false,
    options: type === 'options' ? options || [] : undefined
  };

  customFields.push(newField);
  res.status(201).json({
    message: 'Custom field created successfully',
    field: newField
  });
};

// @desc    Update custom field
// @route   PUT /api/settings/custom-fields/:id
// @access  Private/Admin
const updateCustomField = (req, res) => {
  const id = parseInt(req.params.id);
  const index = customFields.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Custom field not found' });
  }

  customFields[index] = {
    ...customFields[index],
    ...req.body,
    id
  };

  res.json({
    message: 'Custom field updated successfully',
    field: customFields[index]
  });
};

// @desc    Delete custom field
// @route   DELETE /api/settings/custom-fields/:id
// @access  Private/Admin
const deleteCustomField = (req, res) => {
  const id = parseInt(req.params.id);
  const index = customFields.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Custom field not found' });
  }

  const deleted = customFields.splice(index, 1)[0];
  res.json({
    message: 'Custom field deleted successfully',
    field: deleted
  });
};

// ========== SYSTEM INFO ==========

// @desc    Get system info
// @route   GET /api/settings/system-info
// @access  Private/Admin
const getSystemInfo = (req, res) => {
  res.json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    serverTime: new Date().toISOString(),
    uptime: process.uptime()
  });
};

// @desc    Reset all settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
const resetSettings = (req, res) => {
  settings = {
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
  };

  res.json({
    message: 'Settings reset to default successfully',
    settings
  });
};

module.exports = {
  // General
  getAllSettings,
  getGeneralSettings,
  updateGeneralSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getInventorySettings,
  updateInventorySettings,
  
  // Categories
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Units
  getUnits,
  createUnit,
  deleteUnit,
  
  // Colors
  getColors,
  createColor,
  deleteColor,
  
  // Custom Fields
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  
  // System
  getSystemInfo,
  resetSettings
};