import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowRight, FiTruck, FiPlusCircle, FiMinusCircle, FiTrash2, FiTool
} from 'react-icons/fi';
import { can, getUserRole } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  LoadingBlock,
  EmptyState
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const MORE_ACTIONS = [
  {
    id: 'transfer',
    label: 'Transfer to store',
    help: 'Finished goods: warehouse → store',
    icon: FiTruck
  },
  {
    id: 'return',
    label: 'Return to warehouse',
    help: 'Store → warehouse',
    icon: FiArrowRight
  },
  {
    id: 'adjust',
    label: 'Write-off',
    help: 'Damaged / lost stock',
    icon: FiMinusCircle
  }
];

const inputClass =
  'w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30';

const StockMovement = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    action: 'receive',
    productId: '',
    quantity: '',
    direction: 'to-store',
    location: 'warehouse',
    note: ''
  });

  const canWrite = can('stockTransfer');
  const role = getUserRole();

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
      setMessage('Could not load stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(filter);
  }, [filter]);

  const selectedProduct = products.find((product) => String(product._id) === String(form.productId));

  const available = (() => {
    if (!selectedProduct) return 0;
    if (form.action === 'receive') return null;
    if (form.action === 'use') return Number(selectedProduct.stock || 0);
    if (form.action === 'adjust') {
      return form.location === 'store'
        ? Number(selectedProduct.storeStock || 0)
        : Number(selectedProduct.stock || 0);
    }
    if (form.action === 'return') return Number(selectedProduct.storeStock || 0);
    return Number(selectedProduct.stock || 0);
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.productId) {
      setMessage('Please select a product first');
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setMessage('Enter a quantity greater than 0');
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API_URL}/movements`, {
        action: form.action,
        productId: form.productId,
        quantity: Number(form.quantity),
        direction: form.action === 'return' ? 'to-warehouse' : 'to-store',
        location: form.location,
        note: form.note,
        user: JSON.parse(localStorage.getItem('user') || '{}').username || 'admin'
      });
      setForm((prev) => ({ ...prev, quantity: '', note: '' }));
      setMessage(
        form.action === 'receive'
          ? 'Stock increased (buy / receive saved)'
          : form.action === 'use'
            ? 'Stock decreased (materials used)'
            : 'Stock movement saved successfully'
      );
      await loadData(filter);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save movement');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = async (id) => {
    if (!window.confirm('Undo this movement and reverse the stock change?')) return;
    setMessage('');
    try {
      await axios.delete(`${API_URL}/movements/${id}`);
      setMessage('Movement undone successfully');
      await loadData(filter);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not undo movement');
    }
  };

  const transfersToday = movements.filter((item) => {
    const today = new Date().toLocaleDateString('en-CA');
    return (
      item.date === today &&
      ['transfer', 'receive', 'adjust', 'use', 'return'].includes(item.type)
    );
  }).length;

  const unitsIn = movements
    .filter((item) => item.direction === 'to-store' || item.type === 'receive' || item.direction === 'in')
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const unitsOut = movements
    .filter(
      (item) =>
        item.direction === 'to-warehouse' ||
        item.type === 'sale' ||
        item.type === 'adjust' ||
        item.type === 'use' ||
        item.direction === 'out'
    )
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const actionTitle =
    form.action === 'receive'
      ? 'Increase stock'
      : form.action === 'use'
        ? 'Decrease stock'
        : MORE_ACTIONS.find((a) => a.id === form.action)?.label || 'Stock change';

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Warehouse stock control"
        title="Stock Movement"
        subtitle="Tap Increase (+) to buy / receive stock, or Decrease (−) to use materials."
      />

      {!canWrite && (
        <div className="mb-4 rounded-xl bg-amber-50 text-amber-800 text-xs px-3 py-2.5">
          Your account ({role || 'unknown'}) can only view history. Log in as <strong>admin</strong> or{' '}
          <strong>manager</strong> to increase or decrease stock.
        </div>
      )}

      {canWrite ? (
        <Panel title="Change quantity" className="mb-4">
          {/* Big primary buttons — always visible for admin / management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, action: 'receive' })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition active:scale-[0.99] ${
                form.action === 'receive'
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400'
              }`}
            >
              <span
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-bold ${
                  form.action === 'receive' ? 'bg-white/20' : 'bg-emerald-600 text-white'
                }`}
              >
                +
              </span>
              <span>
                <span className="block text-base font-bold">Increase stock</span>
                <span className={`block text-xs mt-0.5 ${form.action === 'receive' ? 'text-emerald-50' : 'text-emerald-800/80'}`}>
                  Buy / receive → quantity goes UP
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setForm({ ...form, action: 'use' })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition active:scale-[0.99] ${
                form.action === 'use'
                  ? 'border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-600/25'
                  : 'border-rose-200 bg-rose-50 text-rose-900 hover:border-rose-400'
              }`}
            >
              <span
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-bold ${
                  form.action === 'use' ? 'bg-white/20' : 'bg-rose-600 text-white'
                }`}
              >
                −
              </span>
              <span>
                <span className="block text-base font-bold">Decrease stock</span>
                <span className={`block text-xs mt-0.5 ${form.action === 'use' ? 'text-rose-50' : 'text-rose-800/80'}`}>
                  Use in production → quantity goes DOWN
                </span>
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            Selected: <span className="font-semibold text-slate-800">{actionTitle}</span>
            {' · '}
            For <strong>raw materials</strong>: Increase when you buy, Decrease when production uses them.
          </p>

          <div className="mb-3 rounded-xl border border-teal-100 bg-teal-50/70 px-3 py-2.5 text-[11px] text-teal-900">
            <p className="font-semibold mb-0.5">Raw material warehouse control</p>
            <p>
              1) Add Product → choose <strong>Raw material</strong> · 2) Here tap <strong>Increase (+)</strong> when you buy more ·
              3) Tap <strong>Decrease (−)</strong> when wood/fabric/foam is used — warehouse qty goes down.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {MORE_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => setForm({ ...form, action: action.id })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    form.action === action.id
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                  }`}
                >
                  <Icon size={13} />
                  {action.label}
                </button>
              );
            })}
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">
              No products yet. First add an item in{' '}
              <Link to="/management" className="text-teal-700 font-semibold underline">
                Add Product
              </Link>
              {' '}(choose Raw material or Finished), then come back here to increase / decrease quantity.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {message && (
                <div
                  className={`px-3 py-2 rounded-lg text-xs ${
                    message.toLowerCase().includes('success') ||
                    message.toLowerCase().includes('increased') ||
                    message.toLowerCase().includes('decreased')
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {message}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Product *</label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Select product / material</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.itemType === 'raw' ? '[Raw] ' : ''}
                      {product.name} · WH {product.stock || 0}
                      {product.itemType !== 'raw' ? ` / Store ${product.storeStock || 0}` : ''}
                      {product.unit ? ` ${product.unit}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {form.action === 'adjust' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Remove from</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, location: 'warehouse' })}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        form.location === 'warehouse'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      Warehouse
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, location: 'store' })}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        form.location === 'store'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      Store
                    </button>
                  </div>
                </div>
              )}

              {(form.action === 'transfer' || form.action === 'return') && selectedProduct && (
                <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-700">
                  {form.action === 'transfer'
                    ? `Moving Warehouse → Store (WH ${selectedProduct.stock || 0} · Store ${selectedProduct.storeStock || 0})`
                    : `Moving Store → Warehouse (Store ${selectedProduct.storeStock || 0} · WH ${selectedProduct.stock || 0})`}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Quantity *{' '}
                  <span className="font-normal text-slate-400">
                    {form.action === 'receive'
                      ? '(will be added)'
                      : form.action === 'use'
                        ? '(will be removed)'
                        : ''}
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={available == null ? undefined : available || undefined}
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="e.g. 10"
                  className={inputClass}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {form.action === 'receive'
                    ? 'This amount will be ADDED to warehouse stock.'
                    : form.action === 'use'
                      ? selectedProduct
                        ? `Available to use: ${available} ${selectedProduct.unit || ''}`
                        : 'Select a product first'
                      : selectedProduct
                        ? `Available: ${available} ${selectedProduct.unit || ''}`
                        : 'Select a product first'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder={
                    form.action === 'receive'
                      ? 'e.g. Bought from supplier'
                      : form.action === 'use'
                        ? 'e.g. Used for sofa #12'
                        : 'Optional note'
                  }
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg ${
                  form.action === 'use' || form.action === 'adjust'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {saving ? (
                  'Saving…'
                ) : form.action === 'receive' ? (
                  <>
                    <FiPlusCircle size={18} /> Save — Increase stock
                  </>
                ) : form.action === 'use' ? (
                  <>
                    <FiTool size={18} /> Save — Decrease stock
                  </>
                ) : (
                  <>
                    Save movement <FiArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}
        </Panel>
      ) : null}

      <StatGrid cols="3">
        <StatCard label="Actions today" value={transfersToday} accent="teal" />
        <StatCard label="Added (buy)" value={unitsIn} accent="emerald" />
        <StatCard label="Removed (use / out)" value={unitsOut} accent="rose" />
      </StatGrid>

      <Panel
        title="Movement history"
        action={
          <div className="flex flex-wrap gap-1">
            {['all', 'receive', 'use', 'transfer', 'return', 'adjust'].map((type) => (
              <SoftButton
                key={type}
                onClick={() => setFilter(type)}
                className={`capitalize ${
                  filter === type
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'receive' ? 'buy' : type}
              </SoftButton>
            ))}
          </div>
        }
        bodyClassName="p-0 sm:p-0"
      >
        {loading ? (
          <LoadingBlock />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 text-[10px] sm:text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">From → To</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Note</th>
                  {canWrite && <th className="px-3 py-2 text-left">Manage</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((item) => (
                  <tr key={item._id} className="hover:bg-teal-50/40">
                    <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {item.date} {item.time}
                    </td>
                    <td className="px-3 py-2.5 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">{item.sku}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded-md capitalize ${
                          item.type === 'receive'
                            ? 'bg-teal-100 text-teal-800'
                            : item.type === 'use'
                              ? 'bg-violet-100 text-violet-800'
                              : item.type === 'adjust'
                                ? 'bg-rose-100 text-rose-800'
                                : item.type === 'return'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {item.type === 'receive' ? 'buy (+)' : item.type === 'use' ? 'use (−)' : item.type}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 truncate max-w-[140px]">
                      {item.from} → {item.to}
                    </td>
                    <td className="px-3 py-2.5 text-sm font-semibold">{item.quantity}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 truncate max-w-[120px]">
                      {item.note || '—'}
                    </td>
                    {canWrite && (
                      <td className="px-3 py-2.5">
                        {['transfer', 'receive', 'adjust', 'return', 'use'].includes(item.type) ? (
                          <SoftButton
                            onClick={() => handleUndo(item._id)}
                            className="text-rose-600 hover:bg-rose-50"
                            title="Undo and reverse stock"
                          >
                            <FiTrash2 size={12} /> Undo
                          </SoftButton>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && (
              <EmptyState>No movements yet. Use Increase / Decrease above to change stock.</EmptyState>
            )}
          </div>
        )}
      </Panel>
    </PageShell>
  );
};

export default StockMovement;
