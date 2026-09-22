const path = require('path');
const fs = require('fs');

// On Vercel the filesystem is read-only except /tmp — keep runtime data there.
const DATA_DIR =
  process.env.VERCEL || process.env.DATA_DIR
    ? path.join(process.env.TMPDIR || '/tmp', 'furnistock-data')
    : __dirname;

try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (_) {
  /* ignore */
}

const pad = (n) => String(n).padStart(2, '0');

const localIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const daysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return localIso(date);
};

const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const SALES_FILE = path.join(DATA_DIR, 'sales.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const MOVEMENTS_FILE = path.join(DATA_DIR, 'movements.json');
const PURCHASES_FILE = path.join(DATA_DIR, 'purchases.json');

const bundledDir = __dirname;

const readJsonArray = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Could not read ${path.basename(filePath)}:`, error.message);
    return [];
  }
};

/** Prefer /tmp copy; seed from bundled JSON once if empty. */
const loadOrSeed = (runtimeFile, bundledName) => {
  let data = readJsonArray(runtimeFile);
  if (data.length === 0) {
    const bundled = path.join(bundledDir, bundledName);
    data = readJsonArray(bundled);
    if (data.length > 0) {
      try {
        fs.writeFileSync(runtimeFile, JSON.stringify(data, null, 2), 'utf8');
      } catch (_) {
        /* ignore */
      }
    }
  }
  return data;
};

const writeJsonArray = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.warn(`Could not write ${path.basename(filePath)}:`, error.message);
  }
};

const customers = loadOrSeed(CUSTOMERS_FILE, 'customers.json');
const sales = loadOrSeed(SALES_FILE, 'sales.json');
const products = loadOrSeed(PRODUCTS_FILE, 'products.json');
const movements = loadOrSeed(MOVEMENTS_FILE, 'movements.json');
const purchases = loadOrSeed(PURCHASES_FILE, 'purchases.json');

customers.forEach((customer) => {
  if (!Array.isArray(customer.documents)) customer.documents = [];
  if (!Array.isArray(customer.purchaseHistory)) customer.purchaseHistory = [];
  if (!Array.isArray(customer.orders)) customer.orders = [];
  if (customer.paymentPhoto === undefined) customer.paymentPhoto = '';
  if (customer.orderPhoto === undefined) customer.orderPhoto = '';
  if (customer._id != null) customer._id = Number(customer._id);
});

sales.forEach((sale) => {
  if (sale._id != null) sale._id = Number(sale._id);
  if (sale.customerId != null && sale.customerId !== '') {
    sale.customerId = Number(sale.customerId);
  }
});

products.forEach((product) => {
  if (product._id != null) product._id = Number(product._id);
  product.stock = Number(product.stock || 0);
  product.storeStock = Number(product.storeStock || 0);
  product.itemType = product.itemType === 'raw' ? 'raw' : 'finished';
  if (product.itemType === 'raw') product.storeStock = 0;
});

movements.forEach((m) => {
  if (m._id != null) m._id = Number(m._id);
  if (m.productId != null) m.productId = Number(m.productId);
});

const persistCustomers = () => writeJsonArray(CUSTOMERS_FILE, customers);
const persistSales = () => writeJsonArray(SALES_FILE, sales);
const persistProducts = () => writeJsonArray(PRODUCTS_FILE, products);
const persistMovements = () => writeJsonArray(MOVEMENTS_FILE, movements);
const persistPurchases = () => writeJsonArray(PURCHASES_FILE, purchases);

const findCustomerById = (id) => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return undefined;
  return customers.find((c) => Number(c._id) === numericId);
};

const findCustomerIndexById = (id) => {
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return -1;
  return customers.findIndex((c) => Number(c._id) === numericId);
};

module.exports = {
  products,
  sales,
  movements,
  purchases,
  customers,
  daysAgo,
  localIso,
  persistCustomers,
  persistSales,
  persistProducts,
  persistMovements,
  persistPurchases,
  findCustomerById,
  findCustomerIndexById
};
