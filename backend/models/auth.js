const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ========== HELPER FUNCTION TO GENERATE TOKEN ==========
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

// ========== SET COOKIE OPTIONS ==========
const cookieOptions = {
  httpOnly: true,           // Prevents XSS attacks
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',        // Prevents CSRF attacks
  maxAge: 60 * 60 * 1000,    // 1 hour (match with JWT expiry)
  path: '/'                  // Available everywhere
};

// @route   POST /api/auth/login
// @desc    Authenticate user & set cookie
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt:', username);

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie('token', token, cookieOptions);

    console.log('✅ Login successful for:', username);

    // Return user info (NOT the token)
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user & clear cookie
// @access  Private
router.post('/logout', (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    console.log('✅ Logout successful');
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify token from cookie
// @access  Public
router.get('/verify', (req, res) => {
  try {
    // Get token from cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        valid: false, 
        message: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    );

    res.json({ 
      valid: true, 
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        valid: false, 
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      valid: false, 
      message: 'Invalid token' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user from token
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    );

    // Get fresh user data from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh expired token
// @access  Public
router.post('/refresh', (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token (ignore expiration)
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key',
      { ignoreExpiration: true }
    );

    // Generate new token
    const newToken = jwt.sign(
      { 
        id: decoded.id, 
        username: decoded.username, 
        role: decoded.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    // Set new cookie
    res.cookie('token', newToken, cookieOptions);

    res.json({ 
      success: true, 
      message: 'Token refreshed' 
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public (should be restricted in production)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      password,
      role: role || 'staff'
    });

    await user.save();

    // Generate token for auto-login after registration
    const token = generateToken(user);

    // Set HttpOnly cookie
    res.cookie('token', token, cookieOptions);

    console.log('✅ User registered:', username);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;