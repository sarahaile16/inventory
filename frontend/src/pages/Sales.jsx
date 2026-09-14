import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiShoppingCart, FiPlus, FiMinus, 
  FiTrash2, FiDollarSign, FiUser, FiPhone,
  FiArrowLeft, FiCheck
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { canSeeMoney } from '../auth/roles';

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

  // Filter products based on search
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toString().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        toast.error(`Only ${product.stock} items available in stock`);
        return;
      }
      setCart(cart.map(item =>
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

  // Update cart item quantity
  const updateQuantity = (id, newQuantity) => {
    const product = products.find(p => p.id === id);
    if (newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Item removed from cart');
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% tax
  const total = subtotal + tax;

  // Handle proceed to payment
  const handleProceedToPayment = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    
    if (!buyerInfo.fullName) {
      toast.error('Please enter buyer name');
      return;
    }

    // Navigate to payment page with sale data
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

  // Handle record sale (matching your screenshot's "Record S" buttons)
  const handleRecordSale = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/store')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Store Management System</h1>
          <p className="text-gray-600">Multi-Sales / Point of Sale</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Products List */}
        <div className="lg:col-span-2">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Products Table - Matching your screenshot */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                    {showMoney && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restock Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{index + 1}</td>
                      <td className="px-4 py-3">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{product.productId}</td>
                      <td className="px-4 py-3 text-sm">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                      {showMoney && <td className="px-4 py-3 text-sm">ETB {product.price.toLocaleString()}</td>}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.stock <= product.restockLevel 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.restockLevel}</td>
                      <td className="px-4 py-3 text-sm">{product.unit}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleRecordSale(product)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                        >
                          Record S
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="lg:col-span-1">
          {/* Buyer Information */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Buyer Information</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={buyerInfo.fullName}
                    onChange={(e) => setBuyerInfo({...buyerInfo, fullName: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-3 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={buyerInfo.phoneNumber}
                    onChange={(e) => setBuyerInfo({...buyerInfo, phoneNumber: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-semibold">Shopping Cart</h2>
              <span className="text-sm text-gray-500">{cart.length} items</span>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {cart.length > 0 ? (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        {showMoney ? (
                          <p className="text-xs text-gray-500">ETB {item.price.toLocaleString()} each</p>
                        ) : (
                          <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiMinus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FiPlus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded ml-2"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiShoppingCart size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>Cart is empty</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t bg-gray-50 space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Order deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {showMoney && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>ETB {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (15%):</span>
                      <span>ETB {tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span className="text-green-600">ETB {total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Checkout Button */}
          {cart.length > 0 && (
            <button
              onClick={handleProceedToPayment}
              className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center font-semibold"
            >
              <FiDollarSign className="mr-2" size={20} />
              {showMoney ? 'Proceed to Payment' : 'Complete order'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add to Cart</h3>
            <p className="mb-2">{selectedProduct.name}</p>
            {showMoney && (
              <p className="text-sm text-gray-500 mb-4">Price: ETB {selectedProduct.price.toLocaleString()}</p>
            )}
            
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Quantity</label>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border rounded-l-lg hover:bg-gray-100"
                >
                  <FiMinus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 border-t border-b"
                  min="1"
                  max={selectedProduct.stock}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                  className="p-2 border rounded-r-lg hover:bg-gray-100"
                >
                  <FiPlus size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Available stock: {selectedProduct.stock}</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => addToCart(selectedProduct)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FiCheck className="mr-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;