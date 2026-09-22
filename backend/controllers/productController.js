let products = [];

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => {
  res.json(products);
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = (req, res) => {
  const product = products.find(p => p._id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = (req, res) => {
  console.log('📦 Creating product:', req.body);

  const nextId = products.length > 0 ? Math.max(...products.map(p => p._id)) + 1 : 1;

  const newProduct = {
    _id: nextId,
    productId: req.body.productId || String(10000 + nextId),
    name: req.body.name,
    category: req.body.category,
    price: parseFloat(req.body.price) || 0,
    stock: parseInt(req.body.stock) || 0,
    restockLevel: parseInt(req.body.restockLevel) || 0,
    unit: req.body.unit || 'KIT',
    location: req.body.location || 'Addis Abeba, Gerji - Main Showroom',
    batchNumber: req.body.batchNumber || '',
    itemId: req.body.itemId || '',
    serialNumber: req.body.serialNumber || '',
    expiryDate: req.body.expiryDate || '',
    partNumber: req.body.partNumber || '',
    image: req.file ? `/uploads/${req.file.filename}` : null,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);

  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...req.body,
      _id: id,
      price: parseFloat(req.body.price) || products[index].price,
      stock: parseInt(req.body.stock) || products[index].stock,
      image: req.file ? `/uploads/${req.file.filename}` : products[index].image
    };
    res.json(products[index]);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p._id === id);

  if (index !== -1) {
    const deleted = products[index];
    products.splice(index, 1);
    res.json({ message: 'Product deleted', product: deleted });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Public
const getLowStockProducts = (req, res) => {
  const lowStock = products.filter(p => p.stock <= p.restockLevel);
  res.json(lowStock);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
};