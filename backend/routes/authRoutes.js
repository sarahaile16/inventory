const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const memoryAccounts = [
  { id: 1, fullName: 'Sari Admin', username: 'sari', email: 'sari@example.com', phone: '0911000001', password: 'sari123', role: 'admin', requestedRole: '', status: 'Active' },
  { id: 2, fullName: 'Store Manager', username: 'manager', email: 'manager@example.com', phone: '0911000002', password: 'manager123', role: 'management', requestedRole: 'management', status: 'Active' },
  { id: 3, fullName: 'Store Staff', username: 'staff', email: 'staff@example.com', phone: '0911000003', password: 'staff123', role: 'staff', requestedRole: 'staff', status: 'Active' },
  { id: 4, fullName: 'New User', username: 'user', email: 'user@example.com', phone: '0911000004', password: 'user123', role: 'user', requestedRole: 'staff', status: 'Pending' }
];

const ALLOWED_ROLES = ['admin', 'management', 'staff', 'user'];

const normalizeRequestedRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  if (value === 'management' || value === 'manager') return 'management';
  return 'staff';
};

const publicUser = (user) => ({
  id: user._id || user.id,
  fullName: user.fullName || user.name,
  username: user.username || user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  requestedRole: user.requestedRole || '',
  status: user.status || 'Active',
  companyName: user.companyName || ''
});

// ========== HELPER FUNCTIONS ==========
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

const setCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 1000,
  path: '/'
});

// ========== REGISTER ROUTE ==========
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, email, phone, password, requestedRole, role, companyName } = req.body;
    
    console.log('📝 Registration attempt:', { username, email });
    
    // Validate required fields
    if (!fullName || !username || !email || !phone || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All required fields must be filled' 
      });
    }
    
    // Check if username already exists
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already taken' 
      });
    }
    
    // Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }
    
    // Check if phone already exists
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res.status(400).json({ 
        success: false,
        message: 'Phone number already registered' 
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }
    
    const chosenRole = normalizeRequestedRole(requestedRole || role);
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      password,
      role: 'user',
      requestedRole: chosenRole,
      companyName: companyName || '',
      status: 'Pending',
      createdAt: new Date(),
      lastLogin: null
    });
    
    await newUser.save();

    memoryAccounts.push({
      id: Date.now(),
      fullName,
      username,
      email,
      phone,
      password,
      role: 'user',
      requestedRole: chosenRole,
      status: 'Pending',
      companyName: companyName || ''
    });
    
    console.log('✅ User registered as pending user:', username, 'requested', chosenRole);
    
    res.status(201).json({
      success: true,
      message: 'Account created as User. An admin will approve your requested role.',
      user: publicUser(newUser)
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// ========== LOGIN ROUTE ==========
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', username);
    
    // First check if user exists in database
    let user = await User.findOne({ 
      $or: [{ username: username }, { email: username }] 
    });
    
    if (!user) {
      const demo = memoryAccounts.find((account) =>
        (account.email === username || account.username === username) &&
        account.password === password
      );

      if (!demo) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(demo);
      res.cookie('token', token, setCookieOptions());
      return res.json({
        success: true,
        user: publicUser(demo)
      });
    }
    
    // Check password for database user
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    // Set cookie
    res.cookie('token', token, setCookieOptions());
    
    console.log('✅ Login successful for:', user.username);
    
    res.json({
      success: true,
      user: publicUser(user)
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== LOGOUT ROUTE ==========
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ========== VERIFY TOKEN ROUTE ==========
router.get('/verify', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

// ========== GET CURRENT USER ==========
router.get('/me', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Try to get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (user) {
      res.json({
        user: publicUser(user)
      });
    } else {
      // Fallback for hardcoded user
      res.json({
        user: {
          id: decoded.id,
          username: decoded.username,
          role: decoded.role
        }
      });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const dbUsers = await User.find().select('-password').sort({ createdAt: -1 });
    if (dbUsers.length > 0) {
      return res.json(dbUsers.map(publicUser));
    }
    return res.json(memoryAccounts.map(publicUser));
  } catch (error) {
    console.error('List users error:', error);
    res.json(memoryAccounts.map(publicUser));
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const nextRole = String(req.body.role || '').trim().toLowerCase();
    if (!ALLOWED_ROLES.includes(nextRole)) {
      return res.status(400).json({ message: 'Role must be admin, management, staff, or user' });
    }

    const nextStatus = nextRole === 'user' ? 'Pending' : 'Active';
    let updated = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id) && String(req.params.id).length === 24) {
      updated = await User.findByIdAndUpdate(
        req.params.id,
        { role: nextRole, status: nextStatus },
        { new: true }
      ).select('-password');
    }

    const memoryUser = memoryAccounts.find((account) => String(account.id) === String(req.params.id));
    if (memoryUser) {
      memoryUser.role = nextRole;
      memoryUser.status = nextStatus;
      updated = updated || memoryUser;
    }

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ success: true, user: publicUser(updated) });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating role' });
  }
});

module.exports = router;