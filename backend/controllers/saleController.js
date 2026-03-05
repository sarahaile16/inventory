const express = require('express');
const router = express.Router();
const {
  // Basic CRUD
  getAllSales,
  getSaleById,
  getSaleByTransactionId,
  createSale,
  updateSale,
  deleteSale,
  
  // Analytics
  getTotalSales,
  getSalesStats,
  getSalesByDateRange,
  getRecentSales,
  
  // Payment
  processPayment,
  getPaymentByTransactionId,
  updatePaymentStatus,
  
  // Invoice
  generateInvoice
} = require('../controllers/saleController');
const { authMiddleware, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes require authentication
router.use(authMiddleware);

// ========== ANALYTICS ROUTES ==========
router.get('/total', getTotalSales);
router.get('/stats', getSalesStats);
router.get('/recent', getRecentSales);
router.get('/range', getSalesByDateRange);

// ========== PAYMENT ROUTES ==========
router.post('/payment', upload.single('paymentProof'), processPayment);
router.get('/payment/:transactionId', getPaymentByTransactionId);
router.put('/payment/:transactionId', updatePaymentStatus);

// ========== INVOICE ROUTES ==========
router.get('/:id/invoice', generateInvoice);

// ========== MAIN CRUD ROUTES ==========
router.get('/', getAllSales);
router.get('/transaction/:transactionId', getSaleByTransactionId);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.put('/:id', updateSale);
router.delete('/:id', authorize('admin'), deleteSale);

module.exports = router;