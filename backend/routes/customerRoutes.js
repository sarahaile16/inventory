const express = require('express');
const router = express.Router();
const {
  // Basic CRUD
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Purchase History
  getCustomerPurchases,
  addCustomerPurchase,
  
  // Statistics & Search
  getCustomerStats,
  getRecentCustomers,
  searchCustomers,
  
  // Utilities
  getCustomerTypes,
  getCustomerStatuses,
  
  // Bulk Operations
  bulkImportCustomers
} = require('../controllers/customerController');

// ========== STATISTICS ROUTES ==========
router.get('/stats/summary', getCustomerStats);
router.get('/recent', getRecentCustomers);
router.get('/types', getCustomerTypes);
router.get('/statuses', getCustomerStatuses);
router.get('/search', searchCustomers);

// ========== BULK OPERATIONS ==========
router.post('/bulk', bulkImportCustomers);

// ========== PHONE LOOKUP ==========
router.get('/phone/:phone', getCustomerByPhone);

// ========== CUSTOMER PURCHASES ==========
router.get('/:id/purchases', getCustomerPurchases);
router.post('/:id/purchases', addCustomerPurchase);

// ========== MAIN CRUD ROUTES ==========
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;