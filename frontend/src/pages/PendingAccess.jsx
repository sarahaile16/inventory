import React from 'react';
import { FiClock, FiLogOut, FiShield } from 'react-icons/fi';
import { getStoredUser, roleLabel } from '../auth/roles';

const PendingAccess = () => {
  const user = getStoredUser() || {};
  const requested = roleLabel(user.requestedRole || 'staff');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <FiClock size={28} />
          </div>
          <p className="text-amber-100 text-sm uppercase tracking-wide">Account created</p>
          <h1 className="text-3xl font-bold mt-1">Waiting for admin approval</h1>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-gray-600">
            Hi <span className="font-semibold text-gray-900">{user.fullName || user.username || 'there'}</span>.
            Your account is currently a <span className="font-semibold">User</span>.
            You asked for <span className="font-semibold">{requested}</span> access.
          </p>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900 flex gap-3">
            <FiShield className="mt-0.5 shrink-0" />
            An admin will review this request and assign Staff, Management, or keep you as User.
            After approval, log in again to open store, orders, and customers.
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            <FiLogOut /> Back to login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingAccess;
