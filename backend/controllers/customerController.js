// ========== IN-MEMORY STORAGE ==========
let customers = [
  {
    _id: 1,
    fullName: 'Dagmawi Tsegaye',
    phoneNumber: '09857717299',
    organization: 'Individual',
    email: 'dagmawi.tsegaye@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 3,
    totalSpent: 117800,
    lastPurchaseDate: '2025-10-25',
    createdAt: '2025-01-15',
    notes: 'Preferred customer',
    purchaseHistory: [
      {
        _id: 'sale1',
        transactionId: 'TRX001',
        type: 'Batch',
        quantity: 10,
        amount: 92000,
        date: '10/25/2025',
        items: [
          { productId: '10019', productName: 'GODMIDDAG (18 Piece)', quantity: 10, price: 9200 }
        ]
      },
      {
        _id: 'sale2',
        transactionId: 'TRX002',
        type: 'Batch',
        quantity: 12,
        amount: 18000,
        date: '10/25/2025',
        items: [
          { productId: '10018', productName: 'GLADELIG (18 Piece Dinner Wareset)', quantity: 12, price: 1500 }
        ]
      },
      {
        _id: 'sale3',
        transactionId: 'TRX003',
        type: 'Batch',
        quantity: 2,
        amount: 7800,
        date: '10/25/2025',
        items: [
          { productId: '10015', productName: 'MOSSMAL (Bowl)', quantity: 2, price: 3900 }
        ]
      }
    ]
  },
  {
    _id: 2,
    fullName: 'Benyam Assegdw',
    phoneNumber: '0983354391',
    organization: 'ABC Company',
    email: 'benyam@tridal.org',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 3,
    totalSpent: 436500,
    lastPurchaseDate: '2025-10-24',
    createdAt: '2025-02-10',
    notes: 'Bulk purchaser',
    purchaseHistory: [
      {
        _id: 'sale4',
        transactionId: 'TRX004',
        type: 'Single',
        quantity: 970,
        amount: 145500,
        date: '10/24/2025',
        items: [
          { productId: '10022', productName: 'Roll-on Pouch', quantity: 970, price: 150 }
        ]
      },
      {
        _id: 'sale5',
        transactionId: 'TRX005',
        type: 'Single',
        quantity: 970,
        amount: 145500,
        date: '10/24/2025',
        items: [
          { productId: '10022', productName: 'Roll-on Pouch', quantity: 970, price: 150 }
        ]
      },
      {
        _id: 'sale6',
        transactionId: 'TRX006',
        type: 'Single',
        quantity: 970,
        amount: 145500,
        date: '10/24/2025',
        items: [
          { productId: '10022', productName: 'Roll-on Pouch', quantity: 970, price: 150 }
        ]
      }
    ]
  },
  {
    _id: 3,
    fullName: 'Hailom Kiros',
    phoneNumber: '0983354390',
    organization: 'Hailom Enterprises',
    email: 'hailom.k@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 1,
    totalSpent: 187500,
    lastPurchaseDate: '2025-10-26',
    createdAt: '2025-01-20',
    notes: 'New regular customer',
    purchaseHistory: [
      {
        _id: 'sale7',
        transactionId: 'TRX007',
        type: 'Batch',
        quantity: 39,
        amount: 187500,
        date: '10/26/2025',
        items: [
          { productId: '10022', productName: 'Main Plate (18 Pieces)', quantity: 39, price: 4807.69 }
        ]
      }
    ]
  },
  {
    _id: 4,
    fullName: 'Kahlid Teshome',
    phoneNumber: '0983354391',
    organization: 'XYZ Ltd',
    email: 'kahlid.t@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchaseDate: null,
    createdAt: '2025-03-05',
    notes: 'New customer',
    purchaseHistory: []
  },
  {
    _id: 5,
    fullName: 'Dagmawi Tsegaye',
    phoneNumber: '0983354377',
    organization: 'Individual',
    email: 'dagmawi.t2@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 1,
    totalSpent: 134500,
    lastPurchaseDate: '2025-10-26',
    createdAt: '2025-02-15',
    notes: '',
    purchaseHistory: [
      {
        _id: 'sale8',
        transactionId: 'TRX008',
        type: 'Batch',
        quantity: 25,
        amount: 134500,
        date: '10/26/2025',
        items: [
          { productId: '10019', productName: 'GODMIDDAG (18 Piece)', quantity: 25, price: 5380 }
        ]
      }
    ]
  },
  {
    _id: 6,
    fullName: 'Belay Teshome',
    phoneNumber: '0900000001',
    organization: 'Belay Trading',
    email: 'belay.t@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Returned',
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchaseDate: null,
    createdAt: '2025-03-10',
    notes: 'Returned customer',
    purchaseHistory: []
  },
  {
    _id: 7,
    fullName: 'Dagmawi Tsegaye',
    phoneNumber: '09438001239',
    organization: 'Dagmawi PLC',
    email: 'dagmawi.plc@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'Regular',
    status: 'Active',
    totalPurchases: 1,
    totalSpent: 187500,
    lastPurchaseDate: '2025-10-26',
    createdAt: '2025-01-05',
    notes: 'Corporate client',
    purchaseHistory: [
      {
        _id: 'sale9',
        transactionId: 'TRX009',
        type: 'Batch',
        quantity: 39,
        amount: 187500,
        date: '10/26/2025',
        items: [
          { productId: '10022', productName: 'Main Plate (18 Pieces)', quantity: 39, price: 4807.69 }
        ]
      }
    ]
  },
  {
    _id: 8,
    fullName: 'Abebe Kebede',
    phoneNumber: '0911223344',
    organization: 'Individual',
    email: 'abebe.kebede@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'New',
    status: 'Active',
    totalPurchases: 1,
    totalSpent: 11700,
    lastPurchaseDate: '2025-10-24',
    createdAt: '2025-10-24',
    notes: '',
    purchaseHistory: [
      {
        _id: 'sale10',
        transactionId: 'FS-1003484885888',
        type: 'Single',
        quantity: 3,
        amount: 11700,
        date: '10/24/2025',
        items: [
          { productId: '10016', productName: 'VARDAGEN', quantity: 3, price: 3900 }
        ]
      }
    ]
  },
  {
    _id: 9,
    fullName: 'Almaz Worku',
    phoneNumber: '0922334455',
    organization: 'Individual',
    email: 'almaz.worku@email.com',
    address: 'Addis Ababa, Ethiopia',
    customerType: 'VIP',
    status: 'Active',
    totalPurchases: 2,
    totalSpent: 48900,
    lastPurchaseDate: '2025-10-23',
    createdAt: '2025-08-05',
    notes: 'VIP customer - free delivery',
    purchaseHistory: [
      {
        _id: 'sale11',
        transactionId: 'FS-1003484885889',
        type: 'Batch',
        quantity: 5,
        amount: 45000,
        date: '10/23/2025',
        items: [
          { productId: '10017', productName: 'FÄRGKLAR (18 Piece Dinnerware)', quantity: 5, price: 9000 }
        ]
      },
      {
        _id: 'sale12',
        transactionId: 'FS-1003484885890',
        type: 'Single',
        quantity: 1,
        amount: 3900,
        date: '10/22/2025',
        items: [
          { productId: '10019', productName: 'GODMIDDAG (18 Piece)', quantity: 1, price: 3900 }
        ]
      }
    ]
  }
];

