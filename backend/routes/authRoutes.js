const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Login route - sets HttpOnly cookie
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Login attempt:', username);
  
  // Your user validation logic
  if (username === 'sari' && password === 'sari123') {
    // Create JWT token
    const token = jwt.sign(
      { 
        id: 1, 
        username: 'sari', 
        role: 'admin' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,           // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',        // Prevents CSRF attacks
      maxAge: 60 * 60 * 1000,    // 1 hour
      path: '/'                   // Available everywhere
    });
    
    console.log('✅ Login successful for:', username);
    
    // Send user info (NOT the token)
    res.json({
      success: true,
      user: {
        id: 1,
        username: 'sari',
        role: 'admin'
      }
    });
  } else {
    console.log('❌ Login failed for:', username);
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Logout route - clears cookie
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Verify token route
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

// Get current user from cookie
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;