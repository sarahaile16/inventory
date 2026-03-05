const express = require('express');
const router = express.Router();

// In-memory storage
let users = [
  {
    id: 1,
    name: 'Benyam Assegdw',
    email: 'benyam@tridal.org',
    role: 'Admin',
    status: 'Active',
    permissions: ['Store Management', 'Inventory Management', 'Reporting']
  },
  {
    id: 2,
    name: 'Abreham Yilema',
    email: 'abreham@gmail.com',
    role: 'Manager',
    status: 'Active',
    permissions: ['Store Management', 'Inventory Management']
  }
];

// Get all users
router.get('/', (req, res) => {
  res.json(users);
});

// Get single user
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Create user
router.post('/', (req, res) => {
  const newUser = {
    id: users.length + 1,
    ...req.body,
    status: 'Active'
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body, id };
    res.json(users[index]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  
  if (index !== -1) {
    users.splice(index, 1);
    res.json({ message: 'User deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;