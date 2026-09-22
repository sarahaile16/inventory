import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiArrowRight, FiEye, FiEyeOff, FiMail, FiPhone, FiPackage } from 'react-icons/fi';

axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
axios.defaults.baseURL = API_URL;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('email'); // email | phone
  const [step, setStep] = useState('request'); // request | reset | done
  const [login, setLogin] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const { data } = await axios.post('/auth/forgot-password', { email: login, username: login });
      setInfo(data.message || 'Check your email for a reset code.');
      if (data.devCode) {
        setCode(String(data.devCode));
        setInfo((data.hint || data.message) + ` Code: ${data.devCode}`);
      }
      if (data.emailError && !data.devCode) {
        setError(
          `Could not send email (${data.emailError}). Try the Phone option, or ask an admin.`
        );
        return;
      }
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const { data } = await axios.post('/auth/forgot-password-phone', { username, phone });
      setLogin(username);
      if (data.resetCode) {
        setCode(String(data.resetCode));
      }
      setInfo(data.message || 'Phone verified.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not verify phone.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/reset-password', {
        email: login,
        username: login || username,
        code,
        newPassword
      });
      setInfo(data.message || 'Password updated.');
      setStep('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#071a18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(15,118,110,0.45),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(217,119,6,0.22),_transparent_50%)]" />

      <div className="relative min-h-screen flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <FiPackage size={20} />
            </span>
            <p className="auth-display text-xl font-bold">FurniStock</p>
          </div>

          <div className="rounded-[1.75rem] bg-[#f4faf8] text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/40 p-7 sm:p-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-800 hover:text-teal-950"
            >
              <FiArrowLeft size={12} /> Back to sign in
            </Link>

            <p className="text-xs uppercase tracking-[0.2em] text-teal-700/80 font-semibold mt-4">Account recovery</p>
            <h2 className="auth-display text-3xl font-bold text-[#0f2f2c] mt-2">Forgot password</h2>
            <p className="text-slate-500 text-sm mt-2">
              Reset with your email code, or verify your registered phone.
            </p>

            {step === 'request' && (
              <>
                <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
                  <button
                    type="button"
                    onClick={() => { setMethod('email'); setError(''); setInfo(''); }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      method === 'email' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <FiMail size={14} /> Email
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMethod('phone'); setError(''); setInfo(''); }}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      method === 'phone' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    <FiPhone size={14} /> Phone
                  </button>
                </div>

                {method === 'email' ? (
                  <form onSubmit={handleRequestEmail} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email or username</label>
                      <input
                        type="text"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600"
                        placeholder="you@company.com"
                        required
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending…' : 'Send reset code'}
                      {!loading && <FiArrowRight />}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRequestPhone} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                        placeholder="your.username"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone on your account</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                        placeholder="09xxxxxxxx"
                        required
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {loading ? 'Checking…' : 'Verify phone'}
                      {!loading && <FiArrowRight />}
                    </button>
                  </form>
                )}
              </>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reset code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white tracking-[0.3em] text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    placeholder="6-digit code"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                      placeholder="At least 6 characters"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition disabled:opacity-60"
                >
                  {loading ? 'Saving…' : 'Update password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('request'); setError(''); }}
                  className="w-full text-xs text-slate-500 hover:text-teal-700"
                >
                  Start over
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3">
                  {info || 'Password updated successfully.'}
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                >
                  Go to sign in
                </button>
              </div>
            )}

            {info && step !== 'done' && (
              <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 text-teal-800 text-sm px-4 py-3">
                {info}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-3">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
