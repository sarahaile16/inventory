import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiEye, FiEyeOff, FiArrowRight, FiPackage } from 'react-icons/fi';
import { homePath } from '../auth/roles';

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
axios.defaults.baseURL = API_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', { username, password });

      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      window.location.href = homePath(response.data.user?.role);
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Start the backend on port 5001.');
      } else if (err.response) {
        setError(err.response.data?.message || 'Invalid username or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#071a18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(15,118,110,0.45),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(217,119,6,0.22),_transparent_50%)]" />
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="absolute -top-10 right-[12%] h-40 w-40 rounded-full bg-teal-400/20 blur-2xl animate-[floatSlow_7s_ease-in-out_infinite]" />
      <div className="absolute bottom-10 left-[8%] h-52 w-52 rounded-full bg-amber-500/15 blur-3xl animate-[floatSlow_9s_ease-in-out_infinite]" />

      <div className="relative min-h-screen grid lg:grid-cols-2">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3 animate-[fadeIn_500ms_ease-out]">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <FiPackage size={22} />
            </span>
            <div>
              <p className="auth-display text-2xl font-bold tracking-tight">FurniStock</p>
              <p className="text-teal-100/70 text-sm">Furniture inventory & orders</p>
            </div>
          </div>

          <div className="max-w-md animate-[slideUp_600ms_ease-out]">
            <h1 className="auth-display text-5xl xl:text-6xl font-bold leading-[1.05] text-white">
              Run your warehouse with clarity.
            </h1>
            <p className="mt-5 text-lg text-teal-50/80 leading-relaxed">
              Track stock, store transfers, customer orders, and staff access — all in one calm workspace.
            </p>
          </div>

          <p className="text-sm text-teal-100/50">Secure role-based access for Admin, Management & Staff</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md animate-[slideUp_450ms_ease-out]">
            <div className="lg:hidden mb-8 flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <FiPackage size={20} />
              </span>
              <p className="auth-display text-xl font-bold">FurniStock</p>
            </div>

            <div className="rounded-[1.75rem] bg-[#f4faf8] text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/40 p-7 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-700/80 font-semibold">Welcome back</p>
              <h2 className="auth-display text-3xl font-bold text-[#0f2f2c] mt-2">Sign in</h2>
              <p className="text-slate-500 text-sm mt-2">
                Use the username and password you created. New team members register first, then an admin approves them.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Username or email</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition"
                    placeholder="your.username"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-teal-700 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition"
                      placeholder="Your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-teal-900/20"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                  {!loading && <FiArrowRight />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                New here?{' '}
                <Link to="/signup" className="text-teal-700 font-semibold hover:underline">
                  Create an account
                </Link>
              </p>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDemo((v) => !v)}
                  className="text-xs text-slate-500 hover:text-teal-700 transition"
                >
                  {showDemo ? 'Hide' : 'Show'} demo accounts (testing only)
                </button>
                {showDemo && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600 space-y-1">
                    <p><span className="font-semibold">Admin:</span> sari / sari123</p>
                    <p><span className="font-semibold">Management:</span> manager / manager123</p>
                    <p><span className="font-semibold">Staff:</span> staff / staff123</p>
                    <p className="text-slate-400 pt-1">Real employees should sign up with their own username & password.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
