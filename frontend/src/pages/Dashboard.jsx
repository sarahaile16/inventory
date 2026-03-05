import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPackage, FiEdit, FiTrash2, FiEye,
  FiArrowLeft, FiArrowRight
} from 'react-icons/fi';
import axios from 'axios';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 1610040,
    totalProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
    totalCustomers: 124
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const loggedinuser =JSON.parse(localStorage.getItem("user"));
  console.log(loggedinuser.role);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      console.log('Products loaded:', response.data);
      setProducts(response.data);
      
      // Calculate stats from products
      const totalProducts = response.data.length;
      const lowStockItems = response.data.filter(p => p.stock <= p.restockLevel).length;
      const totalValue = response.data.reduce((sum, p) => sum + (p.price * p.stock), 0);
      
      setStats(prev => ({
        ...prev,
        totalProducts,
        lowStockItems,
        totalValue
      }));
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        fetchProducts(); // Refresh the list
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productId?.toString().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Sales</p>
          <p className="text-2xl font-bold">ETB {stats.totalSales.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Last 30 days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
          <p className="text-xs text-gray-400 mt-2">In inventory</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Inventory Value</p>
          <p className="text-2xl font-bold text-green-600">ETB {stats.totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Total stock value</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
          <p className="text-xs text-gray-400 mt-2">Need reorder</p>
        </div>
      </div>

      {/* Warehouse Inventory */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Warehouse Inventory</h2>
            <Link 
              to="/management" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm flex items-center"
            >
              <FiPackage className="mr-2" /> Add Product
            </Link>
          </div>
          <input
            type="text"
            placeholder="Search by Name, Product ID, Category..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Products Table */}
        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4">{product.productId}</td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4 font-medium">{product.name}</td>
                    <td className="px-6 py-4">ETB {product.price?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.stock <= product.restockLevel 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">{product.restockLevel}</td>
                    <td className="px-6 py-4">{product.unit}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => navigate(`/inventory/view/${product._id}`)}
                        >
                          <FiEye size={18} />
                        </button>
                        {loggedinuser.role === "admin" &&
                        <button 
                          className="text-green-600 hover:text-green-800"
                          onClick={() => navigate(`/management/edit/${product._id}`)}
                        >
                          <FiEdit size={18} />
                        </button>
                        }
                        
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(product._id, product.name)}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <FiPackage size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No products found</p>
            <Link to="/management" className="text-blue-500 hover:underline mt-2 inline-block">
              Add your first product
            </Link>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {paginatedProducts.length} of {filteredProducts.length} products
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded ${
                  currentPage === 1 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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