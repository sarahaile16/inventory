import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiPlus, FiMinus,
  FiTrash2, FiDollarSign, FiUser, FiPhone,
  FiArrowLeft, FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { canSeeMoney } from '../auth/roles';
import {
  PageShell,
  PageHero,
  Panel,
  SoftButton,
  SearchInput,
  EmptyState
} from '../components/ui/PageChrome';

const inputClass =
  'w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30';

const Sales = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [buyerInfo, setBuyerInfo] = useState({
    fullName: 'Dagmawi Tsegaye',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [deadline, setDeadline] = useState('');
  const showMoney = canSeeMoney();

  useEffect(() => {
    const loadStoreProducts = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await axios.get(`${API_URL}/products`);
        const storeProducts = (Array.isArray(response.data) ? response.data : []).map((product) => ({
          ...product,
          id: product._id,
          stock: Number(product.storeStock || 0)
        }));
        setProducts(storeProducts);
        setFilteredProducts(storeProducts);
      } catch (error) {
        console.error('Error loading store products:', error);
      }
    };

    loadStoreProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toString().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      setCart(cart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      if (quantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      setCart([...cart, { ...product, quantity }]);
    }

    toast.success(`${product.name} added to cart`);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const updateQuantity = (id, newQuantity) => {
    const product = products.find((p) => p.id === id);
    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
    toast.success('Item removed from cart');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!buyerInfo.fullName) {
      toast.error('Please enter buyer name');
      return;
    }

    navigate('/store/payment', {
      state: {
        cart,
        buyerInfo,
        subtotal,
        tax,
        total,
        deadline,
        transactionId: `FS-${Date.now()}`
      }
    });
  };

  const handleRecordSale = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Point of sale"
        title="New sale"
        subtitle="Multi-sales / store floor checkout"
        actions={
          <SoftButton
            onClick={() => navigate('/store')}
            className="bg-white/15 hover:bg-white/25 text-white"
          >
            <FiArrowLeft size={14} /> Back
          </SoftButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <Panel title="Products" action={
            <div className="w-full sm:w-56">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products…"
              />
            </div>
          } bodyClassName="p-0 sm:p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-50 text-[10px] sm:text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Img</th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Product</th>
                    {showMoney && <th className="px-3 py-2 text-left">Price</th>}
                    <th className="px-3 py-2 text-left">Stock</th>
                    <th className="px-3 py-2 text-left">Restock</th>
                    <th className="px-3 py-2 text-left">Unit</th>
                    <th className="px-3 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-teal-50/40">
                      <td className="px-3 py-2 text-xs">{index + 1}</td>
                      <td className="px-3 py-2">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-8 h-8 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-[9px]">
                            —
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">{product.productId}</td>
                      <td className="px-3 py-2 text-xs truncate max-w-[80px]">{product.category}</td>
                      <td className="px-3 py-2 text-xs font-medium truncate max-w-[120px]">
                        {product.name}
                      </td>
                      {showMoney && (
                        <td className="px-3 py-2 text-xs">
                          ETB {product.price.toLocaleString()}
                        </td>
                      )}
                      <td className="px-3 py-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                            product.stock <= product.restockLevel
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{product.restockLevel}</td>
                      <td className="px-3 py-2 text-xs">{product.unit}</td>
                      <td className="px-3 py-2">
                        <SoftButton
                          onClick={() => handleRecordSale(product)}
                          className="bg-teal-600 text-white hover:bg-teal-700"
                        >
                          Record
                        </SoftButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Panel title="Buyer">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={buyerInfo.fullName}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, fullName: e.target.value })}
                    className={inputClass}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    value={buyerInfo.phoneNumber}
                    onChange={(e) => setBuyerInfo({ ...buyerInfo, phoneNumber: e.target.value })}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Cart"
            action={<span className="text-[10px] text-slate-500">{cart.length} items</span>}
          >
            <div className="max-h-72 overflow-y-auto">
              {cart.length > 0 ? (
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{item.name}</p>
                        {showMoney ? (
                          <p className="text-[10px] text-slate-500">
                            ETB {item.price.toLocaleString()} each
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500">Qty {item.quantity}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <SoftButton
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-100"
                        >
                          <FiMinus size={12} />
                        </SoftButton>
                        <span className="w-6 text-center text-xs">{item.quantity}</span>
                        <SoftButton
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-100"
                        >
                          <FiPlus size={12} />
                        </SoftButton>
                        <SoftButton
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 ml-0.5"
                        >
                          <FiTrash2 size={12} />
                        </SoftButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>
                  <FiShoppingCart size={28} className="mx-auto mb-2 text-slate-300" />
                  Cart is empty
                </EmptyState>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div>
                  <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
                    Order deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
                {showMoney && (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>ETB {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tax (15%)</span>
                      <span>ETB {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-slate-100">
                      <span>Total</span>
                      <span className="text-emerald-600">ETB {total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Panel>

          {cart.length > 0 && (
            <SoftButton
              onClick={handleProceedToPayment}
              className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold"
            >
              <FiDollarSign size={14} />
              {showMoney ? 'Proceed to Payment' : 'Complete order'}
            </SoftButton>
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Add to Cart</h3>
            <p className="text-sm mb-1 truncate">{selectedProduct.name}</p>
            {showMoney && (
              <p className="text-xs text-slate-500 mb-3">
                Price: ETB {selectedProduct.price.toLocaleString()}
              </p>
            )}

            <div className="mb-4">
              <label className="block text-[10px] uppercase tracking-wide text-slate-500 mb-1">
                Quantity
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-slate-200 rounded-l-lg hover:bg-slate-50"
                >
                  <FiMinus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 border-t border-b border-slate-200 text-sm"
                  min="1"
                  max={selectedProduct.stock}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="p-2 border border-slate-200 rounded-r-lg hover:bg-slate-50"
                >
                  <FiPlus size={14} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Available: {selectedProduct.stock}
              </p>
            </div>

            <div className="flex justify-end gap-1.5">
              <SoftButton
                onClick={() => setSelectedProduct(null)}
                className="border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </SoftButton>
              <SoftButton
                onClick={() => addToCart(selectedProduct)}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                <FiCheck size={12} /> Add
              </SoftButton>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Sales;
