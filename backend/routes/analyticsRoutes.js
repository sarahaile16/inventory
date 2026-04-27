// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

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
