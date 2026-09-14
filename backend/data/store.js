const pad = (n) => String(n).padStart(2, '0');

const localIso = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const daysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return localIso(date);
};

const products = [
  {
    _id: 1,
    productId: '10019',
    name: 'GODMIDDAG (18 Piece)',
    category: 'Dinnerware',
    price: 3900,
    stock: 400,
    storeStock: 80,
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
    stock: 300,
    storeStock: 45,
    restockLevel: 5,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 3,
    productId: '10022',
    name: 'Main Plate (18 Pieces)',
    category: 'Plates',
    price: 2500,
    stock: 220,
    storeStock: 50,
    restockLevel: 15,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 4,
    productId: '10017',
    name: 'FÄRGKLAR (18 Piece Dinnerware)',
    category: 'Dinnerware',
    price: 2900,
    stock: 400,
    storeStock: 100,
    restockLevel: 15,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 5,
    productId: '10016',
    name: 'VARDAGEN',
    category: 'Bowls',
    price: 3500,
    stock: 250,
    storeStock: 80,
    restockLevel: 20,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 6,
    productId: '10015',
    name: 'MOSSMAL (Bowl)',
    category: 'Bowls',
    price: 2000,
    stock: 100,
    storeStock: 30,
    restockLevel: 5,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  },
  {
    _id: 7,
    productId: '10014',
    name: 'VÄRDERA (6 pieces)',
    category: 'Plates',
    price: 1500,
    stock: 180,
    storeStock: 60,
    restockLevel: 5,
    unit: 'KIT',
    location: 'Addis Abeba, Gerji - Main Showroom',
    image: null,
    createdAt: new Date().toISOString()
  }
];

products.forEach((product) => {
  product.purchaseCost = product.purchaseCost ?? Math.round(Number(product.price || 0) * 0.55);
  product.totalPurchase = product.totalPurchase ?? product.purchaseCost * Number(product.stock || 0);
  product.supplier = product.supplier || '';
});

const purchases = products.map((product, index) => ({
  _id: index + 1,
  productId: product._id,
  productName: product.name,
  quantity: Number(product.stock || 0),
  purchaseCost: product.purchaseCost,
  totalPurchase: product.totalPurchase,
  supplier: product.supplier || 'Opening stock',
  date: daysAgo(20 - index)
}));

const sales = [
  {
    _id: 1,
    transactionId: 'FS-1003484885885',
    customerName: 'Dagmawi Tsegaye',
    paymentMethod: 'Bank Transfer',
    date: daysAgo(0),
    deadline: daysAgo(-3),
    status: 'processing',
    totalAmount: 187500,
    firstPayment: 80000,
    restPayment: 107500,
    restPaid: false,
    paymentStatus: 'first_paid',
    items: [
      { name: 'Main Plate (18 Pieces)', qty: 21, price: 2500, amount: 52500 },
      { name: 'GODMIDDAG (18 Piece)', qty: 10, price: 3900, amount: 39000 },
      { name: 'GLADELIG (18 Piece Dinner Wareset)', qty: 8, price: 9800, amount: 78400 },
      { name: 'FÄRGKLAR (18 Piece Dinnerware)', qty: 6, price: 2900, amount: 17400 },
      { name: 'MOSSMAL (Bowl)', qty: 1, price: 2000, amount: 200 }
    ]
  },
  {
    _id: 2,
    transactionId: 'FS-1003484885901',
    customerName: 'Benyam Assegdw',
    paymentMethod: 'Cash',
    date: daysAgo(4),
    deadline: daysAgo(-1),
    status: 'pending',
    totalAmount: 156800,
    firstPayment: 60000,
    restPayment: 96800,
    restPaid: false,
    paymentStatus: 'first_paid',
    items: [
      { name: 'GLADELIG (18 Piece Dinner Wareset)', qty: 8, price: 9800, amount: 78400 },
      { name: 'VARDAGEN', qty: 12, price: 3500, amount: 42000 },
      { name: 'VÄRDERA (6 pieces)', qty: 24, price: 1500, amount: 36000 },
      { name: 'MOSSMAL (Bowl)', qty: 2, price: 2000, amount: 400 }
    ]
  },
  {
    _id: 3,
    transactionId: 'FS-1003484885918',
    customerName: 'Abebe Kebede',
    paymentMethod: 'Mobile Money',
    date: daysAgo(12),
    deadline: daysAgo(2),
    status: 'processing',
    totalAmount: 94500,
    firstPayment: 40000,
    restPayment: 54500,
    restPaid: false,
    paymentStatus: 'first_paid',
    items: [
      { name: 'Main Plate (18 Pieces)', qty: 18, price: 2500, amount: 45000 },
      { name: 'GODMIDDAG (18 Piece)', qty: 10, price: 3900, amount: 39000 },
      { name: 'FÄRGKLAR (18 Piece Dinnerware)', qty: 3, price: 2900, amount: 8700 },
      { name: 'MOSSMAL (Bowl)', qty: 9, price: 2000, amount: 1800 }
    ]
  },
  {
    _id: 4,
    transactionId: 'FS-1003484885999',
    customerName: 'Almaz Worku',
    paymentMethod: 'Bank Transfer',
    date: daysAgo(80),
    deadline: daysAgo(-10),
    status: 'completed',
    totalAmount: 254800,
    firstPayment: 254800,
    restPayment: 0,
    restPaid: true,
    paymentStatus: 'fully_paid',
    items: [
      { name: 'GLADELIG (18 Piece Dinner Wareset)', qty: 20, price: 9800, amount: 196000 },
      { name: 'VARDAGEN', qty: 12, price: 3500, amount: 42000 },
      { name: 'VÄRDERA (6 pieces)', qty: 12, price: 1500, amount: 18000 }
    ]
  }
];

