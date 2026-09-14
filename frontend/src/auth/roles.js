export const ROLES = {
  ADMIN: 'admin',
  MANAGEMENT: 'management',
  STAFF: 'staff',
  USER: 'user'
};

const PAGE_ROLES = {
  '/dashboard': [ROLES.ADMIN],
  '/users': [ROLES.ADMIN],
  '/settings': [ROLES.ADMIN],
  '/store': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/store/sales': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/store/payment': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/orders': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/customers': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/management': [ROLES.ADMIN, ROLES.MANAGEMENT],
  '/inventory': [ROLES.ADMIN, ROLES.MANAGEMENT],
  '/analytics': [ROLES.ADMIN, ROLES.MANAGEMENT],
  '/report': [ROLES.ADMIN, ROLES.MANAGEMENT],
  '/stock-movement': [ROLES.ADMIN, ROLES.MANAGEMENT],
  '/notifications': [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  '/pending': [ROLES.USER]
};

const ACTION_ROLES = {
  productCreate: [ROLES.ADMIN, ROLES.MANAGEMENT],
  productEdit: [ROLES.ADMIN, ROLES.MANAGEMENT],
  productDelete: [ROLES.ADMIN],
  stockTransfer: [ROLES.ADMIN, ROLES.MANAGEMENT],
  saleCreate: [ROLES.ADMIN, ROLES.MANAGEMENT, ROLES.STAFF],
  userManage: [ROLES.ADMIN],
  viewMoney: [ROLES.ADMIN, ROLES.MANAGEMENT]
};

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'admin') return ROLES.ADMIN;
  if (value === 'management' || value === 'manager') return ROLES.MANAGEMENT;
  if (value === 'staff') return ROLES.STAFF;
  return ROLES.USER;
}

export function getUserRole(user = getStoredUser()) {
  return normalizeRole(user?.role);
}

export function homePath(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) return '/dashboard';
  if (normalized === ROLES.USER) return '/pending';
  return '/store';
}

export function canAccessPath(pathname, role) {
  const normalized = normalizeRole(role);

  if (pathname === '/') return true;
  if (pathname.startsWith('/customers/')) {
    return PAGE_ROLES['/customers'].includes(normalized);
  }
  if (pathname.startsWith('/store/')) {
    return PAGE_ROLES['/store'].includes(normalized);
  }

  const allowed = PAGE_ROLES[pathname];
  return Array.isArray(allowed) ? allowed.includes(normalized) : normalized === ROLES.ADMIN;
}

export function can(action, role) {
  const allowed = ACTION_ROLES[action] || [ROLES.ADMIN];
  return allowed.includes(normalizeRole(role));
}

export function canSeeMoney(role) {
  return can('viewMoney', role);
}

export function roleLabel(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) return 'Admin';
  if (normalized === ROLES.MANAGEMENT) return 'Management';
  if (normalized === ROLES.STAFF) return 'Staff';
  return 'User';
}

export function roleTheme(role) {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.ADMIN) {
    return {
      id: ROLES.ADMIN,
      sidebar: 'bg-slate-950 text-slate-200',
      brand: 'text-white',
      muted: 'text-slate-400',
      link: 'text-slate-300 hover:bg-slate-800',
      active: 'bg-amber-500/15 text-amber-300 border-r-4 border-amber-400',
      page: 'bg-slate-100'
    };
  }
  if (normalized === ROLES.MANAGEMENT) {
    return {
      id: ROLES.MANAGEMENT,
      sidebar: 'bg-indigo-950 text-indigo-100',
      brand: 'text-white',
      muted: 'text-indigo-300',
      link: 'text-indigo-100 hover:bg-indigo-900',
      active: 'bg-white/10 text-white border-r-4 border-violet-300',
      page: 'bg-indigo-50/40'
    };
  }
  if (normalized === ROLES.STAFF) {
    return {
      id: ROLES.STAFF,
      sidebar: 'bg-white text-gray-700',
      brand: 'text-teal-800',
      muted: 'text-teal-600',
      link: 'text-gray-600 hover:bg-teal-50',
      active: 'bg-teal-50 text-teal-700 border-r-4 border-teal-600',
      page: 'bg-teal-50/40'
    };
  }
  return {
    id: ROLES.USER,
    sidebar: 'bg-white text-gray-700',
    brand: 'text-gray-800',
    muted: 'text-gray-500',
    link: 'text-gray-600 hover:bg-gray-50',
    active: 'bg-amber-50 text-amber-700 border-r-4 border-amber-500',
    page: 'bg-amber-50/50'
  };
}
