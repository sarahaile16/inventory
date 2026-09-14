import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { homePath } from '../auth/roles';

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
axios.defaults.baseURL = API_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', {
        username,
        password
      });

      console.log('✅ Login successful', response.data);

      // Store user info (but NOT the token - it's in HttpOnly cookie)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      window.location.href = homePath(response.data.user?.role);

    } catch (err) {
      console.error('❌ Login error:', err);

      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Make sure the inventory backend is running on port 5001');
      } else if (err.response) {
        setError(err.response.data?.message || 'Invalid credentials');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
        <p className="text-gray-600 text-center mb-6">Hello - Login to your panel</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username or Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username or email"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg transition ${loading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          <p className="text-sm">
            <Link to="/reset" className="text-blue-500 hover:underline">
              Forgot your password?
            </Link>
          </p>
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>Admin: sari / sari123</p>
            <p>Management: manager / manager123</p>
            <p>Staff: staff / staff123</p>
            <p>Pending user: user / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;