const express = require('express');
const router = express.Router();
const {
  getEmailStatus,
  sendTestEmail,
  hasRealSmtpConfig
} = require('../utils/emailService');

// Finished furniture product categories
const FINISHED_CATEGORIES = [
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

// Furniture raw materials (wood, foam, fabric, etc.)
const RAW_CATEGORIES = [
  'Wood / Timber',
  'Plywood / MDF / Board',
  'Foam / Cushion',
  'Fabric / Upholstery',
  'Leather',
  'Hardware / Fittings',
  'Glue / Adhesives',
  'Paint / Lacquer / Finish',
  'Metal / Frames',
  'Glass / Mirror',
  'Springs / Webbing',
  'Packaging materials',
  'Other raw materials'
];

// Categories — ?type=raw | finished | all
router.get('/categories', (req, res) => {
  const type = String(req.query.type || 'finished').toLowerCase();
  if (type === 'raw') {
    return res.json(RAW_CATEGORIES);
  }
  if (type === 'all') {
    return res.json([...FINISHED_CATEGORIES, ...RAW_CATEGORIES]);
  }
  res.json(FINISHED_CATEGORIES);
});

router.get('/raw-categories', (_req, res) => {
  res.json(RAW_CATEGORIES);
});

// Units
router.get('/units', (req, res) => {
  const units = ['PCS', 'SET', 'UNIT', 'KG', 'M', 'L', 'BOX'];
  res.json(units);
});

// Email / SMTP status (no secrets returned)
router.get('/email-status', require('../middleware/auth').requireAuth, require('../middleware/auth').requireRoles('admin', 'management'), (req, res) => {
  res.json(getEmailStatus());
});

// Send a test order-confirmation email
router.post('/test-email', require('../middleware/auth').requireAuth, require('../middleware/auth').requireRoles('admin'), async (req, res) => {
  const to = (req.body?.to || '').trim();
  if (!to) {
    return res.status(400).json({ message: 'Provide { "to": "you@email.com" }' });
  }
  if (!hasRealSmtpConfig() && String(process.env.EMAIL_TEST_MODE || '').toLowerCase() !== 'true') {
    return res.status(400).json({
      message: 'SMTP is not configured in backend/.env. Add SMTP_HOST, SMTP_USER, SMTP_PASS (Brevo recommended), then restart the backend.',
      status: getEmailStatus()
    });
  }
  const result = await sendTestEmail(to);
  if (!result.sent) {
    return res.status(500).json({ message: result.error || 'Failed to send test email', result });
  }
  res.json({ message: 'Test email sent', result });
});

// General settings
router.get('/general', (req, res) => {
  res.json({
    companyName: process.env.COMPANY_NAME || 'Inventory Management System',
    companyEmail: process.env.COMPANY_EMAIL || 'admin@inventory.com',
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