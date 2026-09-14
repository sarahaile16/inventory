import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiDollarSign, FiAlertCircle, FiPlus, FiTruck, FiPackage } from 'react-icons/fi';
import { can, canSeeMoney, getUserRole, ROLES } from '../auth/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const StoreManagement = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productRes, salesRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/sales`).catch(() => ({ data: [] }))
        ]);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      } catch (error) {
        console.error('Error loading store:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isStaff = getUserRole() === ROLES.STAFF;
  const showMoney = canSeeMoney();
  const today = new Date().toLocaleDateString('en-CA');
  const todaySales = sales.filter((sale) => String(sale.date).slice(0, 10) === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const storeValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.storeStock || 0),
    0
  );
  const lowStore = products.filter(
    (product) => Number(product.storeStock || 0) <= Number(product.restockLevel || 0)
  ).length;

  const filtered = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productId?.toString().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6">
      <div className={`rounded-3xl p-6 mb-6 text-white ${isStaff ? 'bg-gradient-to-r from-teal-700 to-emerald-600' : 'bg-gradient-to-r from-slate-900 to-indigo-800'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-white/70 text-sm uppercase tracking-wide">{isStaff ? 'Staff floor' : 'Store desk'}</p>
            <h1 className="text-2xl sm:text-3xl font-bold">Store</h1>
            <p className="text-white/80 mt-1">
              {isStaff
                ? 'Take orders, check floor stock, and help customers. Warehouse add/edit stays with management.'
                : 'Sell from floor stock and restock from the warehouse'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/orders"
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
            >
              View orders
            </Link>
            {can('stockTransfer') && (
              <Link
                to="/stock-movement"
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
              >
                <FiTruck className="mr-2" /> Transfer Stock
              </Link>
            )}
            {can('saleCreate') && (
              <Link
                to="/store/sales"
                className="px-4 py-2 rounded-xl bg-white text-teal-800 font-medium hover:bg-teal-50 flex items-center justify-center"
              >
                <FiPlus className="mr-2" /> New Sale
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FiShoppingBag className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Store Products</p>
          </div>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        {showMoney ? (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FiDollarSign className="text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Store Asset</p>
            </div>
            <p className="text-2xl font-bold">ETB {formatMoney(storeValue)}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-teal-100 rounded-lg mr-3">
                <FiPackage className="text-teal-600" />
              </div>
              <p className="text-sm text-gray-500">Units on floor</p>
            </div>
            <p className="text-2xl font-bold">
              {products.reduce((sum, product) => sum + Number(product.storeStock || 0), 0)}
            </p>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <FiPackage className="text-indigo-600" />
            </div>
            <p className="text-sm text-gray-500">Today's orders</p>
          </div>
          <p className="text-2xl font-bold">{todaySales.length}</p>
          {showMoney && (
            <p className="text-xs text-gray-400 mt-1">ETB {formatMoney(todayRevenue)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <FiAlertCircle className="text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500">Low Store Stock</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{lowStore}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <input
              type="text"
              placeholder="Search store products..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Store</th>
                    <th className="px-4 py-3 text-left">Warehouse</th>
                    {showMoney && <th className="px-4 py-3 text-left">Price</th>}
                    {showMoney && <th className="px-4 py-3 text-left">Store Value</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.productId} · {product.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          Number(product.storeStock || 0) <= Number(product.restockLevel || 0)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.storeStock || 0} {product.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.stock || 0}</td>
                      {showMoney && (
                        <td className="px-4 py-3 text-sm">ETB {Number(product.price || 0).toLocaleString()}</td>
                      )}
                      {showMoney && (
                        <td className="px-4 py-3 text-sm font-medium">
                          ETB {formatMoney(Number(product.price || 0) * Number(product.storeStock || 0))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-800">Recent Sales</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {sales.slice(0, 6).map((sale) => (
              <div key={sale._id} className="p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{sale.customerName || 'Walk-in'}</p>
                    <p className="text-xs text-gray-400">{sale.transactionId} · {sale.date}</p>
                  </div>
                  {showMoney ? (
                    <p className="font-semibold text-green-600">ETB {formatMoney(sale.totalAmount)}</p>
                  ) : (
                    <p className="text-xs text-teal-700">{(sale.items || []).length} items</p>
                  )}
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="p-6 text-sm text-gray-400">No sales recorded yet</p>
            )}
          </div>
          <div className="p-4 border-t">
            <Link to="/store/sales" className="text-blue-600 text-sm hover:underline">
              Open point of sale →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;
