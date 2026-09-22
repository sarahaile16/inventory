const express = require('express');
const router = express.Router();
const { sales, persistSales } = require('../data/store');
const {
  requireAuth,
  requireRoles,
  ROLES,
  canSeeMoney,
  sanitizeSaleForRole
} = require('../middleware/auth');

const deskRoles = [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF];
const moneyRoles = [ROLES.ADMIN, ROLES.MANAGEMENT];

const splitPayment = (totalAmount, firstPayment) => {
  const total = Number(totalAmount || 0);
  const first = Math.max(0, Number(firstPayment || 0));
  const rest = Math.max(0, total - first);
  return { total, first, rest };
};

router.use(requireAuth);

router.get('/', requireRoles(...deskRoles), (req, res) => {
  res.json(sales.map((sale) => sanitizeSaleForRole(sale, req.user.role)));
});

router.get('/total', requireRoles(...moneyRoles), (req, res) => {
  const total = sales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  res.json({ total });
});

router.get('/:id', requireRoles(...deskRoles), (req, res) => {
  const sale = sales.find((s) => String(s._id) === String(req.params.id));
  if (sale) {
    res.json(sanitizeSaleForRole(sale, req.user.role));
  } else {
    res.status(404).json({ message: 'Sale not found' });
  }
});

router.post('/', requireRoles(...deskRoles), (req, res) => {
  // Staff can create sales but payment amounts should come from management when possible.
  // Still accept body so desk can record; response is redacted for staff.
  const { total, first, rest } = splitPayment(
    req.body.totalAmount || req.body.total || req.body.priceInETB,
    req.body.firstPayment
  );

  const newSale = {
    _id: sales.length > 0 ? Math.max(...sales.map((s) => Number(s._id) || 0)) + 1 : 1,
    transactionId: req.body.transactionId || ('FS-' + Date.now().toString().slice(-12)),
    customerName: req.body.customerName || req.body.buyerInfo?.fullName || '',
    paymentMethod: req.body.paymentMethod || '',
    items: req.body.items || req.body.cart || [],
    totalAmount: total,
    firstPayment: first,
    restPayment: Number(req.body.restPayment || rest),
    restPaid: Number(req.body.restPayment || rest) === 0,
    paymentStatus: Number(req.body.restPayment || rest) === 0 ? 'fully_paid' : 'first_paid',
    deadline: req.body.deadline || '',
    status: req.body.status || 'pending',
    date: new Date().toISOString().slice(0, 10)
  };
  sales.push(newSale);
  persistSales();

  try {
    const { checkAndNotifyDeadlineAlerts } = require('../utils/deadlineAlerts');
    checkAndNotifyDeadlineAlerts().catch(() => {});
  } catch (_) { /* optional */ }

  res.status(201).json(sanitizeSaleForRole(newSale, req.user.role));
});

router.put('/:id', requireRoles(...moneyRoles), (req, res) => {
  const sale = sales.find((s) => String(s._id) === String(req.params.id));
  if (!sale) {
    return res.status(404).json({ message: 'Sale not found' });
  }

  if (req.body.collectRest) {
    sale.restPaid = true;
    sale.restPayment = 0;
    sale.paymentStatus = 'fully_paid';
    if (sale.status !== 'completed') sale.status = 'delivered';
    persistSales();
    return res.json(sale);
  }

  if (req.body.firstPayment != null || req.body.totalAmount != null) {
    const { total, first, rest } = splitPayment(
      req.body.totalAmount ?? sale.totalAmount,
      req.body.firstPayment ?? sale.firstPayment
    );
    sale.totalAmount = total;
    sale.firstPayment = first;
    sale.restPayment = rest;
    sale.restPaid = rest === 0;
    sale.paymentStatus = rest === 0 ? 'fully_paid' : 'first_paid';
  }

  if (req.body.deadline) sale.deadline = req.body.deadline;
  if (req.body.status) sale.status = req.body.status;
  persistSales();
  res.json(canSeeMoney(req.user.role) ? sale : sanitizeSaleForRole(sale, req.user.role));
});

module.exports = router;
