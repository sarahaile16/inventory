import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiShoppingCart, FiUser, FiCreditCard, FiClock } from 'react-icons/fi';
import { can, canSeeMoney, getUserRole, ROLES } from '../auth/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const daysUntil = (deadline) => {
  if (!deadline) return null;
  const due = new Date(deadline);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

const DeadlineBadge = ({ deadline }) => {
  if (!deadline) return <span className="text-gray-400 text-sm">Not set</span>;
  const days = daysUntil(deadline);
  const label = String(deadline).slice(0, 10);
  if (days < 0) {
    return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">{label} · overdue</span>;
  }
  if (days === 0) {
    return <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">{label} · due today</span>;
  }
  return <span className="px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">{label} · {days} days</span>;
};

const Orders = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const isStaff = getUserRole() === ROLES.STAFF;
  const showMoney = canSeeMoney();

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(`${API_URL}/sales`);
        setSales(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const today = new Date().toLocaleDateString('en-CA');
  const todayOrders = sales.filter((sale) => String(sale.date).slice(0, 10) === today);
  const todayRevenue = todayOrders.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const dueSoon = sales.filter((sale) => {
    const days = daysUntil(sale.deadline);
    return days !== null && days <= 3;
  }).length;
  const restDue = sales.filter((sale) => Number(sale.restPayment || 0) > 0 && !sale.restPaid).length;

  const collectRest = async (sale) => {
    try {
      await axios.put(`${API_URL}/sales/${sale._id}`, { collectRest: true });
      setSales((current) =>
        current.map((item) =>
          item._id === sale._id
            ? { ...item, restPaid: true, restPayment: 0, paymentStatus: 'fully_paid' }
            : item
        )
      );
    } catch (error) {
      console.error('Error collecting rest payment:', error);
    }
  };

  const filtered = useMemo(
    () =>
      sales.filter((sale) =>
        [sale.transactionId, sale.customerName, sale.paymentMethod, sale.deadline]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [sales, searchTerm]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className={`rounded-3xl p-6 sm:p-8 mb-6 text-white ${isStaff ? 'bg-gradient-to-r from-teal-600 to-emerald-600' : 'bg-gradient-to-r from-slate-900 to-indigo-900'}`}>
        <p className="text-white/70 text-sm uppercase tracking-wide">Floor operations</p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-white/80 mt-1">
              {showMoney
                ? 'Track purchases, payment, and delivery deadlines.'
                : 'Track items, customers, and delivery deadlines. Money stays with management.'}
            </p>
          </div>
          {can('saleCreate') && (
            <Link
              to="/store/sales"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white text-teal-800 font-medium hover:bg-teal-50"
            >
              <FiPlus className="mr-2" /> New sale
            </Link>
          )}
        </div>
      </div>

      <div className={`grid grid-cols-1 ${showMoney ? 'sm:grid-cols-3' : 'sm:grid-cols-3'} gap-4 mb-6`}>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <p className="text-sm text-gray-500">Today's orders</p>
          <p className="text-3xl font-bold text-teal-700">{todayOrders.length}</p>
        </div>
        {showMoney ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
            <p className="text-sm text-gray-500">Today's sales</p>
            <p className="text-3xl font-bold text-emerald-700">ETB {formatMoney(todayRevenue)}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
            <p className="text-sm text-gray-500 flex items-center gap-1"><FiClock /> Due soon / overdue</p>
            <p className="text-3xl font-bold text-amber-700">{dueSoon}</p>
          </div>
        )}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-sm text-gray-500">Rest due on delivery</p>
          <p className="text-3xl font-bold text-slate-800">{restDue}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent orders</h2>
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, receipt, deadline..."
              className="w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FiShoppingCart size={42} className="mx-auto mb-3 text-gray-300" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-teal-50/70 text-left text-xs uppercase text-teal-800">
                <tr>
                  <th className="px-4 py-3">Receipt</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Order date</th>
                  <th className="px-4 py-3">Deadline</th>
                  {showMoney && <th className="px-4 py-3">Whole</th>}
                  {showMoney && <th className="px-4 py-3">First</th>}
                  <th className="px-4 py-3">Rest</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((sale) => (
                  <tr key={sale._id} className="hover:bg-teal-50/40">
                    <td className="px-4 py-4 font-medium text-slate-800">{sale.transactionId}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-2">
                        <FiUser className="text-teal-600" />
                        {sale.customerName || 'Walk-in'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {(sale.items || []).length} items
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        <FiCreditCard /> {sale.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{String(sale.date).slice(0, 10)}</td>
                    <td className="px-4 py-4"><DeadlineBadge deadline={sale.deadline} /></td>
                    {showMoney && (
                      <td className="px-4 py-4 font-semibold">ETB {formatMoney(sale.totalAmount)}</td>
                    )}
                    {showMoney && (
                      <td className="px-4 py-4 text-teal-700">ETB {formatMoney(sale.firstPayment)}</td>
                    )}
                    <td className="px-4 py-4">
                      {sale.restPaid || Number(sale.restPayment || 0) === 0 ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">Paid in full</span>
                      ) : showMoney ? (
                        <span className="text-amber-700 font-medium">ETB {formatMoney(sale.restPayment)}</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">Due on delivery</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {!sale.restPaid && Number(sale.restPayment || 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => collectRest(sale)}
                          className="px-3 py-1 text-xs rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Collect rest
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
