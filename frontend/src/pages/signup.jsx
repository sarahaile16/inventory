import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiUser, FiMail, FiLock, FiPhone, FiBriefcase,
  FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle,
  FiArrowRight, FiPackage
} from 'react-icons/fi';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    requestedRole: 'staff',
    companyName: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be at least 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to continue';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      await axios.post(`${API_URL}/auth/register`, {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        requestedRole: formData.requestedRole,
        companyName: formData.companyName
      });

      setSuccess(
        `Account created for “${formData.username}”. You start as a pending User. An admin will approve your ${formData.requestedRole} access. Then sign in with YOUR username and password.`
      );

      setFormData({
        fullName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        requestedRole: 'staff',
        companyName: '',
        agreeTerms: false
      });

      setTimeout(() => navigate('/login'), 2800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full pl-10 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 transition ${
      hasError ? 'border-rose-400' : 'border-slate-200'
    }`;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#071a18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(15,118,110,0.4),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_rgba(217,119,6,0.18),_transparent_45%)]" />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <FiPackage size={22} />
            </span>
            <div>
              <p className="auth-display text-2xl font-bold">FurniStock</p>
              <p className="text-teal-100/70 text-sm">Furniture inventory & orders</p>
            </div>
          </div>

          <div className="max-w-lg animate-[slideUp_550ms_ease-out]">
            <h1 className="auth-display text-5xl font-bold leading-[1.08]">
              Join your store team the right way.
            </h1>
            <p className="mt-5 text-teal-50/80 text-lg leading-relaxed">
              Create your own username and password. You do not use the demo staff login — Admin will approve the role you request.
            </p>
            <ol className="mt-8 space-y-3 text-sm text-teal-50/90">
              <li className="flex gap-3"><span className="text-amber-300 font-bold">1</span> Sign up with your details</li>
              <li className="flex gap-3"><span className="text-amber-300 font-bold">2</span> Wait on Access status (pending)</li>
              <li className="flex gap-3"><span className="text-amber-300 font-bold">3</span> Admin assigns Staff or Management</li>
              <li className="flex gap-3"><span className="text-amber-300 font-bold">4</span> Sign in again with your own password</li>
            </ol>
          </div>

          <p className="text-sm text-teal-100/50">Already approved? <Link to="/login" className="text-amber-200 hover:underline">Sign in</Link></p>
        </section>

        <section className="flex items-start lg:items-center justify-center p-5 sm:p-8 py-10">
          <div className="w-full max-w-xl animate-[slideUp_450ms_ease-out]">
            <div className="lg:hidden mb-6">
              <p className="auth-display text-2xl font-bold">FurniStock</p>
              <p className="text-teal-100/70 text-sm mt-1">Create your own account — not the demo staff login</p>
            </div>

            <div className="rounded-[1.75rem] bg-[#f4faf8] text-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-700/80 font-semibold">New team member</p>
              <h2 className="auth-display text-3xl font-bold text-[#0f2f2c] mt-2">Create account</h2>
              <p className="text-slate-500 text-sm mt-2">
                Pick a unique username and password. Demo logins like <span className="font-medium text-slate-700">staff / staff123</span> are only for testing.
              </p>

              {error && (
                <div className="mt-5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-3 flex gap-2">
                  <FiAlertCircle className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm px-4 py-3 flex gap-2">
                  <FiCheckCircle className="mt-0.5 shrink-0" /> {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input name="fullName" value={formData.fullName} onChange={handleChange} className={fieldClass(errors.fullName)} placeholder="Your full name" />
                  </div>
                  {errors.fullName && <p className="text-rose-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username *</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input name="username" value={formData.username} onChange={handleChange} className={fieldClass(errors.username)} placeholder="Choose yours" />
                  </div>
                  {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input name="phone" value={formData.phone} onChange={handleChange} className={fieldClass(errors.phone)} placeholder="09xxxxxxxx" />
                  </div>
                  {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass(errors.email)} placeholder="you@email.com" />
                  </div>
                  {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company <span className="text-slate-400">(optional)</span></label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input name="companyName" value={formData.companyName} onChange={handleChange} className={fieldClass(false)} placeholder="Store / company name" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={`${fieldClass(errors.password)} pr-10`} placeholder="Min. 6 characters" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password *</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3.5 text-slate-400" size={16} />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`${fieldClass(errors.confirmPassword)} pr-10`} placeholder="Re-enter" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400">
                      {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">I want to work as</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: 'staff', title: 'Staff', text: 'Store, orders, customers' },
                      { value: 'management', title: 'Management', text: 'Inventory, stock, reports' }
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => setFormData({ ...formData, requestedRole: option.value })}
                        className={`text-left p-4 rounded-xl border-2 transition ${
                          formData.requestedRole === option.value
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-slate-200 hover:border-teal-200 bg-white'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{option.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{option.text}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    You always start as <strong>User (pending)</strong>. Admin must approve before you get Staff or Management access.
                  </p>
                </div>

                <div className="sm:col-span-2 flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  />
                  <label className="text-sm text-slate-600">
                    I understand my account needs admin approval before I can use the store system.
                  </label>
                </div>
                {errors.agreeTerms && <p className="sm:col-span-2 text-rose-500 text-xs">{errors.agreeTerms}</p>}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-teal-900/15"
                  >
                    {loading ? 'Creating account…' : 'Create my account'}
                    {!loading && <FiArrowRight />}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-teal-700 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
