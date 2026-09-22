import React from 'react';
import { FiClock, FiLogOut, FiShield } from 'react-icons/fi';
import { getStoredUser, roleLabel } from '../auth/roles';
import { PageShell, PageHero, Panel, SoftButton } from '../components/ui/PageChrome';

const PendingAccess = () => {
  const user = getStoredUser() || {};
  const requested = roleLabel(user.requestedRole || 'staff');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <PageShell className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-lg">
        <PageHero
          tone="amber"
          eyebrow="Account created"
          title="Waiting for admin approval"
          subtitle={
            <>
              Hi <span className="font-semibold">{user.fullName || user.username || 'there'}</span>.
              Your account is currently a User. You asked for {requested} access.
            </>
          }
          actions={
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <FiClock size={20} />
            </div>
          }
        />

        <Panel>
          <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900 flex gap-2">
            <FiShield className="mt-0.5 shrink-0" size={14} />
            <p>
              An admin will review this request and assign Staff, Management, or keep you as User.
              After approval, log in again to open store, orders, and customers.
            </p>
          </div>
          <SoftButton
            onClick={handleLogout}
            className="w-full mt-4 py-2.5 bg-slate-800 text-white hover:bg-slate-700"
          >
            <FiLogOut size={14} /> Back to login
          </SoftButton>
        </Panel>
      </div>
    </PageShell>
  );
};

export default PendingAccess;
