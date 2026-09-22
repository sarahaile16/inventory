import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiShield, FiUserCheck, FiUsers } from 'react-icons/fi';
import { roleLabel } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  LoadingBlock
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/users`);
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateRole = async (user, role) => {
    setSavingId(String(user.id));
    setMessage('');
    try {
      await axios.put(`${API_URL}/auth/users/${user.id}`, { role });
      setMessage(`${user.username || user.fullName} is now ${roleLabel(role)}. Ask them to log in again.`);
      await loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update role');
    } finally {
      setSavingId('');
    }
  };

  const pending = users.filter((user) => user.role === 'user' || user.status === 'Pending');

  if (loading) {
    return (
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        tone="slate"
        eyebrow="Admin control"
        title="Account roles"
        subtitle="New people register as User and choose Staff or Management. Approve the request here. They must log in again after a role change."
      />

      <StatGrid cols="3">
        <StatCard
          label="Total accounts"
          value={users.length}
          icon={<FiUsers size={16} />}
          accent="slate"
        />
        <StatCard
          label="Waiting approval"
          value={pending.length}
          icon={<FiShield size={16} />}
          accent="amber"
        />
        <StatCard
          label="Active roles"
          value={users.length - pending.length}
          icon={<FiUserCheck size={16} />}
          accent="emerald"
        />
      </StatGrid>

      {message && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 px-3 py-2 text-xs">
          {message}
        </div>
      )}

      <Panel title="All accounts" bodyClassName="p-0 sm:p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-slate-50 text-left text-[10px] sm:text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Account</th>
                <th className="px-3 py-2">Current role</th>
                <th className="px-3 py-2">Requested</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Assign role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-teal-50/40">
                  <td className="px-3 py-2.5 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user.fullName || user.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700">
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {user.requestedRole ? roleLabel(user.requestedRole) : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                        user.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <select
                        value={user.role}
                        disabled={savingId === String(user.id)}
                        onChange={(e) => updateRole(user, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="management">Management</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.requestedRole && user.role === 'user' && (
                        <SoftButton
                          onClick={() => updateRole(user, user.requestedRole)}
                          className="bg-amber-500 text-white hover:bg-amber-600"
                        >
                          <FiCheck size={12} /> Approve
                        </SoftButton>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
};

export default Users;
