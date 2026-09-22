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
  const { jwtSecret } = require('../middleware/auth');
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      role: user.role
    },
    jwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

const setCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
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
        token,
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
      token,
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
  const token = req.cookies.token || (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }
  
  try {
    const { jwtSecret } = require('../middleware/auth');
    const decoded = jwt.verify(token, jwtSecret());
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

router.get('/users', require('../middleware/auth').requireAuth, require('../middleware/auth').requireRoles('admin'), async (req, res) => {
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

router.put('/users/:id', require('../middleware/auth').requireAuth, require('../middleware/auth').requireRoles('admin'), async (req, res) => {
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

// ========== FORGOT / RESET PASSWORD ==========
const crypto = require('crypto');
const memoryResets = new Map(); // key: username|email lower → { code, expires, accountId }

const makeResetCode = () => String(crypto.randomInt(100000, 999999));
const normalizePhoneDigits = (phone) => String(phone || '').replace(/\D/g, '');

const findDbUserByLogin = async (login) => {
  const value = String(login || '').trim();
  if (!value) return null;
  return User.findOne({
    $or: [{ email: value.toLowerCase() }, { username: value }]
  });
};

const findMemoryAccount = (login) => {
  const value = String(login || '').trim().toLowerCase();
  return memoryAccounts.find(
    (a) =>
      String(a.email || '').toLowerCase() === value ||
      String(a.username || '').toLowerCase() === value
  );
};

const storeMemoryReset = (account, code) => {
  const key = String(account.username || account.email).toLowerCase();
  memoryResets.set(key, {
    code: String(code),
    expires: Date.now() + 15 * 60 * 1000,
    accountId: account.id
  });
  if (account.email) {
    memoryResets.set(String(account.email).toLowerCase(), memoryResets.get(key));
  }
};

const verifyMemoryReset = (login, code) => {
  const value = String(login || '').trim().toLowerCase();
  const entry = memoryResets.get(value);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryResets.delete(value);
    return null;
  }
  if (String(entry.code) !== String(code).trim()) return null;
  return memoryAccounts.find((a) => a.id === entry.accountId) || null;
};

/** Request reset via email — sends a 6-digit code */
router.post('/forgot-password', async (req, res) => {
  try {
    const login = String(req.body.email || req.body.username || '').trim();
    if (!login) {
      return res.status(400).json({ success: false, message: 'Enter your email or username' });
    }

    const generic = {
      success: true,
      message: 'If an account exists for that email/username, a reset code was sent.',
      method: 'email'
    };

    const code = makeResetCode();
    const { sendPasswordResetCode, hasRealSmtpConfig } = require('../utils/emailService');

    const dbUser = await findDbUserByLogin(login);
    if (dbUser) {
      dbUser.passwordResetToken = code;
      dbUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await dbUser.save();

      if (!dbUser.email) {
        return res.json({
          ...generic,
          emailed: false,
          hint: 'No email on this account. Use the phone option instead.'
        });
      }

      const mail = await sendPasswordResetCode({
        to: dbUser.email,
        fullName: dbUser.fullName,
        username: dbUser.username,
        code
      });

      return res.json({
        ...generic,
        emailed: Boolean(mail.sent),
        emailError: mail.sent ? undefined : mail.error,
        previewUrl: mail.previewUrl || undefined,
        smtpReady: hasRealSmtpConfig()
      });
    }

    const demo = findMemoryAccount(login);
    if (demo) {
      storeMemoryReset(demo, code);
      if (demo.email) {
        const mail = await sendPasswordResetCode({
          to: demo.email,
          fullName: demo.fullName,
          username: demo.username,
          code
        });
        // Dev fallback: if SMTP fails, include code so local testing still works
        return res.json({
          ...generic,
          emailed: Boolean(mail.sent),
          emailError: mail.sent ? undefined : mail.error,
          previewUrl: mail.previewUrl || undefined,
          smtpReady: hasRealSmtpConfig(),
          ...(!mail.sent && process.env.NODE_ENV !== 'production'
            ? { devCode: code, hint: 'Email not sent (SMTP). Dev code shown for testing only.' }
            : {})
        });
      }
    }

    // Always generic — do not reveal whether account exists
    return res.json(generic);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Could not process password reset request' });
  }
});

/**
 * Alternate: prove identity with username + registered phone,
 * then receive a reset code (emailed when possible).
 */
router.post('/forgot-password-phone', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const phone = normalizePhoneDigits(req.body.phone);
    if (!username || phone.length < 9) {
      return res.status(400).json({
        success: false,
        message: 'Enter your username and the phone number on your account'
      });
    }

    const code = makeResetCode();
    const { sendPasswordResetCode, hasRealSmtpConfig } = require('../utils/emailService');

    const dbUser = await User.findOne({ username });
    if (dbUser && normalizePhoneDigits(dbUser.phone) === phone) {
      dbUser.passwordResetToken = code;
      dbUser.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await dbUser.save();

      let emailed = false;
      let emailError;
      let previewUrl;
      if (dbUser.email) {
        const mail = await sendPasswordResetCode({
          to: dbUser.email,
          fullName: dbUser.fullName,
          username: dbUser.username,
          code
        });
        emailed = Boolean(mail.sent);
        emailError = mail.sent ? undefined : mail.error;
        previewUrl = mail.previewUrl || undefined;
      }

      return res.json({
        success: true,
        message: emailed
          ? 'Phone verified. A reset code was sent to your email.'
          : 'Phone verified. Use the code below to set a new password.',
        method: 'phone',
        verified: true,
        emailed,
        emailError,
        previewUrl,
        smtpReady: hasRealSmtpConfig(),
        // Phone path already proved ownership — return code so they can continue without SMS
        resetCode: code
      });
    }

    const demo = memoryAccounts.find(
      (a) =>
        String(a.username).toLowerCase() === username.toLowerCase() &&
        normalizePhoneDigits(a.phone) === phone
    );
    if (demo) {
      storeMemoryReset(demo, code);
      let emailed = false;
      if (demo.email) {
        const mail = await sendPasswordResetCode({
          to: demo.email,
          fullName: demo.fullName,
          username: demo.username,
          code
        });
        emailed = Boolean(mail.sent);
      }
      return res.json({
        success: true,
        message: emailed
          ? 'Phone verified. A reset code was also emailed.'
          : 'Phone verified. Use the code to set a new password.',
        method: 'phone',
        verified: true,
        emailed,
        resetCode: code
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Username and phone do not match our records'
    });
  } catch (error) {
    console.error('Forgot password phone error:', error);
    res.status(500).json({ success: false, message: 'Could not verify phone for reset' });
  }
});

/** Set new password with email/username + code */
router.post('/reset-password', async (req, res) => {
  try {
    const login = String(req.body.email || req.body.username || '').trim();
    const code = String(req.body.code || req.body.resetCode || '').trim();
    const newPassword = String(req.body.newPassword || req.body.password || '');

    if (!login || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email/username, reset code, and new password are required'
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const dbUser = await findDbUserByLogin(login);
    if (dbUser) {
      const tokenOk =
        dbUser.passwordResetToken &&
        String(dbUser.passwordResetToken) === code &&
        dbUser.passwordResetExpires &&
        dbUser.passwordResetExpires > new Date();

      if (!tokenOk) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset code'
        });
      }

      dbUser.password = newPassword;
      dbUser.passwordResetToken = undefined;
      dbUser.passwordResetExpires = undefined;
      await dbUser.save();

      return res.json({
        success: true,
        message: 'Password updated. You can sign in with your new password.'
      });
    }

    const demo = verifyMemoryReset(login, code) || (() => {
      // Also allow matching by username when code was stored under username key
      const byUser = findMemoryAccount(login);
      if (!byUser) return null;
      return verifyMemoryReset(byUser.username, code) || verifyMemoryReset(byUser.email, code);
    })();

    if (demo) {
      demo.password = newPassword;
      memoryResets.delete(String(demo.username).toLowerCase());
      if (demo.email) memoryResets.delete(String(demo.email).toLowerCase());
      return res.json({
        success: true,
        message: 'Password updated. You can sign in with your new password.'
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset code'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Could not reset password' });
  }
});

module.exports = router;