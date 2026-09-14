const express = require('express');
const router = express.Router();
const { products, movements } = require('../data/store');

const pad = (n) => String(n).padStart(2, '0');

const localIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

router.get('/', (req, res) => {
  const type = req.query.type;
  const list = [...movements].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));
    if (dateCompare !== 0) return dateCompare;
    return String(b.time || '').localeCompare(String(a.time || ''));
  });

  res.json(type && type !== 'all' ? list.filter((item) => item.type === type) : list);
});

router.post('/', (req, res) => {
  const { productId, quantity, direction, note } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId || !Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Product and a valid quantity are required' });
  }

  if (!['to-store', 'to-warehouse'].includes(direction)) {
    return res.status(400).json({ message: 'Direction must be to-store or to-warehouse' });
  }

  const product = products.find(
    (item) => String(item._id) === String(productId) || String(item.productId) === String(productId)
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (direction === 'to-store') {
    if (Number(product.stock || 0) < qty) {
      return res.status(400).json({ message: `Only ${product.stock} units available in warehouse` });
    }
    product.stock -= qty;
    product.storeStock = Number(product.storeStock || 0) + qty;
  } else {
    if (Number(product.storeStock || 0) < qty) {
      return res.status(400).json({ message: `Only ${product.storeStock || 0} units available in store` });
    }
    product.storeStock -= qty;
    product.stock = Number(product.stock || 0) + qty;
  }

  const now = new Date();
  const movement = {
    _id: movements.length > 0 ? Math.max(...movements.map((item) => Number(item._id) || 0)) + 1 : 1,
    date: localIso(now),
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    productId: product._id,
    sku: product.productId,
    productName: product.name,
    type: 'transfer',
    direction,
    from: direction === 'to-store' ? 'Warehouse' : 'Store',
    to: direction === 'to-store' ? 'Store' : 'Warehouse',
    quantity: qty,
    note: note || '',
    user: req.body.user || 'admin'
  };

  movements.unshift(movement);
  res.status(201).json({ movement, product });
});

module.exports = router;
