import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiEdit, FiTrash2, FiEye, FiUsers, FiBarChart2, FiShoppingBag, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { can, roleLabel } from '../auth/roles';
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

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    totalCustomers: 0,
    restDueNear: 0,
    totalPurchases: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const canEdit = can('productEdit');
  const canDelete = can('productDelete');
  const canCreate = can('productCreate');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, salesRes, customersRes, usersRes, allSalesRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/sales/total`).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_URL}/customers/stats/summary`).catch(() => ({ data: { totalCustomers: 0 } })),
        axios.get(`${API_URL}/auth/users`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/sales`).catch(() => ({ data: [] }))
      ]);

      const productList = Array.isArray(productsRes.data) ? productsRes.data : [];
      setProducts(productList);
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      setPendingUsers(users.filter((user) => user.role === 'user' || user.status === 'Pending'));
      const sales = Array.isArray(allSalesRes.data) ? allSalesRes.data : [];
      setRecentSales(sales.slice(0, 4));
      const restDueNear = sales.filter((sale) => {
        if (sale.restPaid || Number(sale.restPayment || 0) <= 0 || !sale.deadline) return false;
        const due = new Date(sale.deadline);
        const today = new Date();
        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return Math.round((due - today) / 86400000) <= 3;
      }).length;

      const totalProducts = productList.length;
      const lowStockItems = productList.filter((p) => Number(p.stock) <= Number(p.restockLevel)).length;
      const totalValue = productList.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

      setStats({
        totalSales: Number(salesRes.data?.total) || 0,
        totalProducts,
        lowStockItems,
        totalValue,
        totalCustomers: Number(customersRes.data?.totalCustomers) || 0,
        restDueNear,
        totalPurchases: productList.reduce((sum, p) => sum + Number(p.totalPurchase || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productId?.toString().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <PageShell>
        <LoadingBlock />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p>{error}</p>
          <SoftButton
            onClick={fetchDashboardData}
            className="mt-3 bg-teal-700 text-white hover:bg-teal-800"
          >
            Retry
          </SoftButton>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        tone="slate"
        eyebrow="Admin command center"
        title="Full-store overview"
        subtitle="Only admins see this board. Approve new users, watch warehouse value, and jump into inventory or reports."
        actions={
          <>
            <HeroLink to="/users" primary>Manage roles</HeroLink>
            <HeroLink to="/inventory">Warehouse</HeroLink>
            <HeroLink to="/notifications">Deadline alerts</HeroLink>
            <HeroLink to="/analytics">Reports</HeroLink>
          </>
        }
      />

      <StatGrid cols="4">
        <StatCard
          to="/analytics"
          label="Total Sales"
          value={`ETB ${stats.totalSales.toLocaleString()}`}
          icon={<FiBarChart2 size={16} />}
          accent="amber"
        />
        <StatCard
          to="/inventory"
          label="Products"
          value={stats.totalProducts}
          hint={`Bought ETB ${stats.totalPurchases.toLocaleString()}`}
          icon={<FiPackage size={16} />}
          accent="slate"
        />
        <StatCard
          to="/inventory?low=1"
          label="Low stock"
          value={stats.lowStockItems}
          icon={<FiShoppingBag size={16} />}
          accent="amber"
        />
        <StatCard
          to="/notifications"
          label="Rest due near"
          value={stats.restDueNear}
          hint={`${pendingUsers.length} role requests · ${stats.totalCustomers} customers`}
          icon={<FiUsers size={16} />}
          accent="violet"
        />
      </StatGrid>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <Panel
          className="xl:col-span-2"
          title="Latest orders"
          action={
            <Link to="/orders" className="text-xs text-teal-700 hover:underline">
              View all
            </Link>
          }
          bodyClassName="!p-0"
        >
          {recentSales.length === 0 ? (
            <EmptyState>No sales yet</EmptyState>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSales.map((sale) => (
                <div key={sale._id} className="px-3 sm:px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{sale.customerName || 'Walk-in'}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
                      {sale.transactionId} · {String(sale.date).slice(0, 10)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-800">
                      ETB {Number(sale.totalAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-teal-700">
                      First {Number(sale.firstPayment || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-amber-600">
                      {sale.restPaid || Number(sale.restPayment || 0) === 0
                        ? 'Rest paid'
                        : `Rest ${Number(sale.restPayment || 0).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={
            <span className="inline-flex items-center gap-1.5">
              <FiShield className="text-teal-600" size={14} />
              Pending users
            </span>
          }
          action={
            <Link to="/users" className="text-xs text-teal-700 hover:underline">
              Review
            </Link>
          }
        >
          {pendingUsers.length === 0 ? (
            <EmptyState>No role requests waiting.</EmptyState>
          ) : (
            <div className="space-y-2">
              {pendingUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{user.fullName || user.username}</p>
                  <p className="text-[10px] text-slate-500">
                    Wants {roleLabel(user.requestedRole || 'staff')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Warehouse inventory"
        action={
          canCreate ? (
            <Link
              to="/management"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-teal-700 text-white hover:bg-teal-800"
            >
              <FiPackage size={12} /> Add Product
            </Link>
          ) : null
        }
      >
        <div className="mb-3">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by Name, Product ID, Category..."
          />
        </div>

        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:-mx-4">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-3 sm:px-4 py-2.5">No.</th>
                  <th className="px-3 sm:px-4 py-2.5">ID</th>
                  <th className="px-3 sm:px-4 py-2.5">Category</th>
                  <th className="px-3 sm:px-4 py-2.5">Product Name</th>
                  <th className="px-3 sm:px-4 py-2.5">Price</th>
                  <th className="px-3 sm:px-4 py-2.5">Stock</th>
                  <th className="px-3 sm:px-4 py-2.5">Restock</th>
                  <th className="px-3 sm:px-4 py-2.5">Unit</th>
                  <th className="px-3 sm:px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-teal-50/40">
                    <td className="px-3 sm:px-4 py-2.5 text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">{product.productId}</td>
                    <td className="px-3 sm:px-4 py-2.5">{product.category}</td>
                    <td className="px-3 sm:px-4 py-2.5 font-medium text-slate-800">{product.name}</td>
                    <td className="px-3 sm:px-4 py-2.5">ETB {Number(product.price || 0).toLocaleString()}</td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                          Number(product.stock) <= Number(product.restockLevel)
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5">{product.restockLevel}</td>
                    <td className="px-3 sm:px-4 py-2.5">{product.unit}</td>
                    <td className="px-3 sm:px-4 py-2.5">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50"
                          title="View details"
                          onClick={() => navigate(`/inventory?view=${product._id}`)}
                        >
                          <FiEye size={14} />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Edit product"
                            onClick={() => navigate(`/inventory?edit=${product._id}`)}
                          >
                            <FiEdit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete product"
                            onClick={() => handleDelete(product._id, product.name)}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>
            No products found.{' '}
            <Link to="/management" className="text-teal-700 hover:underline">
              Add your first product
            </Link>
          </EmptyState>
        )}

        {filteredProducts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
            <div className="flex gap-1.5">
              <SoftButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`border ${
                  currentPage === 1
                    ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                    : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Previous
              </SoftButton>
              <span className="px-2 py-1.5 text-xs text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <SoftButton
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`border ${
                  currentPage === totalPages
                    ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                    : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Next
              </SoftButton>
            </div>
          </div>
        )}
      </Panel>
    </PageShell>
  );
};

export default Dashboard;
