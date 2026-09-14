const express = require('express');
const router = express.Router();
const { sales, products } = require('../data/store');

const daysUntil = (deadline) => {
  if (!deadline) return null;
  const due = new Date(deadline);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

router.get('/', (req, res) => {
  const role = String(req.query.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'management' || role === 'manager';
  const items = [];

  sales.forEach((sale) => {
    const rest = Number(sale.restPaid ? 0 : sale.restPayment || 0);
    const days = daysUntil(sale.deadline);
    if (rest <= 0 || days === null || days > 3) return;

    const when = days < 0
      ? `overdue by ${Math.abs(days)} day(s)`
      : days === 0
        ? 'due today'
        : `due in ${days} day(s)`;

    if (isAdmin) {
      items.push({
        id: `deadline-${sale._id}`,
        type: 'deadline',
        color: days < 0 ? 'red' : 'yellow',
        read: false,
        date: String(sale.deadline).slice(0, 10),
        time: days < 0 ? 'Overdue' : 'Upcoming',
        link: '/orders',
        title: 'Customer deadline',
        message: `${sale.customerName || 'Customer'} · ${sale.transactionId} is ${when}. Whole payment ETB ${formatMoney(sale.totalAmount)}. First payment ETB ${formatMoney(sale.firstPayment)}. Rest on delivery ETB ${formatMoney(rest)}.`
      });
    } else if (role === 'staff') {
      items.push({
        id: `deadline-${sale._id}`,
        type: 'deadline',
        color: days < 0 ? 'red' : 'yellow',
        read: false,
        date: String(sale.deadline).slice(0, 10),
        time: days < 0 ? 'Overdue' : 'Upcoming',
        link: '/orders',
        title: 'Customer deadline',
        message: `${sale.customerName || 'Customer'} order is ${when}. Rest payment is due on delivery.`
      });
    }
  });

  products.forEach((product) => {
    if (Number(product.stock) <= Number(product.restockLevel)) {
      items.push({
        id: `stock-${product._id}`,
        type: 'low_stock',
        color: 'red',
        read: false,
        date: new Date().toISOString().slice(0, 10),
        time: 'Now',
        link: '/inventory',
        title: 'Low stock',
        message: `${product.name} is running low on warehouse stock.`
      });
    }
  });

  res.json(items);
});

module.exports = router;
