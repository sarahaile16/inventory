const express = require('express');
const router = express.Router();

// In-memory storage
let sales = [
  {
    _id: 1,
    transactionId: 'FS-1003484885885',
    customerName: 'Dagmawi Tsegaye',
    totalAmount: 180090,
    paymentMethod: 'Bank Transfer',
    date: '2025-10-25'
  }
];

// Get all sales
router.get('/', (req, res) => {
  res.json(sales);
});

// Get total sales
router.get('/total', (req, res) => {
  const total = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  res.json({ total });
});

// Get single sale
router.get('/:id', (req, res) => {
  const sale = sales.find(s => s._id === parseInt(req.params.id));
  if (sale) {
    res.json(sale);
  } else {
    res.status(404).json({ message: 'Sale not found' });
  }
});

// Create sale
router.post('/', (req, res) => {
  const newSale = {
    _id: sales.length + 1,
    transactionId: 'FS-' + Date.now().toString().slice(-12),
    ...req.body,
    date: new Date().toISOString()
  };
  sales.push(newSale);
  res.status(201).json(newSale);
});

module.exports = router;