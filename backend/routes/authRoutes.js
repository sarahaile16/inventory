const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Add this import

// ========== HELPER FUNCTIONS ==========
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
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
    const { fullName, username, email, phone, password, role, companyName } = req.body;
    
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
    
    // Create new user
    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      password,
      role: role || 'staff',
      companyName: companyName || '',
      status: 'Active',
      createdAt: new Date(),
      lastLogin: null
    });
    
    await newUser.save();
    
    console.log('✅ User registered successfully:', username);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        companyName: newUser.companyName
      }
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
    
    // If no user in DB, check hardcoded admin for testing
    if (!user) {
      if (username === 'sari' && password === 'sari123') {
        const token = jwt.sign(
          { id: 1, username: 'sari', role: 'admin' },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '1h' }
        );
        
        res.cookie('token', token, setCookieOptions());
        
        return res.json({
          success: true,
          user: {
            id: 1,
            username: 'sari',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
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
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        companyName: user.companyName
      }
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
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          companyName: user.companyName
        }
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

module.exports = router;