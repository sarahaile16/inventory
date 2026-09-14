import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiArrowRight, FiTruck } from 'react-icons/fi';
import { can } from '../auth/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const StockMovement = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    productId: '',
    quantity: '',
    direction: 'to-store',
    note: ''
  });

  const loadData = async (type = filter) => {
    try {
      setLoading(true);
      const [productRes, movementRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/movements`, { params: { type } })
      ]);
      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setMovements(Array.isArray(movementRes.data) ? movementRes.data : []);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filter);
  }, [filter]);

  const selectedProduct = products.find((product) => String(product._id) === String(form.productId));
  const available = form.direction === 'to-store'
    ? Number(selectedProduct?.stock || 0)
    : Number(selectedProduct?.storeStock || 0);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      setSaving(true);
      await axios.post(`${API_URL}/movements`, {
        ...form,
        quantity: Number(form.quantity),
        user: JSON.parse(localStorage.getItem('user') || '{}').username || 'admin'
      });
      setForm({ productId: form.productId, quantity: '', direction: form.direction, note: '' });
      setMessage('Stock transferred successfully');
      await loadData(filter);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  const transfersToday = movements.filter((item) => {
    const today = new Date().toLocaleDateString('en-CA');
    return item.date === today && item.type === 'transfer';
  }).length;

  const unitsIn = movements
    .filter((item) => item.direction === 'to-store')
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const unitsOut = movements
    .filter((item) => item.direction === 'to-warehouse' || item.type === 'sale')
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Stock Movement</h1>
        <p className="text-gray-600">Move stock between warehouse and store, and keep a full history</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Transfers today</p>
          <p className="text-2xl font-bold mt-1">{transfersToday}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Moved to store</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{unitsIn}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Moved out / sold</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{unitsOut}</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${can('stockTransfer') ? 'xl:grid-cols-3' : ''}`}>
        {can('stockTransfer') && (
        <form onSubmit={handleTransfer} className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center">
            <FiTruck className="mr-2" /> New Transfer
          </h2>

          {message && (
            <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <label className="block text-sm text-gray-600 mb-1">Product</label>
          <select
            required
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
            className="w-full mb-4 px-3 py-2 border rounded-lg"
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} · WH {product.stock || 0} / Store {product.storeStock || 0}
              </option>
            ))}
          </select>

          <label className="block text-sm text-gray-600 mb-1">Direction</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: 'to-store' })}
              className={`px-3 py-2 rounded-lg border text-sm ${
                form.direction === 'to-store' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white'
              }`}
            >
              Warehouse → Store
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, direction: 'to-warehouse' })}
              className={`px-3 py-2 rounded-lg border text-sm ${
                form.direction === 'to-warehouse' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white'
              }`}
            >
              Store → Warehouse
            </button>
          </div>

          <label className="block text-sm text-gray-600 mb-1">Quantity</label>
          <input
            type="number"
            min="1"
            max={available || undefined}
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="w-full mb-2 px-3 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-400 mb-4">
            Available: {selectedProduct ? `${available} ${selectedProduct.unit || ''}` : 'select a product'}
          </p>

          <label className="block text-sm text-gray-600 mb-1">Note</label>
          <input
            type="text"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Optional reason"
            className="w-full mb-4 px-3 py-2 border rounded-lg"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-500 text-white py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-60 flex items-center justify-center"
          >
            Transfer
            <FiArrowRight className="ml-2" />
          </button>
        </form>
        )}

        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-semibold text-gray-800">Movement History</h2>
            <div className="flex flex-wrap gap-2">
              {['all', 'transfer', 'sale', 'return'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                    filter === type ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">From → To</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movements.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.date} {item.time}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{item.productName}</p>
                        <p className="text-xs text-gray-400">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          item.type === 'sale'
                            ? 'bg-green-100 text-green-800'
                            : item.type === 'return'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.from} → {item.to}</td>
                      <td className="px-4 py-3 font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {movements.length === 0 && (
                <p className="p-8 text-center text-gray-400">No movements found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovement;
