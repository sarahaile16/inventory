const express = require('express');
const router = express.Router();

// In-memory storage
let products = [
  {
    _id: 1,
    productId: '10019',
    name: 'GODMIDDAG (18 Piece)',
    category: 'Dinnerware',
    price: 3900,
    stock: 15,
    restockLevel: 3,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 2,
    productId: '10018',
    name: 'GLADELIG (18 Piece Dinner Wareset)',
    category: 'Dinnerware',
    price: 9800,
    stock: 70,
    restockLevel: 5,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  }
];

// Get all products
router.get('/', (req, res) => {
  res.json(products);
});

// Get single product
router.get('/:id', (req, res) => {
  const product = products.find(p => p._id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Create product
router.post('/', (req, res) => {
  const newProduct = {
    _id: products.length + 1,
    productId: String(10000 + products.length + 1),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Update product
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);
  
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, _id: id };
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Delete product
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);
  
  if (index !== -1) {
    products.splice(index, 1);
    res.json({ message: 'Product deleted' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports = router;