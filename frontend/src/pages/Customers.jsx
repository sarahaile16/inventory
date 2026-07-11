import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiEye, FiUserPlus, FiSearch, FiChevronLeft, FiChevronRight,
  FiDownload, FiX, FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiTag, FiDollarSign, FiCalendar,
  FiClock
} from 'react-icons/fi';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    returnedCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    phoneNumber: '',
    organization: '',
    email: '',
    address: '',
    customerType: 'Regular',
    notes: '',
    // Payment and Order fields
    initialPayment: '',
    paymentDate: new Date().toISOString().split('T')[0],
    deadline: '',
    orderDescription: '',
    orderStatus: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${API_URL}/customers`);
      console.log('✅ Customers fetched:', response.data);
      setCustomers(response.data);

      // Calculate stats
      const totalCustomers = response.data.length;
      const activeCustomers = response.data.filter(c => c.status === 'Active').length;
      const returnedCustomers = response.data.filter(c => c.status === 'Returned').length;
      const totalRevenue = response.data.reduce((sum, c) => sum + c.totalSpent, 0);
      const pendingOrders = response.data.filter(c => c.orderStatus === 'pending').length;
      const completedOrders = response.data.filter(c => c.orderStatus === 'completed').length;

      setStats({
        totalCustomers,
        activeCustomers,
        returnedCustomers,
        totalRevenue,
        pendingOrders,
        completedOrders
      });

    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewDetails = (customerId) => {
    navigate(`/customers/${customerId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({
      ...newCustomer,
      [name]: value
    });
  };

  const handleAddCustomer = async () => {
    // Validate required fields
    if (!newCustomer.fullName) {
      alert('Please enter customer name');
      return;
    }
    if (!newCustomer.phoneNumber) {
      alert('Please enter phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare customer data with payment and order info
      const customerData = {
        ...newCustomer,
        totalSpent: parseFloat(newCustomer.initialPayment) || 0,
        totalPurchases: newCustomer.initialPayment ? 1 : 0,
        lastPurchaseDate: newCustomer.paymentDate || null,
        orderDeadline: newCustomer.deadline || null,
        orderDescription: newCustomer.orderDescription || '',
        orderStatus: newCustomer.orderStatus || 'pending',
        status: 'Active'
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/customers`, customerData);
      console.log('✅ Customer added:', response.data);

      // Refresh customer list
      await fetchCustomers();

      // Close modal and reset form
      setShowAddModal(false);
      setNewCustomer({
        fullName: '',
        phoneNumber: '',
        organization: '',
        email: '',
        address: '',
        customerType: 'Regular',
        notes: '',
        initialPayment: '',
        paymentDate: new Date().toISOString().split('T')[0],
        deadline: '',
        orderDescription: '',
        orderStatus: 'pending'
      });

      alert('Customer added successfully!');
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      alert(error.response?.data?.message || 'Error adding customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm) ||
    (customer.organization && customer.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Management System</h1>
        <p className="text-gray-600">Manage your customers, payments, and orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Total Customers</p>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.activeCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Returned</p>
          <p className="text-2xl font-bold text-red-600">{stats.returnedCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Revenue</p>
          <p className="text-2xl font-bold text-blue-600">ETB {formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name or Phone Number"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center flex-1 md:flex-none"
            >
              <FiUserPlus className="mr-2" />
              Add Customer
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center flex-1 md:flex-none">
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Customers Table */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ORGANIZATION</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PHONE NUMBER</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentCustomers.map((customer, index) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                        {customer.organization && (
                          <div className="text-xs text-gray-500">{customer.organization}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleViewDetails(customer._id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FiEye className="mr-1" size={16} />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCustomers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No customers found
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredCustomers.length > 0 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded flex items-center ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <FiChevronLeft className="mr-1" size={16} />
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded flex items-center ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    Next
                    <FiChevronRight className="ml-1" size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Customer Modal - Subtle Background */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FiUserPlus className="mr-2" />
                Add New Customer
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200 transition transform hover:scale-110"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Buyer Information Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiUser className="mr-2 text-blue-600" />
                    Buyer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={newCustomer.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter customer name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={newCustomer.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Information Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiDollarSign className="mr-2 text-green-600" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Amount Paid (ETB)
                      </label>
                      <input
                        type="number"
                        name="initialPayment"
                        value={newCustomer.initialPayment}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Payment Date
                      </label>
                      <input
                        type="date"
                        name="paymentDate"
                        value={newCustomer.paymentDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Information Section */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiClock className="mr-2 text-purple-600" />
                    Order Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Order Description
                      </label>
                      <input
                        type="text"
                        name="orderDescription"
                        value={newCustomer.orderDescription}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Plate (18 Pieces)"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Deadline
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={newCustomer.deadline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Order Status
                      </label>
                      <select
                        name="orderStatus"
                        value={newCustomer.orderStatus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={newCustomer.organization}
                        onChange={handleInputChange}
                        placeholder="Enter organization name"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newCustomer.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={newCustomer.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Customer Type
                      </label>
                      <select
                        name="customerType"
                        value={newCustomer.customerType}
                        onChange={handleInputChange}
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
                      <label className="block text-gray-700 text-sm font-medium mb-2">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={newCustomer.notes}
                        onChange={handleInputChange}
                        placeholder="Additional notes"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3 sticky bottom-0">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={isSubmitting}
                className={`px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Add Customer
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

export default Customers;