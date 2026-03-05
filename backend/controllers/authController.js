const users = [
  {
    id: 1,
    name: 'sari',
    email: 'sari@example.com',
    password: 'sari123',
    role: 'admin'
  }
];

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt:', username);

    // Find user by email or name
    const user = users.find(u => u.email === username || u.name === username);

    if (user && user.password === password) {
      res.json({
        token: 'jwt-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password,
      role: role || 'staff'
    };

    users.push(newUser);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { login, register, getMe };