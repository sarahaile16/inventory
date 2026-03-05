import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiSearch, FiEdit, FiTrash2, FiEye, FiPlus,
  FiArrowLeft, FiArrowRight, FiX, FiSave,
  FiPackage, FiDollarSign, FiTag, FiBox,
  FiUpload, FiCamera, FiImage
} from 'react-icons/fi';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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
  
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/settings/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProducts = () => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId?.toString().includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct({...product});
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
      await axios.delete(`http://localhost:5000/api/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setShowDeleteConfirm(false);
      setProductToDelete(null);
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProduct = async () => {
    try {
      // Create form data for image upload
      const formData = new FormData();
      
      // Append all product data
      Object.keys(selectedProduct).forEach(key => {
        if (key !== 'image' && key !== '_id') {
          formData.append(key, selectedProduct[key]);
        }
      });
      
      // Append image if uploaded
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }
      
      // Send update request
      const response = await axios.put(
        `http://localhost:5000/api/products/${selectedProduct._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      const updatedProducts = products.map(p => 
        p._id === selectedProduct._id ? response.data : p
      );
      
      setProducts(updatedProducts);
      setShowEditModal(false);
      setSelectedProduct(null);
      setUploadedImage(null);
      setImagePreview(null);
      alert('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory Management System</h1>
        <p className="text-gray-600">Manage your products and stock</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FiPackage className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <FiDollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Value</p>
              <p className="text-2xl font-bold">
                ETB {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <FiTag className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <FiBox className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Low Stock</p>
              <p className="text-2xl font-bold">
                {products.filter(p => p.stock <= p.restockLevel).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name, Product ID, Category..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={() => window.location.href = '/management'}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center w-full md:w-auto justify-center"
          >
            <FiPlus className="mr-2" />
            Add New Product
          </button>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restock Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                            <FiImage size={24} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{product.productId}</td>
                      <td className="px-4 py-3 text-sm">{product.category}</td>
                      <td className="px-4 py-3 text-sm font-medium">{product.name}</td>
                      <td className="px-4 py-3 text-sm">ETB {product.price?.toLocaleString()}</td>
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
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(product)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="View Details"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Edit Product"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete Product"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {currentItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No products found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="px-4 py-3 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded flex items-center ${
                      currentPage === 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FiArrowLeft className="mr-1" size={14} />
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded flex items-center ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Next
                    <FiArrowRight className="ml-1" size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Product Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Product Image */}
              <div className="flex justify-center mb-4">
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400 border-2 border-gray-200">
                    <FiCamera size={48} />
                    <p className="text-sm mt-2">No Image</p>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-medium">{selectedProduct.productId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">ETB {selectedProduct.price?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Stock</p>
                  <p className={`font-medium ${
                    selectedProduct.stock <= selectedProduct.restockLevel ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Restock Level</p>
                  <p className="font-medium">{selectedProduct.restockLevel}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit</p>
                  <p className="font-medium">{selectedProduct.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedProduct.location || 'Not specified'}</p>
                </div>
              </div>

              {/* Additional Details */}
              <h3 className="font-semibold text-lg border-b pb-2 mt-4">Additional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Batch Number</p>
                  <p className="font-medium">{selectedProduct.batchNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">ITEM ID</p>
                  <p className="font-medium">{selectedProduct.itemId || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Serial Number</p>
                  <p className="font-medium">{selectedProduct.serialNumber || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{selectedProduct.expiryDate || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PART NUMBER</p>
                  <p className="font-medium">{selectedProduct.partNumber || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedProduct);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Product</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Product Image</label>
                <div className="flex items-center space-x-4">
                  {/* Image Preview */}
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : selectedProduct.image ? (
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiCamera size={32} className="text-gray-400" />
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 inline-flex items-center">
                      <FiUpload className="mr-2" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                    {uploadedImage && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {uploadedImage.name} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={selectedProduct.name || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Product ID</label>
                  <input
                    type="text"
                    value={selectedProduct.productId || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, productId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select
                    value={selectedProduct.category || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={selectedProduct.price || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Stock Amount *</label>
                  <input
                    type="number"
                    value={selectedProduct.stock || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Restock Level *</label>
                  <input
                    type="number"
                    value={selectedProduct.restockLevel || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, restockLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={selectedProduct.location || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, location: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Addis Abeba, Gerji - Main Showroom"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Unit</label>
                  <select
                    value={selectedProduct.unit || 'KIT'}
                    onChange={(e) => setSelectedProduct({...selectedProduct, unit: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="KIT">KIT</option>
                    <option value="PCS">PCS</option>
                    <option value="SET">SET</option>
                  </select>
                </div>
              </div>

              <h3 className="font-semibold text-lg border-b pb-2">Additional Product Details</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Batch number</label>
                  <input
                    type="text"
                    value={selectedProduct.batchNumber || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, batchNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter Batch number"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ITEM ID</label>
                  <input
                    type="text"
                    value={selectedProduct.itemId || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, itemId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter ITEM ID"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={selectedProduct.serialNumber || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, serialNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter Serial Number"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={selectedProduct.expiryDate || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, expiryDate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">PART NUMBER</label>
                  <input
                    type="text"
                    value={selectedProduct.partNumber || ''}
                    onChange={(e) => setSelectedProduct({...selectedProduct, partNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Enter PART NUMBER"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setUploadedImage(null);
                  setImagePreview(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <FiSave className="mr-2" />
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="text-center mb-4">
              <FiTrash2 size={48} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Delete Product</h2>
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;