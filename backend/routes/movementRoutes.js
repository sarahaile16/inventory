const express = require('express');
const router = express.Router();
const { products, movements, persistProducts, persistMovements } = require('../data/store');
const { requireAuth, requireRoles, ROLES } = require('../middleware/auth');

const pad = (n) => String(n).padStart(2, '0');

const localIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const findProduct = (productId) =>
  products.find(
    (item) => String(item._id) === String(productId) || String(item.productId) === String(productId)
  );

const nextMovementId = () =>
  (movements.length > 0 ? Math.max(...movements.map((item) => Number(item._id) || 0)) + 1 : 1);

const stockRoles = [ROLES.ADMIN, ROLES.MANAGEMENT];

router.use(requireAuth);

const recordMovement = ({
  product,
  type,
  direction,
  from,
  to,
  quantity,
  note,
  user
}) => {
  const now = new Date();
  const movement = {
    _id: nextMovementId(),
    date: localIso(now),
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
    productId: product._id,
    sku: product.productId,
    productName: product.name,
    type,
    direction,
    from,
    to,
    quantity,
    note: note || '',
    user: user || 'admin'
  };
  movements.unshift(movement);
  persistMovements();
  return movement;
};

router.get('/', requireRoles(...stockRoles), (req, res) => {
  const type = req.query.type;
  const list = [...movements].sort((a, b) => {
    const dateCompare = String(b.date).localeCompare(String(a.date));
    if (dateCompare !== 0) return dateCompare;
    return String(b.time || '').localeCompare(String(a.time || ''));
  });

  res.json(type && type !== 'all' ? list.filter((item) => item.type === type) : list);
});

/**
 * Writable stock actions:
 * - transfer: warehouse ↔ store (finished goods)
 * - receive / buy: add units into warehouse (purchase / delivery)  → stock ↑
 * - use: consume raw materials from warehouse for production       → stock ↓
 * - adjust: remove units (damage, loss, write-off)
 * - return: move from store back to warehouse
 */
router.post('/', requireRoles(...stockRoles), (req, res) => {
  const {
    productId,
    quantity,
    direction,
    note,
    action = 'transfer',
    location = 'warehouse'
  } = req.body;
  const qty = parseInt(quantity, 10);

  if (!productId || !Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Product and a valid quantity are required' });
  }

  const product = findProduct(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  product.storeStock = Number(product.storeStock || 0);
  product.stock = Number(product.stock || 0);

  let movement;
  const normalizedAction = action === 'buy' ? 'receive' : action;

  if (normalizedAction === 'receive') {
    product.stock += qty;
    movement = recordMovement({
      product,
      type: 'receive',
      direction: 'in',
      from: 'Supplier / Purchase',
      to: 'Warehouse',
      quantity: qty,
      note: note || (product.itemType === 'raw' ? 'Raw material purchase' : 'Stock purchase / delivery'),
      user: req.body.user
    });
  } else if (normalizedAction === 'use') {
    if (product.stock < qty) {
      return res.status(400).json({
        message: `Only ${product.stock} ${product.unit || 'units'} available in warehouse to use`
      });
    }
    product.stock -= qty;
    movement = recordMovement({
      product,
      type: 'use',
      direction: 'out',
      from: 'Warehouse',
      to: 'Used in production',
      quantity: qty,
      note: note || 'Raw material used',
      user: req.body.user
    });
  } else if (normalizedAction === 'adjust') {
    const fromWarehouse = location !== 'store';
    if (fromWarehouse) {
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} units available in warehouse` });
      }
      product.stock -= qty;
      movement = recordMovement({
        product,
        type: 'adjust',
        direction: 'out',
        from: 'Warehouse',
        to: 'Write-off',
        quantity: qty,
        note: note || 'Stock adjustment',
        user: req.body.user
      });
    } else {
      if (product.storeStock < qty) {
        return res.status(400).json({ message: `Only ${product.storeStock} units available in store` });
      }
      product.storeStock -= qty;
      movement = recordMovement({
        product,
        type: 'adjust',
        direction: 'out',
        from: 'Store',
        to: 'Write-off',
        quantity: qty,
        note: note || 'Stock adjustment',
        user: req.body.user
      });
    }
  } else {
    // transfer or return
    const dir = normalizedAction === 'return' ? 'to-warehouse' : direction;
    if (!['to-store', 'to-warehouse'].includes(dir)) {
      return res.status(400).json({ message: 'Direction must be to-store or to-warehouse' });
    }

    if (dir === 'to-store') {
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} units available in warehouse` });
      }
      product.stock -= qty;
      product.storeStock += qty;
    } else {
      if (product.storeStock < qty) {
        return res.status(400).json({ message: `Only ${product.storeStock} units available in store` });
      }
      product.storeStock -= qty;
      product.stock += qty;
    }

    movement = recordMovement({
      product,
      type: normalizedAction === 'return' ? 'return' : 'transfer',
      direction: dir,
      from: dir === 'to-store' ? 'Warehouse' : 'Store',
      to: dir === 'to-store' ? 'Store' : 'Warehouse',
      quantity: qty,
      note,
      user: req.body.user
    });
  }

  persistProducts();
  res.status(201).json({ movement, product });
});

// Undo a movement and reverse stock (manageable corrections)
router.delete('/:id', requireRoles(...stockRoles), (req, res) => {
  const index = movements.findIndex((item) => String(item._id) === String(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Movement not found' });
  }

  const movement = movements[index];
  const product = findProduct(movement.productId);
  if (!product) {
    return res.status(404).json({ message: 'Linked product not found — cannot undo safely' });
  }

  product.storeStock = Number(product.storeStock || 0);
  product.stock = Number(product.stock || 0);
  const qty = Number(movement.quantity || 0);

  try {
    if (movement.type === 'receive') {
      if (product.stock < qty) {
        return res.status(400).json({ message: 'Cannot undo: warehouse stock was already used' });
      }
      product.stock -= qty;
    } else if (movement.type === 'use' || movement.type === 'adjust') {
      if (movement.from === 'Store') product.storeStock += qty;
      else product.stock += qty;
    } else if (movement.direction === 'to-store') {
      if (product.storeStock < qty) {
        return res.status(400).json({ message: 'Cannot undo: store stock was already sold/moved' });
      }
      product.storeStock -= qty;
      product.stock += qty;
    } else if (movement.direction === 'to-warehouse') {
      if (product.stock < qty) {
        return res.status(400).json({ message: 'Cannot undo: warehouse stock was already moved' });
      }
      product.stock -= qty;
      product.storeStock += qty;
    } else {
      return res.status(400).json({ message: 'This movement type cannot be undone automatically' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Undo failed' });
  }

  movements.splice(index, 1);
  persistProducts();
  persistMovements();
  res.json({ message: 'Movement undone', product });
});

module.exports = router;
