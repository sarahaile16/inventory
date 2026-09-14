const express = require('express');
const router = express.Router();
const { products, purchases } = require('../data/store');

const findIndexById = (id) => products.findIndex((p) => String(p._id) === String(id));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nextNumericId = () => (
  products.length > 0 ? Math.max(...products.map((p) => Number(p._id) || 0)) + 1 : 1
);

router.get('/', (req, res) => {
  res.json(products);
});

router.get('/meta/purchases', (req, res) => {
  const total = purchases.reduce((sum, item) => sum + Number(item.totalPurchase || 0), 0);
  res.json({ purchases, total });
});

router.get('/:id', (req, res) => {
  const product = products.find((p) => String(p._id) === String(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

router.post('/', (req, res) => {
  const id = nextNumericId();
  const newProduct = {
    _id: id,
    productId: req.body.productId || String(10000 + id),
    name: req.body.name,
    category: req.body.category,
    price: toNumber(req.body.price),
    purchaseCost: toNumber(req.body.purchaseCost),
    totalPurchase: toNumber(req.body.totalPurchase, toNumber(req.body.purchaseCost) * toNumber(req.body.stock)),
    supplier: req.body.supplier || '',
    stock: toNumber(req.body.stock),
    restockLevel: toNumber(req.body.restockLevel),
    storeStock: toNumber(req.body.storeStock),
    unit: req.body.unit || 'KIT',
    location: req.body.location || 'Addis Abeba, Gerji - Main Showroom',
    batchNumber: req.body.batchNumber || '',
    itemId: req.body.itemId || '',
    serialNumber: req.body.serialNumber || '',
    expiryDate: req.body.expiryDate || '',
    partNumber: req.body.partNumber || '',
    image: req.body.image || null,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  purchases.push({
    _id: purchases.length > 0 ? Math.max(...purchases.map((p) => Number(p._id) || 0)) + 1 : 1,
    productId: newProduct._id,
    productName: newProduct.name,
    quantity: newProduct.stock,
    purchaseCost: newProduct.purchaseCost,
    totalPurchase: newProduct.totalPurchase,
    supplier: newProduct.supplier || 'New product buy',
    date: new Date().toISOString().slice(0, 10)
  });
  res.status(201).json(newProduct);
});

router.put('/:id', (req, res) => {
  const index = findIndexById(req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const current = products[index];
  products[index] = {
    ...current,
    ...req.body,
    _id: current._id,
    price: req.body.price !== undefined ? toNumber(req.body.price, current.price) : current.price,
    stock: req.body.stock !== undefined ? toNumber(req.body.stock, current.stock) : current.stock,
    restockLevel: req.body.restockLevel !== undefined
      ? toNumber(req.body.restockLevel, current.restockLevel)
      : current.restockLevel
  };
  res.json(products[index]);
});

router.delete('/:id', (req, res) => {
  const index = findIndexById(req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const deleted = products[index];
  products.splice(index, 1);
  res.json({ message: 'Product deleted', product: deleted });
});

module.exports = router;
