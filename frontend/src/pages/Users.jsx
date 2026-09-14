import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiShield, FiUserCheck, FiUsers } from 'react-icons/fi';
import { roleLabel } from '../auth/roles';

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-slate-800 p-6 sm:p-8 text-white mb-6">
        <p className="text-amber-300 text-sm uppercase tracking-wide">Admin control</p>
        <h1 className="text-3xl font-bold mt-1">Account roles</h1>
        <p className="text-slate-300 mt-2 max-w-2xl">
          New people register as User and choose Staff or Management. Approve the request here.
          They must log in again after a role change.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <FiUsers className="text-slate-500 mb-2" />
          <p className="text-sm text-gray-500">Total accounts</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <FiShield className="text-amber-500 mb-2" />
          <p className="text-sm text-gray-500">Waiting approval</p>
          <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border shadow-sm">
          <FiUserCheck className="text-emerald-500 mb-2" />
          <p className="text-sm text-gray-500">Active roles</p>
          <p className="text-3xl font-bold text-emerald-600">{users.length - pending.length}</p>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Current role</th>
                <th className="px-4 py-3">Requested</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Assign role</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">{user.fullName || user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {user.requestedRole ? roleLabel(user.requestedRole) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        value={user.role}
                        disabled={savingId === String(user.id)}
                        onChange={(e) => updateRole(user, e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="management">Management</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user.requestedRole && user.role === 'user' && (
                        <button
                          type="button"
                          onClick={() => updateRole(user, user.requestedRole)}
                          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600"
                        >
                          <FiCheck /> Approve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
