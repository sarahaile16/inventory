// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { products, sales } = require('../data/store');

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

const productSalesForPeriod = (period) => {
  const totals = new Map();

  sales.filter((sale) => matchesPeriod(sale.date, period)).forEach((sale) => {
    (sale.items || []).forEach((item) => {
      const key = item.name || 'Unknown';
      const current = totals.get(key) || { name: key, quantity: 0, amount: 0 };
      current.quantity += Number(item.qty || item.quantity || 0);
      current.amount += Number(item.amount || (item.price || 0) * (item.qty || item.quantity || 0));
      totals.set(key, current);
    });
  });

  return [...totals.values()].sort((a, b) => b.amount - a.amount);
};

router.get('/report', (req, res) => {
  const salesPeriod = req.query.salesPeriod || 'daily';
  const productPeriod = req.query.productPeriod || 'monthly';

  const salesAmount = sales
    .filter((sale) => matchesPeriod(sale.date, salesPeriod))
    .reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

  const inventoryAsset = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0),
    0
  );
  const storeAsset = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.storeStock || 0),
    0
  );

  res.json({
    salesAmount,
    salesLabel: periodLabel(salesPeriod),
    inventoryAsset,
    storeAsset,
    assetLabel: periodLabel('daily'),
    productSales: productSalesForPeriod(productPeriod),
    productSalesLabel: periodLabel(productPeriod)
  });
});

// Dashboard Overview
router.get('/dashboard', analyticsController.getDashboardOverview);

// Sales Analytics
router.get('/sales', analyticsController.getSalesAnalytics);

// Product Analytics
router.get('/products', analyticsController.getProductAnalytics);

// Customer Analytics
router.get('/customers', analyticsController.getCustomerAnalytics);

// Financial Reports
router.get('/financial', analyticsController.getFinancialReports);

// Trend Analysis
router.get('/trends', analyticsController.getTrendAnalysis);

module.exports = router; 
