import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiArrowLeft, FiPhone, FiMail, FiCalendar, 
  FiDollarSign, FiPackage, FiDownload, FiPrinter,
  FiChevronLeft, FiChevronRight, FiClock, FiUpload,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit,
  FiSave, FiPlus, FiMapPin, FiBriefcase, FiTag,
  FiUser, FiFileText, FiTrash2, FiX
} from 'react-icons/fi';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [editFormData, setEditFormData] = useState({});
  const [newPayment, setNewPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    transactionId: '',
    description: ''
  });
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching customer ID:', id);
      
      const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
      console.log('✅ Customer data:', response.data);
      
      setCustomer(response.data);
      setEditFormData(response.data);
      
      // Mock uploaded files - in real app, fetch from API
      setUploadedFiles([
        { id: 1, name: 'order_invoice.pdf', date: '2025-02-20', size: '245 KB' },
        { id: 2, name: 'payment_receipt.jpg', date: '2025-02-15', size: '1.2 MB' }
      ]);
    } catch (error) {
      console.error('❌ Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (!newPayment.amount) {
      alert('Please enter payment amount');
      return;
    }

    try {
      const paymentData = {
        ...newPayment,
        amount: parseFloat(newPayment.amount),
        date: newPayment.date || new Date().toISOString().split('T')[0]
      };

      // Update local state
      const updatedCustomer = {
        ...customer,
        totalSpent: (customer.totalSpent || 0) + paymentData.amount,
        totalPurchases: (customer.totalPurchases || 0) + 1,
        purchaseHistory: [
          ...(customer.purchaseHistory || []),
          {
            _id: 'payment_' + Date.now(),
            type: 'Payment',
            amount: paymentData.amount,
            date: paymentData.date,
            transactionId: paymentData.transactionId || 'MANUAL-' + Date.now(),
            method: paymentData.method,
            description: paymentData.description
          }
        ]
      };
      
      setCustomer(updatedCustomer);
      setShowAddPaymentModal(false);
      setNewPayment({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        transactionId: '',
        description: ''
      });
      
      alert('Payment added successfully!');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const newFile = {
        id: Date.now(),
        name: selectedFile.name,
        date: new Date().toISOString().split('T')[0],
        size: (selectedFile.size / 1024).toFixed(2) + ' KB'
      };
      
      setUploadedFiles([...uploadedFiles, newFile]);
      
      alert('File uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const updatedCustomer = {
        ...customer,
        ...editFormData
      };
      
      setCustomer(updatedCustomer);
      setShowEditModal(false);
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      // In real app, call API to delete
      // await axios.delete(`http://localhost:5000/api/customers/${id}`);
      
      alert('Customer deleted successfully!');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      const updatedPurchases = customer.purchaseHistory.filter(p => p._id !== paymentId);
      const updatedCustomer = {
        ...customer,
        purchaseHistory: updatedPurchases,
        totalPurchases: updatedPurchases.length,
        totalSpent: updatedPurchases.reduce((sum, p) => sum + p.amount, 0)
      };
      setCustomer(updatedCustomer);
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      const updatedCustomer = {
        ...customer,
        orderStatus: status
      };
      setCustomer(updatedCustomer);
      alert(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Pagination for purchase history
  const purchaseHistory = customer?.purchaseHistory || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = purchaseHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchaseHistory.length / itemsPerPage);

  const formatCurrency = (amount) => {
    if (!amount) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"><FiCheckCircle className="mr-1" size={12} /> Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center"><FiClock className="mr-1" size={12} /> Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center"><FiAlertCircle className="mr-1" size={12} /> Processing</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center"><FiXCircle className="mr-1" size={12} /> Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status || 'N/A'}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Customer not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with Back Button and Actions */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FiArrowLeft className="mr-2" /> Back to Customers
        </button>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FiEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <FiTrash2 className="mr-2" /> Delete
          </button>
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <FiPlus className="mr-2" /> Add Payment
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            <FiUpload className="mr-2" /> Upload
          </button>
        </div>
      </div>

      {/* Customer Information Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FiUser className="mr-2 text-blue-500" />
            Customer Information
          </h2>
          {customer.orderStatus && getStatusBadge(customer.orderStatus)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs flex items-center"><FiUser className="mr-1" size={12} /> Full Name</p>
            <p className="font-medium text-lg">{customer.fullName}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs flex items-center"><FiPhone className="mr-1" size={12} /> Phone Number</p>
            <p className="font-medium text-lg">{customer.phoneNumber}</p>
          </div>
          
          {customer.organization && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs flex items-center"><FiBriefcase className="mr-1" size={12} /> Organization</p>
              <p className="font-medium text-lg">{customer.organization}</p>
            </div>
          )}
          
          {customer.email && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs flex items-center"><FiMail className="mr-1" size={12} /> Email</p>
              <p className="font-medium text-lg">{customer.email}</p>
            </div>
          )}
          
          {customer.address && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-xs flex items-center"><FiMapPin className="mr-1" size={12} /> Address</p>
              <p className="font-medium text-lg">{customer.address}</p>
            </div>
          )}
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs flex items-center"><FiTag className="mr-1" size={12} /> Customer Type</p>
            <p className="font-medium text-lg">{customer.customerType || 'Regular'}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-gray-500 text-xs flex items-center"><FiCalendar className="mr-1" size={12} /> Member Since</p>
            <p className="font-medium text-lg">{formatDate(customer.createdAt)}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-600 text-sm font-medium">Total Spent</p>
            <p className="text-2xl font-bold text-green-700">ETB {formatCurrency(customer.totalSpent)}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-600 text-sm font-medium">Total Purchases</p>
            <p className="text-2xl font-bold text-blue-700">{customer.totalPurchases || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-purple-600 text-sm font-medium">Last Purchase</p>
            <p className="text-2xl font-bold text-purple-700">{formatDate(customer.lastPurchaseDate) || 'N/A'}</p>
          </div>
        </div>

        {/* Order Information with Deadline */}
        {(customer.orderDescription || customer.orderDeadline) && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <FiPackage className="mr-2 text-orange-500" />
              Order Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.orderDescription && (
                <div>
                  <p className="text-gray-500 text-sm">Order Description</p>
                  <p className="font-medium p-2 bg-orange-50 rounded-lg">{customer.orderDescription}</p>
                </div>
              )}
              {customer.orderDeadline && (
                <div>
                  <p className="text-gray-500 text-sm flex items-center">
                    <FiClock className="mr-1" size={14} /> Deadline
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50">
                    <span className={`font-medium ${
                      new Date(customer.orderDeadline) < new Date() 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {formatDate(customer.orderDeadline)}
                      {new Date(customer.orderDeadline) < new Date() && ' (Overdue)'}
                    </span>
                    <button
                      onClick={() => {
                        const newDeadline = prompt('Enter new deadline (YYYY-MM-DD):', customer.orderDeadline);
                        if (newDeadline) {
                          setCustomer({...customer, orderDeadline: newDeadline});
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiEdit size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.notes && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-sm">Notes</p>
            <p className="font-medium">{customer.notes}</p>
          </div>
        )}

        {/* Order Status Update Buttons */}
        <div className="mt-4 flex items-center space-x-2 pt-2">
          <span className="text-sm text-gray-500">Update Status:</span>
          <button
            onClick={() => updateOrderStatus('pending')}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200"
          >
            Pending
          </button>
          <button
            onClick={() => updateOrderStatus('processing')}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200"
          >
            Processing
          </button>
          <button
            onClick={() => updateOrderStatus('completed')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200"
          >
            Completed
          </button>
          <button
            onClick={() => updateOrderStatus('cancelled')}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Order Details
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'files'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Uploaded Files
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {purchaseHistory.length > 0 ? (
                <div className="space-y-3">
                  {purchaseHistory.slice(0, 5).map((purchase, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{purchase.description || purchase.type || 'Payment'}</p>
                        <p className="text-sm text-gray-500">{purchase.date}</p>
                      </div>
                      <p className="font-bold text-green-600">ETB {formatCurrency(purchase.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </div>
          )}

          {/* Payments Tab with Delete */}
          {activeTab === 'payments' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPurchases.map((purchase, index) => (
                      <tr key={purchase._id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{indexOfFirstItem + index + 1}</td>
                        <td className="px-4 py-3">{purchase.date}</td>
                        <td className="px-4 py-3">{purchase.description || purchase.type || 'Payment'}</td>
                        <td className="px-4 py-3 font-medium text-green-600">
                          ETB {formatCurrency(purchase.amount)}
                        </td>
                        <td className="px-4 py-3">{purchase.method || 'N/A'}</td>
                        <td className="px-4 py-3">{purchase.transactionId || '—'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeletePayment(purchase._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {purchaseHistory.length > itemsPerPage && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 border rounded flex items-center ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <FiChevronLeft className="mr-1" size={16} />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 border rounded flex items-center ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Next
                      <FiChevronRight className="ml-1" size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Details</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Description</p>
                    <p className="font-medium text-lg">{customer.orderDescription || 'No order description'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Current Status</p>
                    <div className="mt-1">{getStatusBadge(customer.orderStatus)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Deadline</p>
                    <p className={`font-medium text-lg ${
                      customer.orderDeadline && new Date(customer.orderDeadline) < new Date() 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {customer.orderDeadline ? formatDate(customer.orderDeadline) : 'Not set'}
                      {customer.orderDeadline && new Date(customer.orderDeadline) < new Date() && ' (Overdue)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                    <p className="font-medium text-lg">{customer.updatedAt ? formatDate(customer.updatedAt) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Files Tab with Delete */}
          {activeTab === 'files' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FiFileText className="text-blue-500 mr-3" size={20} />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">Uploaded: {file.date} • Size: {file.size}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-500 hover:text-blue-700">
                          <FiDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <FiUpload className="mx-auto mb-2" size={32} />
                  <p>No files uploaded yet</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-2 text-blue-500 hover:text-blue-700"
                  >
                    Upload a file
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiEdit className="mr-2" />
                Edit Customer
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={editFormData.phoneNumber || ''}
                      onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Organization</label>
                    <input
                      type="text"
                      value={editFormData.organization || ''}
                      onChange={(e) => setEditFormData({...editFormData, organization: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Customer Type</label>
                    <select
                      value={editFormData.customerType || 'Regular'}
                      onChange={(e) => setEditFormData({...editFormData, customerType: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="New">New</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Order Description</label>
                    <input
                      type="text"
                      value={editFormData.orderDescription || ''}
                      onChange={(e) => setEditFormData({...editFormData, orderDescription: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">Deadline</label>
                    <input
                      type="date"
                      value={editFormData.orderDeadline || ''}
                      onChange={(e) => setEditFormData({...editFormData, orderDeadline: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={editFormData.notes || ''}
                      onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCustomer}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
              >
                <FiSave className="mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiTrash2 className="mr-2" />
                Delete Customer
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-bold">{customer.fullName}</span>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal (same as before) */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiDollarSign className="mr-2" />
                Add Payment
              </h2>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              {/* Payment form fields - same as before */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Amount (ETB)</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Payment Date</label>
                  <input
                    type="date"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Payment Method</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Mobile Money">Mobile Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Transaction ID</label>
                  <input
                    type="text"
                    value={newPayment.transactionId}
                    onChange={(e) => setNewPayment({...newPayment, transactionId: e.target.value})}
                    placeholder="Optional"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
                  <input
                    type="text"
                    value={newPayment.description}
                    onChange={(e) => setNewPayment({...newPayment, description: e.target.value})}
                    placeholder="Payment description"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPayment}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
              >
                <FiSave className="mr-2" />
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal (same as before) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiUpload className="mr-2" />
                Upload File
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-gray-800">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600 mb-2">Drag and drop a file here, or click to select</p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer"
                    >
                      Select File
                    </label>
                  </>
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className={`px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center ${
                  !selectedFile || uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;