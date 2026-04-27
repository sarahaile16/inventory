const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  // Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Company Information
  companyName: {
    type: String,
    default: '',
    trim: true
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff'],
    default: 'staff'
  },
  permissions: [{
    type: String,
    enum: [
      'view_products', 'add_products', 'edit_products', 'delete_products',
      'view_customers', 'add_customers', 'edit_customers', 'delete_customers',
      'view_sales', 'process_sales', 'refund_sales',
      'view_reports', 'generate_reports',
      'manage_users', 'manage_settings',
      'view_inventory', 'manage_inventory'
    ]
  }],
  
  // Account Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  lastPasswordChange: {
    type: Date
  },
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Login Attempts
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
});

// ========== INDEXES ==========
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ status: 1 });

// ========== PRE-SAVE HOOKS ==========
// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.lastPasswordChange = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// ========== INSTANCE METHODS ==========

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      username: this.username, 
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Return user object without sensitive data
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.__v;
  return user;
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  // If lock is expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if max attempts reached
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 }; // Lock for 30 minutes
  }
  
  return await this.updateOne(updates);
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = async function() {
  return await this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

// Check if account is locked
UserSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ========== STATIC METHODS ==========

// Find by credentials
UserSchema.statics.findByCredentials = async function(identifier, password) {
  // Find user by username or email
  const user = await this.findOne({
    $or: [
      { username: identifier },
      { email: identifier.toLowerCase() }
    ]
  });
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  // Check if account is locked
  if (user.isLocked()) {
    throw new Error('Account is locked. Please try again later.');
  }
  
  // Check if account is active
  if (user.status !== 'Active') {
    throw new Error(`Account is ${user.status.toLowerCase()}. Please contact support.`);
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  await user.resetLoginAttempts();
  
  return user;
};

// Find or create user
UserSchema.statics.findOrCreate = async function(userData) {
  let user = await this.findOne({ 
    $or: [
      { email: userData.email },
      { username: userData.username },
      { phone: userData.phone }
    ]
  });
  
  if (!user) {
    user = await this.create(userData);
  }
  
  return user;
};

// Get user statistics
UserSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] } }
      }
    }
  ]);
  
  const total = await this.countDocuments();
  const active = await this.countDocuments({ status: 'Active' });
  const pending = await this.countDocuments({ status: 'Pending' });
  
  return {
    total,
    active,
    pending,
    byRole: stats
  };
};

module.exports = mongoose.model('User', UserSchema);