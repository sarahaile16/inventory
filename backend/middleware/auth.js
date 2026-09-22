const jwt = require('jsonwebtoken');

const ROLES = {
  ADMIN: 'admin',
  MANAGEMENT: 'management',
  STAFF: 'staff',
  USER: 'user'
};

const jwtSecret = () => process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'admin') return ROLES.ADMIN;
  if (value === 'management' || value === 'manager') return ROLES.MANAGEMENT;
  if (value === 'staff') return ROLES.STAFF;
  return ROLES.USER;
};

const extractToken = (req) => {
  const header = req.headers.authorization || req.headers.Authorization;
  if (header && String(header).startsWith('Bearer ')) {
    return String(header).slice(7).trim();
  }
  if (req.header('x-auth-token')) return req.header('x-auth-token');
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

const requireAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret());
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: normalizeRole(decoded.role)
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRoles = (...roles) => {
  const allowed = roles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowed.includes(normalizeRole(req.user.role))) {
      return res.status(403).json({
        message: 'You do not have permission for this action'
      });
    }
    next();
  };
};

const canSeeMoney = (role) => {
  const r = normalizeRole(role);
  return r === ROLES.ADMIN || r === ROLES.MANAGEMENT;
};

const canSeeCustomerSensitive = (role) => canSeeMoney(role);

/** Strip phone + payment fields for staff / unauthorized viewers */
const sanitizeCustomerForRole = (customer, role) => {
  if (!customer) return customer;
  if (canSeeCustomerSensitive(role)) return customer;

  const {
    phoneNumber,
    email,
    address,
    wholePayment,
    firstPayment,
    restPayment,
    restPaid,
    totalSpent,
    paymentMethod,
    paymentType,
    paymentPhoto,
    paymentDate,
    lastPurchaseDate,
    purchaseHistory,
    documents,
    orders,
    ...safe
  } = customer;

  const redactOrder = (order) => ({
    _id: order._id,
    transactionId: order.transactionId,
    description: order.description,
    deadline: order.deadline,
    status: order.status,
    orderPhoto: order.orderPhoto,
    date: order.date,
    createdAt: order.createdAt
    // no money / payment photos
  });

  return {
    ...safe,
    phoneNumber: '',
    email: '',
    address: '',
    wholePayment: null,
    firstPayment: null,
    restPayment: null,
    restPaid: undefined,
    totalSpent: null,
    paymentMethod: '',
    paymentPhoto: '',
    purchaseHistory: Array.isArray(purchaseHistory)
      ? purchaseHistory.map((p) => ({
          _id: p._id,
          type: p.type,
          date: p.date,
          description: p.description || p.orderDescription || 'Order activity',
          // no amount / method / photos
        }))
      : [],
    orders: Array.isArray(orders) ? orders.map(redactOrder) : [],
    documents: Array.isArray(documents)
      ? documents.filter((d) => d.type !== 'payment').map((d) => ({
          id: d.id,
          name: d.name,
          type: d.type,
          date: d.date
          // no url for sensitive docs
        }))
      : [],
    _redacted: true
  };
};

const sanitizeSaleForRole = (sale, role) => {
  if (!sale) return sale;
  if (canSeeMoney(role)) return sale;

  const {
    totalAmount,
    firstPayment,
    restPayment,
    restPaid,
    paymentStatus,
    paymentMethod,
    items,
    ...safe
  } = sale;

  return {
    ...safe,
    totalAmount: null,
    firstPayment: null,
    restPayment: null,
    restPaid: undefined,
    paymentStatus: sale.restPaid ? 'complete' : 'pending_delivery',
    paymentMethod: '',
    items: Array.isArray(items)
      ? items.map((item) => ({
          name: item.name,
          qty: item.qty
          // no price / amount
        }))
      : [],
    _redacted: true
  };
};

// Backwards-compatible aliases
const authMiddleware = requireAuth;
const authorize = requireRoles;

module.exports = {
  ROLES,
  jwtSecret,
  normalizeRole,
  requireAuth,
  requireRoles,
  authMiddleware,
  authorize,
  canSeeMoney,
  canSeeCustomerSensitive,
  sanitizeCustomerForRole,
  sanitizeSaleForRole
};
