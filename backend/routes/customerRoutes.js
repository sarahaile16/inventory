const express = require('express');
const router = express.Router();
const { requireAuth, requireRoles, ROLES } = require('../middleware/auth');
const {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  addCustomerOrder,
  updateCustomer,
  deleteCustomer,
  addCustomerDocument,
  deleteCustomerDocument,
  getCustomerPurchases,
  addCustomerPurchase,
  getCustomerStats,
  getRecentCustomers,
  searchCustomers,
  getCustomerTypes,
  getCustomerStatuses,
  bulkImportCustomers
} = require('../controllers/customerController');

const deskRoles = [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF];
const moneyRoles = [ROLES.ADMIN, ROLES.MANAGEMENT];

router.use(requireAuth);

router.get('/stats/summary', requireRoles(...deskRoles), getCustomerStats);
router.get('/recent', requireRoles(...deskRoles), getRecentCustomers);
router.get('/types', requireRoles(...deskRoles), getCustomerTypes);
router.get('/statuses', requireRoles(...deskRoles), getCustomerStatuses);
router.get('/search', requireRoles(...deskRoles), searchCustomers);

router.post('/bulk', requireRoles(...moneyRoles), bulkImportCustomers);
router.get('/phone/:phone', requireRoles(...moneyRoles), getCustomerByPhone);

router.get('/:id/purchases', requireRoles(...deskRoles), getCustomerPurchases);
router.post('/:id/purchases', requireRoles(...moneyRoles), addCustomerPurchase);
router.post('/:id/orders', requireRoles(...deskRoles), addCustomerOrder);

router.post('/:id/documents', requireRoles(...deskRoles), addCustomerDocument);
router.delete('/:id/documents/:docId', requireRoles(...moneyRoles), deleteCustomerDocument);

router.get('/', requireRoles(...deskRoles), getAllCustomers);
router.get('/:id', requireRoles(...deskRoles), getCustomerById);
router.post('/', requireRoles(...deskRoles), createCustomer);
router.put('/:id', requireRoles(...moneyRoles), updateCustomer);
router.delete('/:id', requireRoles(ROLES.ADMIN), deleteCustomer);

module.exports = router;
