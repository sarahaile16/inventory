const express = require('express');
const router = express.Router();
const { products, purchases, persistProducts, persistPurchases } = require('../data/store');
const { requireAuth, requireRoles, ROLES, canSeeMoney } = require('../middleware/auth');

const deskRoles = [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF];
const stockRoles = [ROLES.ADMIN, ROLES.MANAGEMENT];

const findIndexById = (id) => products.findIndex((p) => String(p._id) === String(id));

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const nextNumericId = () => (
  products.length > 0 ? Math.max(...products.map((p) => Number(p._id) || 0)) + 1 : 1
);

const sanitizeProduct = (product, role) => {
  if (!product) return product;
  if (canSeeMoney(role)) return product;
  const { purchaseCost, totalPurchase, supplier, ...safe } = product;
  return { ...safe, purchaseCost: null, totalPurchase: null, supplier: '', _redacted: true };
};

router.use(requireAuth);

router.get('/', requireRoles(...deskRoles), (req, res) => {
  res.json(products.map((p) => sanitizeProduct(p, req.user.role)));
});

router.get('/meta/purchases', requireRoles(...stockRoles), (req, res) => {
  const total = purchases.reduce((sum, item) => sum + Number(item.totalPurchase || 0), 0);
  res.json({ purchases, total });
});

router.get('/:id', requireRoles(...deskRoles), (req, res) => {
  const product = products.find((p) => String(p._id) === String(req.params.id));
  if (product) {
    res.json(sanitizeProduct(product, req.user.role));
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

router.post('/', requireRoles(...stockRoles), (req, res) => {
  const id = nextNumericId();
  const itemType = req.body.itemType === 'raw' ? 'raw' : 'finished';
  const stockQty = toNumber(req.body.stock);
  const newProduct = {
    _id: id,
    productId: req.body.productId || String(10000 + id),
    name: req.body.name,
    category: req.body.category,
    itemType,
    price: toNumber(req.body.price),
    purchaseCost: toNumber(req.body.purchaseCost),
    totalPurchase: toNumber(req.body.totalPurchase, toNumber(req.body.purchaseCost) * stockQty),
    supplier: req.body.supplier || '',
    stock: stockQty, // warehouse qty
    restockLevel: toNumber(req.body.restockLevel),
    // Raw materials stay in warehouse only (no store shelf)
    storeStock: itemType === 'raw' ? 0 : toNumber(req.body.storeStock),
    unit: req.body.unit || 'PCS',
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
  if (stockQty > 0) {
    purchases.push({
      _id: purchases.length > 0 ? Math.max(...purchases.map((p) => Number(p._id) || 0)) + 1 : 1,
      productId: newProduct._id,
      productName: newProduct.name,
      quantity: stockQty,
      purchaseCost: newProduct.purchaseCost,
      totalPurchase: newProduct.totalPurchase,
      supplier: newProduct.supplier || 'New product buy',
      itemType,
      date: new Date().toISOString().slice(0, 10)
    });
    persistPurchases();
  }
  persistProducts();
  res.status(201).json(newProduct);
});

router.put('/:id', requireRoles(...stockRoles), (req, res) => {
  const index = findIndexById(req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const current = products[index];
  const nextType =
    req.body.itemType === 'raw' ? 'raw' : req.body.itemType === 'finished' ? 'finished' : current.itemType;
  products[index] = {
    ...current,
    ...req.body,
    _id: current._id,
    itemType: nextType,
    price: req.body.price !== undefined ? toNumber(req.body.price, current.price) : current.price,
    stock: req.body.stock !== undefined ? toNumber(req.body.stock, current.stock) : current.stock,
    restockLevel: req.body.restockLevel !== undefined
      ? toNumber(req.body.restockLevel, current.restockLevel)
      : current.restockLevel,
    storeStock:
      nextType === 'raw'
        ? 0
        : req.body.storeStock !== undefined
          ? toNumber(req.body.storeStock, current.storeStock)
          : current.storeStock
  };
  persistProducts();
  res.json(products[index]);
});

router.delete('/:id', requireRoles(ROLES.ADMIN), (req, res) => {
  const index = findIndexById(req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const deleted = products[index];
  products.splice(index, 1);
  persistProducts();
  res.json({ message: 'Product deleted', product: deleted });
});

module.exports = router;
