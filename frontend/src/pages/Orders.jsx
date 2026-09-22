import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiShoppingCart, FiUser, FiCreditCard, FiClock, FiEye } from 'react-icons/fi';
import { can, canSeeMoney, getUserRole, ROLES } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  HeroLink,
  LoadingBlock,
  EmptyState,
  SearchInput
} from '../components/ui/PageChrome';

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
  if (!deadline) return <span className="text-slate-400 text-xs">Not set</span>;
  const days = daysUntil(deadline);
  const label = String(deadline).slice(0, 10);
  if (days < 0) {
    return (
      <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-rose-100 text-rose-700">
        {label} · overdue
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-100 text-amber-800">
        {label} · due today
      </span>
    );
  }
  return (
    <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-teal-100 text-teal-800">
      {label} · {days}d
    </span>
  );
};

const Orders = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const isStaff = getUserRole() === ROLES.STAFF;
  const showMoney = canSeeMoney();
  const canCollect = can('viewMoney');

  const openCustomerDetails = async (sale) => {
    if (sale?.customerId) {
      navigate(`/customers/${sale.customerId}?tab=orders`);
      return;
    }
    // Older sales may not have customerId — resolve by name
    if (sale?.customerName) {
      try {
        const response = await axios.get(`${API_URL}/customers`);
        const list = Array.isArray(response.data) ? response.data : [];
        const match = list.find(
          (c) => String(c.fullName || '').toLowerCase() === String(sale.customerName).toLowerCase()
        );
        if (match?._id) {
          navigate(`/customers/${match._id}?tab=orders`);
          return;
        }
      } catch (error) {
        console.error('Could not resolve customer for order:', error);
      }
    }
    alert('No linked customer for this order. Open Customers and use View Details there.');
  };

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
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        tone={isStaff ? 'teal' : 'slate'}
        eyebrow="Floor operations"
        title="Orders"
        subtitle={
          showMoney
            ? 'Track purchases, payment, and delivery deadlines.'
            : 'Track items, customers, and delivery deadlines. Money stays with management.'
        }
        actions={
          can('saleCreate') ? (
            <HeroLink to="/store/sales" primary>
              <FiPlus size={14} /> New sale
            </HeroLink>
          ) : null
        }
      />

      <StatGrid cols="3">
        <StatCard
          label="Today's orders"
          value={todayOrders.length}
          icon={<FiShoppingCart size={16} />}
          accent="teal"
        />
        {showMoney ? (
          <StatCard
            label="Today's sales"
            value={`ETB ${formatMoney(todayRevenue)}`}
            icon={<FiCreditCard size={16} />}
            accent="emerald"
          />
        ) : (
          <StatCard
            label="Due soon / overdue"
            value={dueSoon}
            icon={<FiClock size={16} />}
            accent="amber"
          />
        )}
        <StatCard
          label="Rest due"
          value={restDue}
          icon={<FiClock size={16} />}
          accent="slate"
        />
      </StatGrid>

      <Panel
        title="Recent orders"
        action={
          <div className="w-full sm:w-64">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, receipt…"
            />
          </div>
        }
        bodyClassName="p-0 sm:p-0"
      >
        {filtered.length === 0 ? (
          <EmptyState>
            <FiShoppingCart size={28} className="mx-auto mb-2 text-slate-300" />
            No orders found
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-teal-50/70 text-left text-[10px] sm:text-xs uppercase text-teal-800">
                <tr>
                  <th className="px-3 py-2">Receipt</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Items</th>
                  {showMoney && <th className="px-3 py-2">Payment</th>}
                  <th className="px-3 py-2">Order date</th>
                  <th className="px-3 py-2">Deadline</th>
                  {showMoney && <th className="px-3 py-2">Whole</th>}
                  {showMoney && <th className="px-3 py-2">First</th>}
                  <th className="px-3 py-2">Rest</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sale) => (
                  <tr key={sale._id} className="hover:bg-teal-50/40">
                    <td className="px-3 py-2.5 text-xs font-medium text-slate-800 truncate max-w-[120px]">
                      {sale.transactionId}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 text-xs min-w-0">
                        <FiUser className="text-teal-600 shrink-0" size={12} />
                        <span className="truncate">{sale.customerName || 'Walk-in'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">
                      {(sale.items || []).length}
                    </td>
                    {showMoney && (
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          <FiCreditCard size={10} /> {sale.paymentMethod || 'N/A'}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2.5 text-xs">{String(sale.date).slice(0, 10)}</td>
                    <td className="px-3 py-2.5">
                      <DeadlineBadge deadline={sale.deadline} />
                    </td>
                    {showMoney && (
                      <td className="px-3 py-2.5 text-xs font-semibold">
                        ETB {formatMoney(sale.totalAmount)}
                      </td>
                    )}
                    {showMoney && (
                      <td className="px-3 py-2.5 text-xs text-teal-700">
                        ETB {formatMoney(sale.firstPayment)}
                      </td>
                    )}
                    <td className="px-3 py-2.5">
                      {sale.restPaid || Number(sale.restPayment || 0) === 0 ? (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800">
                          Paid
                        </span>
                      ) : showMoney ? (
                        <span className="text-xs text-amber-700 font-medium">
                          ETB {formatMoney(sale.restPayment)}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-100 text-amber-800">
                          Due
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openCustomerDetails(sale)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 text-[11px] font-semibold hover:bg-sky-100"
                        >
                          <FiEye size={13} />
                          View Details
                        </button>
                        {showMoney && canCollect && !sale.restPaid && Number(sale.restPayment || 0) > 0 && (
                          <SoftButton
                            onClick={() => collectRest(sale)}
                            className="bg-amber-500 text-white hover:bg-amber-600"
                          >
                            Collect
                          </SoftButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </PageShell>
  );
};

export default Orders;
