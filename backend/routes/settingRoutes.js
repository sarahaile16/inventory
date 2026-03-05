const express = require('express');
const router = express.Router();

// Categories
router.get('/categories', (req, res) => {
  const categories = [
    'Dinnerware',
    'Plates',
    'Salad & Side Plates',
    'Bowls',
    'Deep Plates'
  ];
  res.json(categories);
});

// Units
router.get('/units', (req, res) => {
  const units = ['KIT', 'PCS', 'SET'];
  res.json(units);
});

// General settings
router.get('/general', (req, res) => {
  res.json({
    companyName: 'Inventory Management System',
    companyEmail: 'admin@inventory.com',
    companyPhone: '+251 911 234 567',
    address: 'Addis Ababa, Ethiopia',
    currency: 'ETB',
    timezone: 'Africa/Addis_Ababa'
  });
});

// Notification settings
router.get('/notifications', (req, res) => {
  res.json({
    emailAlerts: true,
    lowStockAlerts: true,
    stockMovementAlerts: true,
    salesAlerts: true,
    dailyReport: false,
    weeklyReport: true
  });
});

// Security settings
router.get('/security', (req, res) => {
  res.json({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5
  });
});

// Inventory settings
router.get('/inventory', (req, res) => {
  res.json({
    defaultRestockLevel: 10,
    lowStockThreshold: 5,
    enableBatchTracking: true,
    enableExpiryTracking: true,
    autoGenerateSKU: true
  });
});

module.exports = router;