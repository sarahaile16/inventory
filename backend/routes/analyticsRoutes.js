// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { products, sales, movements } = require('../data/store');
const { requireAuth, requireRoles, ROLES, canSeeMoney } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireRoles(ROLES.ADMIN, ROLES.MANAGEMENT));

const parseLocalDate = (dateStr) => {
  const [year, month, day] = String(dateStr).slice(0, 10).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const matchesPeriod = (dateStr, period) => {
  const date = parseLocalDate(dateStr);
  const now = new Date();
  if (Number.isNaN(date.getTime())) return false;

  if (period === 'daily') {
    return date.toDateString() === now.toDateString();
  }
  if (period === 'monthly') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  return date.getFullYear() === now.getFullYear();
};

const periodLabel = (period) => {
  const now = new Date();
  if (period === 'daily') {
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (period === 'monthly') {
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  return String(now.getFullYear());
};

const productActivityForPeriod = (period) => {
  const totals = new Map();

  sales.filter((sale) => matchesPeriod(sale.date, period)).forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const key = item.name || 'Unknown';
      const current = totals.get(key) || { name: key, quantity: 0, amount: 0, orders: 0 };
      const qty = Number(item.qty || item.quantity || 0);
      current.quantity += qty;
      current.amount += Number(item.amount || (item.price || 0) * qty);
      current.orders += 1;
      totals.set(key, current);
    });
  });

  return [...totals.values()].sort((a, b) => b.quantity - a.quantity || b.amount - a.amount);
};

router.get('/report', (req, res) => {
  const salesPeriod = req.query.salesPeriod || 'daily';
  const productPeriod = req.query.productPeriod || 'monthly';
  const showMoney = canSeeMoney(req.user?.role);
  const isManager = String(req.user?.role || '').toLowerCase() === ROLES.MANAGEMENT;

  const periodSales = sales.filter((sale) => matchesPeriod(sale.date, salesPeriod));
  const productPeriodSales = sales.filter((sale) => matchesPeriod(sale.date, productPeriod));

  const salesAmount = periodSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const ordersTaken = periodSales.length;
  const unitsSold = periodSales.reduce(
    (sum, sale) =>
      sum +
      (sale.items || []).reduce((q, item) => q + Number(item.qty || item.quantity || 0), 0),
    0
  );

  const periodMovements = (movements || []).filter((m) =>
    matchesPeriod(m.date || m.createdAt, salesPeriod)
  );
  const stockTransfers = periodMovements.filter(
    (m) => m.action === 'transfer' || m.type === 'transfer' || m.direction === 'to-store'
  ).length;
  const stockReceived = periodMovements.filter(
    (m) => m.action === 'receive' || m.type === 'receive'
  ).length;

  const warehouseUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const storeUnits = products.reduce((sum, p) => sum + Number(p.storeStock || 0), 0);
  const lowStockItems = products.filter(
    (p) => Number(p.stock || 0) + Number(p.storeStock || 0) <= Number(p.restockLevel || 0)
  ).length;

  const inventoryAsset = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
    0
  );
  const storeAsset = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.storeStock || 0),
    0
  );

  const productSales = productActivityForPeriod(productPeriod).map((row) => {
    if (showMoney && !isManager) return row;
    // Managers: quantity-focused, no money
    return {
      name: row.name,
      quantity: row.quantity,
      orders: row.orders
    };
  });

  const payload = {
    mode: isManager ? 'activity' : 'financial',
    salesLabel: periodLabel(salesPeriod),
    productSalesLabel: periodLabel(productPeriod),
    assetLabel: periodLabel('daily'),
    // Work activity (orders & selling) — day / month / year
    ordersTaken,
    unitsSold,
    productPeriodOrders: productPeriodSales.length,
    productPeriodUnits: productPeriodSales.reduce(
      (sum, sale) =>
        sum +
        (sale.items || []).reduce((q, item) => q + Number(item.qty || item.quantity || 0), 0),
      0
    ),
    // Inventory-related indicators
    warehouseUnits,
    storeUnits,
    lowStockItems,
    stockTransfers,
    stockReceived,
    productSales
  };

  if (showMoney && !isManager) {
    payload.salesAmount = salesAmount;
    payload.inventoryAsset = inventoryAsset;
    payload.storeAsset = storeAsset;
  }

  res.json(payload);
});

router.get('/dashboard', analyticsController.getDashboardOverview);
router.get('/sales', analyticsController.getSalesAnalytics);
router.get('/products', analyticsController.getProductAnalytics);
router.get('/customers', analyticsController.getCustomerAnalytics);
router.get('/financial', analyticsController.getFinancialReports);
router.get('/trends', analyticsController.getTrendAnalysis);

module.exports = router;