const movements = [
  {
    _id: 1,
    date: daysAgo(6),
    time: '09:15',
    productId: 1,
    sku: '10019',
    productName: 'GODMIDDAG (18 Piece)',
    type: 'transfer',
    direction: 'to-store',
    from: 'Warehouse',
    to: 'Store',
    quantity: 40,
    note: 'Restock Gerji showroom',
    user: 'admin'
  },
  {
    _id: 2,
    date: daysAgo(5),
    time: '11:40',
    productId: 2,
    sku: '10018',
    productName: 'GLADELIG (18 Piece Dinner Wareset)',
    type: 'transfer',
    direction: 'to-store',
    from: 'Warehouse',
    to: 'Store',
    quantity: 20,
    note: 'Weekend display stock',
    user: 'admin'
  },
  {
    _id: 3,
    date: daysAgo(4),
    time: '14:05',
    productId: 2,
    sku: '10018',
    productName: 'GLADELIG (18 Piece Dinner Wareset)',
    type: 'sale',
    direction: 'out',
    from: 'Store',
    to: 'Customer',
    quantity: 8,
    note: 'FS-1003484885901',
    user: 'admin'
  },
  {
    _id: 4,
    date: daysAgo(3),
    time: '10:20',
    productId: 5,
    sku: '10016',
    productName: 'VARDAGEN',
    type: 'transfer',
    direction: 'to-store',
    from: 'Warehouse',
    to: 'Store',
    quantity: 25,
    note: 'Bowl restock',
    user: 'sari'
  },
  {
    _id: 5,
    date: daysAgo(2),
    time: '16:30',
    productId: 3,
    sku: '10022',
    productName: 'Main Plate (18 Pieces)',
    type: 'return',
    direction: 'to-warehouse',
    from: 'Store',
    to: 'Warehouse',
    quantity: 5,
    note: 'Damaged box returned from floor',
    user: 'admin'
  },
  {
    _id: 6,
    date: daysAgo(0),
    time: '08:50',
    productId: 3,
    sku: '10022',
    productName: 'Main Plate (18 Pieces)',
    type: 'sale',
    direction: 'out',
    from: 'Store',
    to: 'Customer',
    quantity: 21,
    note: 'FS-1003484885885',
    user: 'admin'
  },
  {
    _id: 7,
    date: daysAgo(0),
    time: '08:50',
    productId: 1,
    sku: '10019',
    productName: 'GODMIDDAG (18 Piece)',
    type: 'sale',
    direction: 'out',
    from: 'Store',
    to: 'Customer',
    quantity: 10,
    note: 'FS-1003484885885',
    user: 'admin'
  }
];

module.exports = { products, sales, movements, purchases };
