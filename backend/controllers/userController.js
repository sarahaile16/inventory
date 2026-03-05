let users = [
  {
    id: 1,
    name: 'Benyam Assegdw',
    email: 'benyam@tridal.org',
    password: 'password123',
    role: 'Admin',
    status: 'Active',
    permissions: ['Store Management', 'Inventory Management', 'Reporting', 'Add Products', 'Customer Management System', 'Settings', 'Dashboard'],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Abreham Yilema',
    email: 'abreham@gmail.com',
    password: 'password123',
    role: 'Manager',
    status: 'Active',
    permissions: ['Store Management', 'Inventory Management', 'Reporting'],
    createdAt: new Date().toISOString()
  }
];

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = (req, res) => {
  const userList = users.map(({ password, ...user }) => user);
  res.json(userList);
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
const createUser = (req, res) => {
  const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id: nextId,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password || 'password123',
    role: req.body.role || 'Staff',
    status: 'Active',
    permissions: req.body.permissions || [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  const { password, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    const { password, ...userWithoutPassword } = users[index];
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index !== -1) {
    users.splice(index, 1);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user permissions
// @route   PUT /api/users/:id/permissions
// @access  Private/Admin
const updatePermissions = (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index !== -1) {
    users[index].permissions = req.body.permissions || [];
    res.json({ 
      message: 'Permissions updated',
      permissions: users[index].permissions 
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updatePermissions
};