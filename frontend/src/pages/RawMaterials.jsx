import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiPlus, FiMinus, FiBox, FiTrendingDown, FiTrendingUp, FiAlertTriangle, FiTool
} from 'react-icons/fi';
import { can } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  LoadingBlock,
  EmptyState,
  SearchInput,
  HeroLink
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const monthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (key) => {
  const [y, m] = String(key).split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
};

const RawMaterials = () => {
  const canWrite = can('stockTransfer');
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(monthKey());
  const [form, setForm] = useState({
    action: 'receive',
    productId: '',
    quantity: '',
    note: ''
  });

  const load = async () => {
    try {
      setLoading(true);
      const [productRes, movementRes] = await Promise.all([
        axios.get(`${API_URL}/products`),
        axios.get(`${API_URL}/movements`, { params: { type: 'all' } })
      ]);
      const allProducts = Array.isArray(productRes.data) ? productRes.data : [];
      setProducts(allProducts.filter((p) => p.itemType === 'raw'));
      setMovements(Array.isArray(movementRes.data) ? movementRes.data : []);
    } catch (error) {
      console.error('Raw materials load error:', error);
      setMessage('Could not load raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rawIds = useMemo(() => new Set(products.map((p) => String(p._id))), [products]);

  const monthMovements = useMemo(
    () =>
      movements.filter((m) => {
        if (!rawIds.has(String(m.productId))) return false;
        return String(m.date || '').startsWith(selectedMonth);
      }),
    [movements, rawIds, selectedMonth]
  );

  const boughtThisMonth = monthMovements
    .filter((m) => m.type === 'receive')
    .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  const usedThisMonth = monthMovements
    .filter((m) => m.type === 'use')
    .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  const usageByMaterial = useMemo(() => {
    const map = new Map();
    monthMovements
      .filter((m) => m.type === 'use')
      .forEach((m) => {
        const key = m.productName || String(m.productId);
        const row = map.get(key) || { name: key, qty: 0, category: '' };
        row.qty += Number(m.quantity || 0);
        map.set(key, row);
      });
    // attach category from products
    products.forEach((p) => {
      const row = map.get(p.name);
      if (row) row.category = p.category || '';
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty);
  }, [monthMovements, products]);

  const lowStock = products.filter(
    (p) => Number(p.stock || 0) <= Number(p.restockLevel || 0)
  );

  const filtered = products.filter((p) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return (
      p.name?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term) ||
      String(p.productId || '').includes(term)
    );
  });

  const selected = products.find((p) => String(p._id) === String(form.productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.productId) {
      setMessage('Select a raw material');
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
        note: form.note,
        user: JSON.parse(localStorage.getItem('user') || '{}').username || 'admin'
      });
      setMessage(
        form.action === 'receive'
          ? 'Purchase saved — warehouse stock increased'
          : 'Usage saved — warehouse stock decreased'
      );
      setForm((prev) => ({ ...prev, quantity: '', note: '' }));
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not save movement');
    } finally {
      setSaving(false);
    }
  };

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
        tone="teal"
        eyebrow="Warehouse · raw materials"
        title="Raw Materials"
        subtitle="Buy to increase stock, use to decrease — track what production consumed this month."
        actions={
          canWrite ? (
            <HeroLink to="/management" primary>
              <FiPlus size={14} /> Add raw material
            </HeroLink>
          ) : null
        }
      />

      <StatGrid cols="4">
        <StatCard label="Materials" value={products.length} icon={<FiBox size={16} />} accent="teal" />
        <StatCard
          label={`Bought (${monthLabel(selectedMonth).split(' ')[0]})`}
          value={boughtThisMonth}
          icon={<FiTrendingUp size={16} />}
          accent="emerald"
        />
        <StatCard
          label={`Used (${monthLabel(selectedMonth).split(' ')[0]})`}
          value={usedThisMonth}
          icon={<FiTrendingDown size={16} />}
          accent="rose"
        />
        <StatCard
          label="Low stock"
          value={lowStock.length}
          icon={<FiAlertTriangle size={16} />}
          accent="amber"
        />
      </StatGrid>

      {canWrite && (
        <Panel title="Buy or use material" className="mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setForm({ ...form, action: 'receive' })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                form.action === 'receive'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900'
              }`}
            >
              <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl font-bold ${
                form.action === 'receive' ? 'bg-white/20' : 'bg-emerald-600 text-white'
              }`}>+</span>
              <span>
                <span className="block font-bold text-sm">Buy / receive</span>
                <span className="block text-xs opacity-80">Warehouse stock goes UP</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, action: 'use' })}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition ${
                form.action === 'use'
                  ? 'border-rose-600 bg-rose-600 text-white'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl font-bold ${
                form.action === 'use' ? 'bg-white/20' : 'bg-rose-600 text-white'
              }`}>−</span>
              <span>
                <span className="block font-bold text-sm">Use in production</span>
                <span className="block text-xs opacity-80">Warehouse stock goes DOWN</span>
              </span>
            </button>
          </div>

          {products.length === 0 ? (
            <EmptyState>
              No raw materials yet.{' '}
              <Link to="/management" className="text-teal-700 font-semibold underline">
                Add Product → Raw material
              </Link>
            </EmptyState>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Material *</label>
                <select
                  required
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200"
                >
                  <option value="">Select raw material</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · {p.category || '—'} · WH {p.stock || 0} {p.unit || ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={form.action === 'use' ? selected?.stock || undefined : undefined}
                  required
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200"
                  placeholder={form.action === 'receive' ? 'Supplier / invoice' : 'Job / order #'}
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                {message && (
                  <p className={`text-xs mb-2 ${message.toLowerCase().includes('saved') || message.toLowerCase().includes('increased') || message.toLowerCase().includes('decreased') ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 ${
                    form.action === 'use' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {saving ? (
                    'Saving…'
                  ) : form.action === 'receive' ? (
                    <><FiPlus size={16} /> Save purchase</>
                  ) : (
                    <><FiTool size={16} /> Save usage</>
                  )}
                </button>
              </div>
            </form>
          )}
        </Panel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <Panel
          className="lg:col-span-3"
          title="Warehouse stock"
          action={
            <div className="w-full sm:w-52">
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search material…"
              />
            </div>
          }
          bodyClassName="p-0"
        >
          {filtered.length === 0 ? (
            <EmptyState>No materials match</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-teal-50/70 text-left text-[10px] uppercase text-teal-800">
                  <tr>
                    <th className="px-3 py-2">Material</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Warehouse</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => {
                    const low = Number(p.stock || 0) <= Number(p.restockLevel || 0);
                    return (
                      <tr key={p._id} className="hover:bg-teal-50/30">
                        <td className="px-3 py-2.5 text-sm font-medium text-slate-800">{p.name}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{p.category || '—'}</td>
                        <td className="px-3 py-2.5 text-sm font-semibold tabular-nums">{p.stock || 0}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-500">{p.unit || 'PCS'}</td>
                        <td className="px-3 py-2.5">
                          {low ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-100 text-amber-800">Low</span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800">OK</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Used this month"
          action={
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1.5"
            />
          }
        >
          <p className="text-[11px] text-slate-500 mb-3">{monthLabel(selectedMonth)}</p>
          {usageByMaterial.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center border border-dashed rounded-xl">
              No material usage recorded this month yet. Use Decrease (−) when production consumes stock.
            </p>
          ) : (
            <div className="space-y-2">
              {usageByMaterial.map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{row.name}</p>
                    <p className="text-[10px] text-slate-500">{row.category || 'Raw material'}</p>
                  </div>
                  <p className="text-sm font-bold text-rose-700 shrink-0">−{row.qty}</p>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Total used</span>
                <span className="font-bold text-rose-800">{usedThisMonth}</span>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="This month’s buy & use log" bodyClassName="p-0">
        {monthMovements.length === 0 ? (
          <EmptyState>No buy/use movements for {monthLabel(selectedMonth)}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 text-left text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Material</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthMovements
                  .filter((m) => m.type === 'receive' || m.type === 'use')
                  .map((m) => (
                    <tr key={m._id}>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {m.date}{m.time ? ` ${m.time}` : ''}
                      </td>
                      <td className="px-3 py-2 text-sm">{m.productName}</td>
                      <td className="px-3 py-2">
                        {m.type === 'receive' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            <FiPlus size={10} /> Buy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            <FiMinus size={10} /> Use
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm font-semibold tabular-nums">{m.quantity}</td>
                      <td className="px-3 py-2 text-xs text-slate-500 truncate max-w-[160px]">{m.note || '—'}</td>
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

export default RawMaterials;
