const validateProduct = (req, res, next) => {
  const { name, price, stock, category } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Product name is required');
  }

  if (!price || isNaN(price) || price <= 0) {
    errors.push('Valid price is required');
  }

  if (!stock || isNaN(stock) || stock < 0) {
    errors.push('Valid stock amount is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push('Name is required');
  }

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { validateProduct, validateUser };