import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  FiTag, FiDollarSign, FiTruck, FiMapPin,
  FiHash, FiCheckCircle, FiAlertCircle, FiArrowRight, FiBox
} from 'react-icons/fi';
import {
  PageShell,
  PageHero,
  Panel,
  SoftButton,
  HeroLink
} from '../components/ui/PageChrome';

const emptyForm = {
  name: '',
  category: '',
  itemType: 'finished',
  stock: '',
  price: '',
  purchaseCost: '',
  supplier: '',
  restockLevel: '',
  location: '',
  batchNumber: '',
  unit: 'PCS',
  itemId: '',
  serialNumber: '',
  expiryDate: '',
  partNumber: ''
};

const AddProduct = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [finishedCategories, setFinishedCategories] = useState([]);
  const [rawCategories, setRawCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const [finishedRes, rawRes] = await Promise.all([
        axios.get(`${API_URL}/settings/categories`, { params: { type: 'finished' } }),
        axios.get(`${API_URL}/settings/categories`, { params: { type: 'raw' } })
      ]);
      setFinishedCategories(Array.isArray(finishedRes.data) ? finishedRes.data : []);
      setRawCategories(Array.isArray(rawRes.data) ? rawRes.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const categories = formData.itemType === 'raw' ? rawCategories : finishedCategories;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      // Switching type resets category so finished/raw lists stay valid
      if (name === 'itemType') {
        next.category = '';
      }
      return next;
    });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const totalPurchase = Number(formData.purchaseCost || 0) * Number(formData.stock || 0);
  const margin =
    Number(formData.price || 0) > 0 && Number(formData.purchaseCost || 0) >= 0
      ? Number(formData.price || 0) - Number(formData.purchaseCost || 0)
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const stock = Number(formData.stock || 0);
      const purchaseCost = Number(formData.purchaseCost || 0);
      await axios.post(`${API_URL}/products`, {
        ...formData,
        purchaseCost,
        totalPurchase: purchaseCost * stock,
        restockLevel:
          formData.restockLevel === '' || formData.restockLevel == null
            ? 0
            : Number(formData.restockLevel)
      });
      setMessage({
        type: 'success',
        text: formData.itemType === 'raw'
          ? `${formData.name} raw material added (${stock} ${formData.unit}). Open Raw Materials to buy more or record usage.`
          : `${formData.name} added to warehouse (${stock} ${formData.unit}). Use Stock Movement to transfer to store.`
      });
      setFormData(emptyForm);
    } catch (error) {
      console.error('Error creating product:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not create product. Check your login role and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/35 focus:border-teal-600 transition';
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Warehouse intake"
        title="Add product"
        subtitle="New furniture goes into the warehouse first. Transfer pieces to the store floor later in Stock Movement."
        actions={<HeroLink to="/inventory">View inventory</HeroLink>}
      />

      {message.text && (
        <div
          className={`mb-4 rounded-xl px-3 py-2.5 text-xs flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
              : 'bg-rose-50 border border-rose-100 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <FiCheckCircle className="mt-0.5 shrink-0" size={14} />
          ) : (
            <FiAlertCircle className="mt-0.5 shrink-0" size={14} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <FiBox size={14} />
              </span>
              Product
            </span>
          }
        >
          <p className="text-[10px] text-slate-500 -mt-1 mb-3">
            Finished furniture or raw materials (wood, fabric, foam, etc.)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>
                Product name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder={
                  formData.itemType === 'raw'
                    ? 'e.g. Oak plank, Foam sheet, Fabric roll'
                    : 'e.g. Oak dining table 6-seater'
                }
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Item type <span className="text-rose-500">*</span>
              </label>
              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="finished">Finished product (for sale)</option>
                <option value="raw">Raw material (buy & use)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiTag className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`${inputClass} pl-9`}
                  required
                >
                  <option value="">
                    {formData.itemType === 'raw'
                      ? 'Select raw material type'
                      : 'Select finished product category'}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {formData.itemType === 'raw'
                  ? 'Categories for furniture inputs: wood, foam, fabric, hardware…'
                  : 'Categories for finished furniture ready to sell'}
              </p>
            </div>

            <div>
              <label className={labelClass}>Unit</label>
              <select name="unit" value={formData.unit} onChange={handleChange} className={inputClass}>
                <option value="PCS">PCS — pieces</option>
                <option value="SET">SET — set</option>
                <option value="UNIT">UNIT</option>
                <option value="KG">KG — kilograms</option>
                <option value="M">M — meters</option>
                <option value="L">L — litres</option>
                <option value="BOX">BOX</option>
              </select>
            </div>
          </div>
          {formData.itemType === 'raw' && (
            <p className="mt-3 text-[11px] text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
              Raw material: starting qty goes into <strong>warehouse</strong>. After saving, open{' '}
              <Link to="/raw-materials" className="font-semibold underline">Raw Materials</Link>
              {' '}to buy more (+) or record usage (−) and see monthly consumption.
            </p>
          )}
        </Panel>

        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FiDollarSign size={14} />
              </span>
              Stock & money
            </span>
          }
          action={
            <div className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1.5 text-right">
              <p className="text-[9px] uppercase tracking-wide text-amber-700">Total purchase</p>
              <p className="text-sm font-bold text-amber-900">
                ETB {totalPurchase.toLocaleString()}
              </p>
            </div>
          }
        >
          <p className="text-[10px] text-slate-500 -mt-1 mb-3">Warehouse qty, sell price, and what you paid</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Warehouse stock <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={inputClass}
                placeholder="How many arrived"
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Restock level <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                name="restockLevel"
                min="0"
                value={formData.restockLevel}
                onChange={handleChange}
                className={inputClass}
                placeholder="Warn below this qty"
              />
            </div>

            <div>
              <label className={labelClass}>
                Selling price (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={inputClass}
                placeholder="Customer price"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">What the buyer pays</p>
            </div>

            <div>
              <label className={labelClass}>
                Purchase cost / unit (ETB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="purchaseCost"
                min="0"
                step="0.01"
                value={formData.purchaseCost}
                onChange={handleChange}
                className={inputClass}
                placeholder="Supplier cost"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {formData.price !== '' && formData.purchaseCost !== ''
                  ? `Margin per unit ≈ ETB ${margin.toLocaleString()}`
                  : 'What you paid the supplier'}
              </p>
            </div>

            <div>
              <label className={labelClass}>Supplier</label>
              <div className="relative">
                <FiTruck className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className={`${inputClass} pl-9`}
                  placeholder="Who you bought from"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Warehouse location</label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`${inputClass} pl-9`}
                  placeholder="e.g. Main warehouse — Aisle B"
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title={
            <span className="inline-flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <FiHash size={14} />
              </span>
              More details
            </span>
          }
          action={
            <SoftButton
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="text-teal-700 hover:bg-teal-50"
            >
              {showMore ? 'Hide' : 'Show'}
            </SoftButton>
          }
        >
          <p className="text-[10px] text-slate-500 -mt-1">Batch, item ID, serial — optional</p>
          {showMore && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <label className={labelClass}>Batch number</label>
                <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Item ID</label>
                <input type="text" name="itemId" value={formData.itemId} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Serial number</label>
                <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Part number</label>
                <input type="text" name="partNumber" value={formData.partNumber} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Expiry date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          )}
        </Panel>

        <div className="sticky bottom-3 z-10 rounded-xl border border-teal-100 bg-white/95 backdrop-blur px-3 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-lg shadow-slate-900/5">
          <p className="text-[10px] text-slate-500 text-center sm:text-left">
            After saving, stock stays in <strong>warehouse</strong> until you transfer it to the store.
          </p>
          <div className="flex gap-1.5">
            <SoftButton
              type="button"
              onClick={() => {
                setFormData(emptyForm);
                setMessage({ type: '', text: '' });
              }}
              className="flex-1 sm:flex-none border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Clear
            </SoftButton>
            <SoftButton
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none px-4 bg-teal-700 hover:bg-teal-800 text-white disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save to warehouse'}
              {!loading && <FiArrowRight size={12} />}
            </SoftButton>
          </div>
        </div>
      </form>
    </PageShell>
  );
};

export default AddProduct;