// Helper function to calculate customer stats
const calculateCustomerStats = (customer) => {
  const totalPurchases = customer.purchaseHistory.length;
  const totalSpent = customer.purchaseHistory.reduce((sum, purchase) => sum + purchase.amount, 0);
  const lastPurchaseDate = totalPurchases > 0 
    ? customer.purchaseHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date 
    : null;

  return {
    ...customer,
    totalPurchases,
    totalSpent,
    lastPurchaseDate
  };
};

// ========== CUSTOMER CRUD OPERATIONS ==========

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getAllCustomers = (req, res) => {
  // Support filtering and search
  const { search, type, status } = req.query;
  
  let filteredCustomers = [...customers];

  // Search by name, phone, or email
  if (search) {
    filteredCustomers = filteredCustomers.filter(customer =>
      customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.phoneNumber.includes(search) ||
      (customer.organization && customer.organization.toLowerCase().includes(search.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // Filter by customer type
  if (type) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.customerType === type
    );
  }

  // Filter by status
  if (status) {
    filteredCustomers = filteredCustomers.filter(customer => 
      customer.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Map to the format shown in your screenshot
  const formattedCustomers = filteredCustomers.map(customer => ({
    _id: customer._id,
    fullName: customer.fullName,
    organization: customer.organization || 'Individual',
    phoneNumber: customer.phoneNumber,
    status: customer.status,
    totalPurchases: customer.totalPurchases,
    totalSpent: customer.totalSpent
  }));

  res.json(formattedCustomers);
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = (req, res) => {
  const id = parseInt(req.params.id);
  const customer = customers.find(c => c._id === id);

  if (customer) {
    // Format for detailed view
    const formattedCustomer = {
      _id: customer._id,
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      organization: customer.organization || 'Individual',
      email: customer.email,
      address: customer.address,
      customerType: customer.customerType,
      status: customer.status,
      totalPurchases: customer.totalPurchases,
      totalSpent: customer.totalSpent,
      lastPurchaseDate: customer.lastPurchaseDate,
      createdAt: customer.createdAt,
      notes: customer.notes,
      purchaseHistory: customer.purchaseHistory.map(purchase => ({
        _id: purchase._id,
        transactionId: purchase.transactionId,
        type: purchase.type,
        quantity: purchase.quantity,
        amount: purchase.amount,
        date: purchase.date,
        items: purchase.items
      }))
    };
    res.json(formattedCustomer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Get customer by phone number
// @route   GET /api/customers/phone/:phone
// @access  Private
const getCustomerByPhone = (req, res) => {
  const phone = req.params.phone;
  const customer = customers.find(c => c.phoneNumber === phone);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = (req, res) => {
  console.log('👤 Creating new customer:', req.body);

  const { fullName, phoneNumber, organization, email, address, customerType, notes } = req.body;

  // Validate required fields
  if (!fullName) {
    return res.status(400).json({ message: 'Customer name is required' });
  }

  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Check if customer with same phone exists
  const existingCustomer = customers.find(c => c.phoneNumber === phoneNumber);
  if (existingCustomer) {
    return res.status(400).json({ message: 'Customer with this phone number already exists' });
  }

  const nextId = customers.length > 0 ? Math.max(...customers.map(c => c._id)) + 1 : 1;

  const newCustomer = {
    _id: nextId,
    fullName,
    phoneNumber,
    organization: organization || 'Individual',
    email: email || '',
    address: address || '',
    customerType: customerType || 'Regular',
    status: 'Active',
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchaseDate: null,
    createdAt: new Date().toISOString().split('T')[0],
    notes: notes || '',
    purchaseHistory: []
  };

  customers.push(newCustomer);

  res.status(201).json({
    message: 'Customer created successfully',
    customer: newCustomer
  });
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c._id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Check phone number uniqueness if being updated
  if (req.body.phoneNumber && req.body.phoneNumber !== customers[index].phoneNumber) {
    const existingCustomer = customers.find(c => 
      c.phoneNumber === req.body.phoneNumber && c._id !== id
    );
    if (existingCustomer) {
      return res.status(400).json({ message: 'Phone number already in use' });
    }
  }

  customers[index] = {
    ...customers[index],
    ...req.body,
    _id: id
  };

  res.json({
    message: 'Customer updated successfully',
    customer: customers[index]
  });
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
const deleteCustomer = (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c._id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const deletedCustomer = customers[index];
  customers.splice(index, 1);

  res.json({
    message: 'Customer deleted successfully',
    customer: deletedCustomer
  });
};

// ========== CUSTOMER PURCHASE HISTORY ==========

// @desc    Get customer purchase history
// @route   GET /api/customers/:id/purchases
// @access  Private
const getCustomerPurchases = (req, res) => {
  const id = parseInt(req.params.id);
  const customer = customers.find(c => c._id === id);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  res.json({
    customerId: customer._id,
    customerName: customer.fullName,
    totalPurchases: customer.totalPurchases,
    totalSpent: customer.totalSpent,
    purchases: customer.purchaseHistory
  });
};

// @desc    Add purchase to customer history
// @route   POST /api/customers/:id/purchases
// @access  Private
const addCustomerPurchase = (req, res) => {
  const id = parseInt(req.params.id);
  const index = customers.findIndex(c => c._id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  const { transactionId, type, quantity, amount, items, date } = req.body;

  if (!transactionId || !amount) {
    return res.status(400).json({ message: 'Transaction ID and amount are required' });
  }

  const newPurchase = {
    _id: 'purchase_' + Date.now(),
    transactionId,
    type: type || 'Single',
    quantity: quantity || 0,
    amount,
    date: date || new Date().toLocaleDateString('en-US'),
    items: items || []
  };

  customers[index].purchaseHistory.push(newPurchase);
  
  // Update customer stats
  customers[index].totalPurchases = customers[index].purchaseHistory.length;
  customers[index].totalSpent = customers[index].purchaseHistory.reduce((sum, p) => sum + p.amount, 0);
  customers[index].lastPurchaseDate = new Date().toISOString().split('T')[0];

  res.status(201).json({
    message: 'Purchase added to customer history',
    purchase: newPurchase,
    customer: {
      totalPurchases: customers[index].totalPurchases,
      totalSpent: customers[index].totalSpent,
      lastPurchaseDate: customers[index].lastPurchaseDate
    }
  });
};

// ========== CUSTOMER STATISTICS ==========

// @desc    Get customer statistics
// @route   GET /api/customers/stats/summary
// @access  Private
// @desc    Get customer statistics
// @route   GET /api/customers/stats/summary
// @access  Private
const getCustomerStats = (req, res) => {
  try {
    console.log('📊 getCustomerStats called');
    console.log(`📊 Total customers in array: ${customers.length}`);
    
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const returnedCustomers = customers.filter(c => c.status === 'Returned').length;
    const inactiveCustomers = customers.filter(c => c.status === 'Inactive').length;
    
    const customersWithPurchases = customers.filter(c => c.totalPurchases > 0);
    const totalRevenue = customersWithPurchases.reduce((sum, c) => sum + c.totalSpent, 0);
    
    // Get recent customers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCustomers = customers.filter(c => 
      new Date(c.createdAt) >= thirtyDaysAgo
    ).length;

    const stats = {
      totalCustomers,
      activeCustomers,
      returnedCustomers,
      inactiveCustomers,
      customersWithPurchases: customersWithPurchases.length,
      totalRevenue,
      recentCustomers,
      averageSpentPerCustomer: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    };

    console.log('✅ Stats calculated:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('❌ Error in getCustomerStats:', error);
    res.status(500).json({ 
      message: 'Error calculating stats', 
      error: error.message 
    });
  }
};

// @desc    Get recent customers
// @route   GET /api/customers/recent
// @access  Private
const getRecentCustomers = (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map(({ _id, fullName, phoneNumber, organization, status, totalSpent }) => ({
      _id,
      fullName,
      phoneNumber,
      organization,
      status,
      totalSpent
    }));

  res.json(recentCustomers);
};

// @desc    Search customers
// @route   GET /api/customers/search
// @access  Private
const searchCustomers = (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const query = q.toLowerCase();
  
  const results = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(query) ||
    customer.phoneNumber.includes(query) ||
    (customer.organization && customer.organization.toLowerCase().includes(query)) ||
    (customer.email && customer.email.toLowerCase().includes(query))
  ).map(({ _id, fullName, phoneNumber, organization, status }) => ({
    _id,
    fullName,
    phoneNumber,
    organization,
    status
  }));

  res.json(results);
};

// ========== CUSTOMER TYPES ==========

// @desc    Get all customer types
// @route   GET /api/customers/types
// @access  Private
const getCustomerTypes = (req, res) => {
  const types = ['Regular', 'VIP', 'New', 'Wholesale', 'Corporate'];
  res.json(types);
};

// @desc    Get customer statuses
// @route   GET /api/customers/statuses
// @access  Private
const getCustomerStatuses = (req, res) => {
  const statuses = ['Active', 'Inactive', 'Returned'];
  res.json(statuses);
};

// ========== BULK OPERATIONS ==========

// @desc    Bulk import customers
// @route   POST /api/customers/bulk
// @access  Private/Admin
const bulkImportCustomers = (req, res) => {
  const { customers: newCustomers } = req.body;

  if (!Array.isArray(newCustomers)) {
    return res.status(400).json({ message: 'Customers must be an array' });
  }

  const imported = [];
  const errors = [];

  newCustomers.forEach((customerData, index) => {
    try {
      const { fullName, phoneNumber } = customerData;

      if (!fullName || !phoneNumber) {
        errors.push({ index, reason: 'Name and phone number are required' });
        return;
      }

      // Check for duplicate phone
      const existing = customers.find(c => c.phoneNumber === phoneNumber);
      if (existing) {
        errors.push({ index, reason: 'Phone number already exists' });
        return;
      }

      const nextId = customers.length > 0 ? Math.max(...customers.map(c => c._id)) + 1 : 1;

      const newCustomer = {
        _id: nextId,
        fullName,
        phoneNumber,
        organization: customerData.organization || 'Individual',
        email: customerData.email || '',
        address: customerData.address || '',
        customerType: customerData.customerType || 'Regular',
        status: 'Active',
        totalPurchases: 0,
        totalSpent: 0,
        lastPurchaseDate: null,
        createdAt: new Date().toISOString().split('T')[0],
        notes: customerData.notes || '',
        purchaseHistory: []
      };

      customers.push(newCustomer);
      imported.push(newCustomer);
    } catch (error) {
      errors.push({ index, reason: error.message });
    }
  });

  res.status(201).json({
    message: `Successfully imported ${imported.length} customers`,
    imported,
    errors: errors.length > 0 ? errors : undefined
  });
};

module.exports = {
  // Basic CRUD
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  
  // Purchase History
  getCustomerPurchases,
  addCustomerPurchase,
  
  // Statistics & Search
  getCustomerStats,
  getRecentCustomers,
  searchCustomers,
  
  // Utilities
  getCustomerTypes,
  getCustomerStatuses,
  
  // Bulk Operations
  bulkImportCustomers
};