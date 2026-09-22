import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { can, canSeeMoney } from '../auth/roles';
import {
  FiSearch, FiEdit, FiTrash2, FiEye, FiPlus,
  FiArrowLeft, FiArrowRight, FiX, FiSave,
  FiPackage, FiDollarSign, FiTag, FiBox,
  FiUpload, FiCamera, FiImage, FiAlertCircle
} from 'react-icons/fi';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  HeroLink,
  LoadingBlock,
  EmptyState
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/35 focus:border-teal-600 transition';

const Inventory = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState(searchParams.get('low') === '1' ? 'low' : 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const canEdit = can('productEdit');
  const canDelete = can('productDelete');
  const canCreate = can('productCreate');
  const showMoney = canSeeMoney();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products, stockFilter]);

  useEffect(() => {
    if (!products.length) return;

    const viewId = searchParams.get('view');
    const editId = searchParams.get('edit');
    const match = (id) => products.find((p) => String(p._id) === String(id));

    if (viewId) {
      const product = match(viewId);
      if (product) handleView(product);
      setSearchParams({}, { replace: true });
    } else if (editId && canEdit) {
      const product = match(editId);
      if (product) handleEdit(product);
      setSearchParams({}, { replace: true });
    }
  }, [products, searchParams, setSearchParams]);

  const flash = (text) => {
    setToast(text);
    setTimeout(() => setToast(''), 2800);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      const list = Array.isArray(response.data) ? response.data : [];
      setProducts(list);
      setFilteredProducts(list);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/settings/categories`);
      const list = Array.isArray(response.data)
        ? response.data.map((cat) => (typeof cat === 'string' ? cat : cat.name || cat.label)).filter(Boolean)
        : [];
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (stockFilter === 'low') {
      filtered = filtered.filter((product) => Number(product.stock) <= Number(product.restockLevel || 0));
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(term) ||
        product.productId?.toString().includes(searchTerm) ||
        product.category?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct({ ...product });
    setImagePreview(product.image || null);
    setShowEditModal(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await axios.delete(`${API_URL}/products/${productToDelete._id}`);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      flash('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      flash(error.response?.data?.message || 'Could not delete product');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct?.name || !selectedProduct?.category) {
      flash('Product name and category are required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: Number(selectedProduct.price) || 0,
        stock: Number(selectedProduct.stock) || 0,
        restockLevel: Number(selectedProduct.restockLevel) || 0,
        location: selectedProduct.location || '',
        unit: selectedProduct.unit || 'PCS',
        batchNumber: selectedProduct.batchNumber || '',
        itemId: selectedProduct.itemId || '',
        serialNumber: selectedProduct.serialNumber || '',
        expiryDate: selectedProduct.expiryDate || '',
        partNumber: selectedProduct.partNumber || '',
        image: uploadedImage && imagePreview ? imagePreview : selectedProduct.image
      };

      const response = await axios.put(`${API_URL}/products/${selectedProduct._id}`, payload);

      setProducts(products.map((p) =>
        String(p._id) === String(selectedProduct._id) ? response.data : p
      ));
      setShowEditModal(false);
      setSelectedProduct(null);
      setUploadedImage(null);
      setImagePreview(null);
      flash('Product updated');
    } catch (error) {
      console.error('Error updating product:', error);
      flash(error.response?.data?.message || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  const lowStockCount = products.filter((p) => Number(p.stock) <= Number(p.restockLevel || 0) && Number(p.restockLevel || 0) > 0).length;
  const warehouseUnits = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const sellingValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0);
  const purchaseValue = products.reduce(
    (sum, p) => sum + Number(p.totalPurchase || (p.purchaseCost || 0) * (p.stock || 0)),
    0
  );

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Warehouse catalog"
        title="Inventory"
        subtitle="Browse warehouse stock, update furniture details, and watch low-stock items."
        actions={
          <>
            <HeroLink to="/stock-movement">Stock movement</HeroLink>
            {canCreate && (
              <SoftButton
                onClick={() => navigate('/management')}
                className="bg-white text-teal-800 hover:bg-teal-50"
              >
                <FiPlus size={12} /> Add product
              </SoftButton>
            )}
          </>
        }
      />

      {toast && (
        <div className="mb-3 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 text-xs px-3 py-2.5 flex items-center gap-2">
          <FiAlertCircle className="shrink-0" size={14} /> {toast}
        </div>
      )}

      <StatGrid cols="4">
        <StatCard
          label="Total products"
          value={products.length}
          icon={<FiPackage size={16} />}
          accent="teal"
        />
        <StatCard
          label={showMoney ? 'Selling value' : 'Warehouse units'}
          value={showMoney ? `ETB ${sellingValue.toLocaleString()}` : warehouseUnits}
          icon={<FiDollarSign size={16} />}
          accent="emerald"
        />
        <StatCard
          label="Categories"
          value={categories.length}
          icon={<FiTag size={16} />}
          accent="amber"
        />
        <StatCard
          label="Low stock"
          value={lowStockCount}
          icon={<FiBox size={16} />}
          accent="rose"
        />
      </StatGrid>

      {showMoney && (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2.5 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
          <span>Total purchase cost on hand (what you paid suppliers)</span>
          <span className="text-sm font-bold">ETB {purchaseValue.toLocaleString()}</span>
        </div>
      )}

      <Panel
        title="Products"
        action={
          canCreate ? (
            <SoftButton
              onClick={() => navigate('/management')}
              className="bg-teal-700 text-white hover:bg-teal-800"
            >
              <FiPlus size={12} /> Add product
            </SoftButton>
          ) : null
        }
      >
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-2 mb-3">
          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search name, ID, category…"
              className={`${inputClass} pl-9`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className={`${inputClass} lg:w-44`}
          >
            <option value="all">All stock</option>
            <option value="low">Low stock only</option>
          </select>
        </div>

        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <div className="overflow-x-auto -mx-3 sm:-mx-4">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-teal-50/60">
                  <tr className="text-left text-[10px] font-semibold text-teal-800/70 uppercase tracking-wide">
                    <th className="px-3 py-2.5">No.</th>
                    <th className="px-3 py-2.5">Item</th>
                    <th className="px-3 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Category</th>
                    {showMoney && <th className="px-3 py-2.5">Sell price</th>}
                    {showMoney && <th className="px-3 py-2.5">Total purchase</th>}
                    <th className="px-3 py-2.5">WH stock</th>
                    <th className="px-3 py-2.5">Store</th>
                    <th className="px-3 py-2.5">Restock</th>
                    <th className="px-3 py-2.5">Unit</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentItems.map((product, index) => {
                    const isLow = Number(product.restockLevel || 0) > 0 && Number(product.stock) <= Number(product.restockLevel);
                    return (
                      <tr key={product._id} className="hover:bg-teal-50/40 transition">
                        <td className="px-3 py-2.5 text-xs text-slate-500">{indexOfFirstItem + index + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                <FiImage size={14} />
                              </div>
                            )}
                            <span className="font-medium text-slate-800 text-sm">{product.name}</span>
                            {product.itemType === 'raw' && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 uppercase">
                                Raw
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{product.productId}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {product.category}
                          </span>
                        </td>
                        {showMoney && (
                          <td className="px-3 py-2.5 text-xs font-medium">ETB {Number(product.price || 0).toLocaleString()}</td>
                        )}
                        {showMoney && (
                          <td className="px-3 py-2.5 text-xs text-amber-800">
                            ETB {Number(product.totalPurchase || (product.purchaseCost || 0) * (product.stock || 0)).toLocaleString()}
                          </td>
                        )}
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                            isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{product.storeStock || 0}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{product.restockLevel || '—'}</td>
                        <td className="px-3 py-2.5 text-xs text-slate-600">{product.unit}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => handleView(product)}
                              className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                              title="View"
                            >
                              <FiEye size={14} />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                                title="Edit"
                              >
                                <FiEdit size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteClick(product)}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {currentItems.length === 0 && (
                <div className="text-center py-8">
                  <EmptyState>No products found. Add furniture from Add Product to fill the warehouse.</EmptyState>
                  {canCreate && (
                    <SoftButton
                      onClick={() => navigate('/management')}
                      className="bg-teal-700 text-white hover:bg-teal-800"
                    >
                      <FiPlus size={12} /> Add product
                    </SoftButton>
                  )}
                </div>
              )}
            </div>

            {filteredProducts.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length}
                </p>
                <div className="flex gap-1.5">
                  <SoftButton
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`border ${
                      currentPage === 1
                        ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <FiArrowLeft size={12} /> Previous
                  </SoftButton>
                  <span className="px-2 py-1.5 text-xs text-slate-600">
                    {currentPage} / {totalPages}
                  </span>
                  <SoftButton
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`border ${
                      currentPage === totalPages
                        ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                        : 'text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Next <FiArrowRight size={12} />
                  </SoftButton>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowViewModal(false)}>
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#f4faf8] shadow-2xl animate-[slideUp_280ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-xs uppercase tracking-wide">Product details</p>
                <h2 className="auth-display text-xl font-bold">{selectedProduct.name}</h2>
              </div>
              <button onClick={() => setShowViewModal(false)} className="rounded-xl bg-white/15 p-2 hover:bg-white/25">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex justify-center">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-44 h-44 object-cover rounded-2xl border shadow-sm" />
                ) : (
                  <div className="w-44 h-44 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-400 border">
                    <FiCamera size={40} />
                    <p className="text-sm mt-2">No image</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['Product ID', selectedProduct.productId],
                  ['Category', selectedProduct.category],
                  ...(showMoney ? [['Sell price', `ETB ${Number(selectedProduct.price || 0).toLocaleString()}`]] : []),
                  ['Warehouse stock', `${selectedProduct.stock} ${selectedProduct.unit || ''}`],
                  ['Store stock', selectedProduct.storeStock || 0],
                  ['Restock level', selectedProduct.restockLevel || '—'],
                  ['Location', selectedProduct.location || 'Not set'],
                  ['Batch', selectedProduct.batchNumber || '—'],
                  ['Item ID', selectedProduct.itemId || '—'],
                  ['Serial', selectedProduct.serialNumber || '—']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white border border-slate-100 p-3">
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="font-medium text-slate-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowViewModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white">
                  Close
                </button>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedProduct);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800"
                  >
                    Edit product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setShowEditModal(false)}>
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#f4faf8] shadow-2xl animate-[slideUp_280ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-700 to-emerald-600 text-white px-6 py-4 flex items-center justify-between z-10">
              <h2 className="auth-display text-xl font-bold">Edit product</h2>
              <button onClick={() => setShowEditModal(false)} className="rounded-xl bg-white/15 p-2 hover:bg-white/25">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="rounded-2xl bg-white border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-28 h-28 border rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                  {imagePreview || selectedProduct.image ? (
                    <img src={imagePreview || selectedProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiCamera size={28} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-teal-700 text-white px-4 py-2 rounded-xl hover:bg-teal-800 inline-flex items-center text-sm">
                    <FiUpload className="mr-2" /> Upload image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG · optional</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                  <input type="text" value={selectedProduct.name || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Product ID</label>
                  <input type="text" value={selectedProduct.productId || ''} className={`${inputClass} bg-slate-100`} readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select value={selectedProduct.category || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })} className={inputClass}>
                    <option value="">Select</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Sell price</label>
                  <input type="number" value={selectedProduct.price || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, price: parseFloat(e.target.value) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Warehouse stock</label>
                  <input type="number" value={selectedProduct.stock || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: parseInt(e.target.value, 10) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Restock level</label>
                  <input type="number" value={selectedProduct.restockLevel || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, restockLevel: parseInt(e.target.value, 10) })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                  <input type="text" value={selectedProduct.location || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, location: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
                  <select value={selectedProduct.unit || 'PCS'} onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })} className={inputClass}>
                    <option value="PCS">PCS</option>
                    <option value="SET">SET</option>
                    <option value="UNIT">UNIT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch</label>
                  <input type="text" value={selectedProduct.batchNumber || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, batchNumber: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Item ID</label>
                  <input type="text" value={selectedProduct.itemId || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, itemId: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setUploadedImage(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateProduct}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 flex items-center justify-center disabled:opacity-60"
                >
                  <FiSave className="mr-2" />
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-[slideUp_250ms_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FiTrash2 size={26} />
              </div>
              <h2 className="auth-display text-xl font-bold mb-2">Delete product?</h2>
              <p className="text-slate-600 text-sm">
                Remove <span className="font-semibold text-slate-800">{productToDelete.name}</span> from inventory. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Inventory;
