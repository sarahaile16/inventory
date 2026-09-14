import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiEdit, FiTrash2, FiEye, FiUsers, FiBarChart2, FiShoppingBag, FiShield } from 'react-icons/fi';
import axios from 'axios';
import { can, roleLabel } from '../auth/roles';

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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <p>{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 p-6 sm:p-8 text-white mb-6 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-400/10" />
        <div className="relative">
          <p className="text-amber-300 text-sm uppercase tracking-[0.2em]">Admin command center</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">Full-store overview</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">
            Only admins see this board. Approve new users, watch warehouse value, and jump into inventory or reports.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link to="/users" className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-medium hover:bg-amber-300">
              Manage roles
            </Link>
            <Link to="/inventory" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
              Warehouse
            </Link>
            <Link to="/notifications" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
              Deadline alerts
            </Link>
            <Link to="/analytics" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">
              Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <Link to="/analytics" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <FiBarChart2 />
          </div>
          <p className="text-gray-500 text-sm">Total Sales</p>
          <p className="text-2xl font-bold">ETB {stats.totalSales.toLocaleString()}</p>
        </Link>
        <Link to="/inventory" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
            <FiPackage />
          </div>
          <p className="text-gray-500 text-sm">Products</p>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400 mt-1">Bought ETB {stats.totalPurchases.toLocaleString()}</p>
        </Link>
        <Link to="/inventory?low=1" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-3">
            <FiShoppingBag />
          </div>
          <p className="text-gray-500 text-sm">Low stock</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
        </Link>
        <Link to="/notifications" className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
            <FiUsers />
          </div>
          <p className="text-gray-500 text-sm">Rest due near deadline</p>
          <p className="text-2xl font-bold text-indigo-700">{stats.restDueNear}</p>
          <p className="text-xs text-gray-400 mt-1">{pendingUsers.length} role requests · {stats.totalCustomers} customers</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Latest orders</h2>
            <Link to="/orders" className="text-sm text-amber-700 hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {recentSales.length === 0 && <p className="p-5 text-sm text-gray-500">No sales yet</p>}
            {recentSales.map((sale) => (
              <div key={sale._id} className="px-5 py-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{sale.customerName || 'Walk-in'}</p>
                  <p className="text-xs text-gray-500">{sale.transactionId} · {String(sale.date).slice(0, 10)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold">ETB {Number(sale.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-teal-700">First {Number(sale.firstPayment || 0).toLocaleString()}</p>
                  <p className="text-xs text-amber-600">
                    {sale.restPaid || Number(sale.restPayment || 0) === 0
                      ? 'Rest paid'
                      : `Rest ${Number(sale.restPayment || 0).toLocaleString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950 text-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-amber-400" />
            <h2 className="font-semibold">Pending users</h2>
          </div>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-slate-400">No role requests waiting.</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="rounded-xl bg-white/5 p-3">
                  <p className="font-medium">{user.fullName || user.username}</p>
                  <p className="text-xs text-slate-400">Wants {roleLabel(user.requestedRole || 'staff')}</p>
                </div>
              ))}
              <Link to="/users" className="block text-center text-sm text-amber-300 hover:text-amber-200">
                Review accounts
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Warehouse inventory</h2>
            {canCreate && (
              <Link
                to="/management"
                className="bg-slate-950 text-white px-4 py-2 rounded-lg hover:bg-slate-800 text-sm flex items-center justify-center"
              >
                <FiPackage className="mr-2" /> Add Product
              </Link>
            )}
          </div>
          <input
            type="text"
            placeholder="Search by Name, Product ID, Category..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restock</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-slate-50">
                    <td className="px-4 sm:px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 sm:px-6 py-4">{product.productId}</td>
                    <td className="px-4 sm:px-6 py-4">{product.category}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-4 sm:px-6 py-4">ETB {Number(product.price || 0).toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        Number(product.stock) <= Number(product.restockLevel)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">{product.restockLevel}</td>
                    <td className="px-4 sm:px-6 py-4">{product.unit}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800"
                          title="View details"
                          onClick={() => navigate(`/inventory?view=${product._id}`)}
                        >
                          <FiEye size={18} />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            className="text-green-600 hover:text-green-800"
                            title="Edit product"
                            onClick={() => navigate(`/inventory?edit=${product._id}`)}
                          >
                            <FiEdit size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            title="Delete product"
                            onClick={() => handleDelete(product._id, product.name)}
                          >
                            <FiTrash2 size={18} />
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
          <div className="text-center py-12 text-gray-500 px-4">
            <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No products found</p>
            <Link to="/management" className="text-blue-500 hover:underline mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
