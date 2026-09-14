import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiEye, FiUserPlus, FiSearch, FiChevronLeft, FiChevronRight,
  FiDownload, FiX, FiSave, FiUser, FiPhone, FiMail,
  FiMapPin, FiBriefcase, FiTag, FiDollarSign, FiCalendar,
  FiClock, FiImage
} from 'react-icons/fi';
import { canSeeMoney } from '../auth/roles';

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
    wholePayment: '',
    firstPayment: '',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    deadline: '',
    orderDescription: '',
    orderStatus: 'pending',
    orderPhoto: '',
    paymentPhoto: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 10;
  const showMoney = canSeeMoney();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
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

  const handleOrderPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose a photo smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewCustomer((current) => ({ ...current, orderPhoto: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handlePaymentPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose a payment photo smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewCustomer((current) => ({ ...current, paymentPhoto: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
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
      const whole = Number(newCustomer.wholePayment || 0);
      const first = Number(newCustomer.firstPayment || 0);
      const customerData = {
        ...newCustomer,
        orderDeadline: newCustomer.deadline || null,
        wholePayment: whole,
        firstPayment: first,
        restPayment: Math.max(0, whole - first),
        paymentType: 'first_and_rest',
        status: 'Active'
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${API_URL}/customers`, customerData);
      console.log('✅ Customer added:', response.data);

      // Refresh customer list
      await fetchCustomers();

      const emailInfo = response.data?.emailConfirmation;
      let successMsg = 'Customer and order saved successfully.';
      if (emailInfo?.sent) {
        successMsg += `\n\nConfirmation email sent to ${emailInfo.to}.`;
        if (emailInfo.testMode && emailInfo.previewUrl) {
          successMsg += `\n\n(Dev preview — open this to see the email:\n${emailInfo.previewUrl})`;
          console.log('📧 Email preview:', emailInfo.previewUrl);
        }
      } else if (customerData.email?.trim()) {
        successMsg += `\n\nOrder saved, but confirmation email was not sent${emailInfo?.error ? `: ${emailInfo.error}` : '.'}`;
      } else {
        successMsg += '\n\nNo email entered — customer did not receive a confirmation.';
      }

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
        wholePayment: '',
        firstPayment: '',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        deadline: '',
        orderDescription: '',
        orderStatus: 'pending',
        orderPhoto: '',
        paymentPhoto: ''
      });

      alert(successMsg);
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
    <div className="p-4 sm:p-6 min-h-screen">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-700 to-teal-600 text-white p-6 mb-6">
        <p className="text-white/70 text-sm uppercase tracking-wide">Customer desk</p>
        <h1 className="text-2xl sm:text-3xl font-bold">Customers</h1>
        <p className="text-white/80 mt-1">
          {showMoney ? 'Look up buyers, payments, and order deadlines.' : 'Look up buyers and follow order deadlines. Amounts stay with management.'}
        </p>
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
        {showMoney ? (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Revenue</p>
            <p className="text-2xl font-bold text-blue-600">ETB {formatCurrency(stats.totalRevenue)}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">Due today / overdue</p>
            <p className="text-2xl font-bold text-amber-600">
              {customers.filter((customer) => {
                if (!customer.orderDeadline) return false;
                return new Date(customer.orderDeadline) <= new Date(new Date().toDateString());
              }).length}
            </p>
          </div>
        )}
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
              className="bg-teal-700 text-white px-4 py-2.5 rounded-xl hover:bg-teal-800 shadow-lg shadow-teal-700/20 flex items-center justify-center transition"
            >
              <FiUserPlus className="mr-2" />
              Add customer + order
            </button>
            {showMoney && (
              <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center flex-1 md:flex-none">
                <FiDownload className="mr-2" />
                Export
              </button>
            )}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEADLINE</th>
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
                        <div className="flex items-center gap-3">
                          {customer.orderPhoto ? (
                            <img src={customer.orderPhoto} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-xs">—</div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                            {customer.orderDescription && (
                              <div className="text-xs text-gray-500">{customer.orderDescription}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {customer.orderDeadline ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            new Date(customer.orderDeadline) < new Date(new Date().toDateString())
                              ? 'bg-red-100 text-red-700'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {String(customer.orderDeadline).slice(0, 10)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
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

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !isSubmitting && setShowAddModal(false)}
        >
          {/* Interactive dimmed backdrop */}
          <div className="absolute inset-0 overflow-hidden animate-[fadeIn_220ms_ease-out]">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" />
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl animate-[glowPulse_4s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 right-1/5 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-[glowPulse_5s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/3 right-1/3 h-48 w-48 rounded-full bg-cyan-300/15 blur-2xl animate-[glowPulse_6s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.45)_100%)]" />
          </div>
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#f4faf8] ring-1 ring-white/40 shadow-[0_30px_100px_rgba(15,23,42,0.45),0_0_0_1px_rgba(45,212,191,0.12)] animate-[slideUp_300ms_cubic-bezier(0.22,1,0.36,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 px-6 py-5 text-white">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute right-16 bottom-0 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-teal-100 text-xs uppercase tracking-[0.18em]">New customer order</p>
                  <h2 className="text-2xl font-bold mt-1 flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                      <FiUserPlus size={20} />
                    </span>
                    Add customer + order
                  </h2>
                  <p className="text-teal-50/90 text-sm mt-2 max-w-xl">
                    Name, phone, order details, payment proof, and first payment all in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl bg-white/10 p-2 hover:bg-white/20 transition"
                  aria-label="Close"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-11rem)] px-4 sm:px-6 py-5 space-y-4">
              <section className="rounded-2xl border border-teal-100 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md hover:border-teal-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-9 w-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                    <FiUser />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800">Buyer</h3>
                    <p className="text-xs text-slate-500">Required contact details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={newCustomer.fullName}
                      onChange={handleInputChange}
                      placeholder="Customer full name"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3.5 text-slate-400" size={16} />
                      <input
                        type="text"
                        name="phoneNumber"
                        value={newCustomer.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Phone number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email <span className="text-teal-600 font-normal">(sends order confirmation)</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3.5 text-slate-400" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={newCustomer.email}
                        onChange={handleInputChange}
                        placeholder="customer@email.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">
                      If filled, they get an email that the order was successfully accepted by the company.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-emerald-100 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md hover:border-emerald-200">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <FiDollarSign />
                    </span>
                    <div>
                      <h3 className="font-semibold text-slate-800">Payment type</h3>
                      <p className="text-xs text-slate-500">First now · rest on delivery</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-wide text-amber-700">Rest due</p>
                    <p className="text-sm font-bold text-amber-800">
                      ETB {Math.max(0, Number(newCustomer.wholePayment || 0) - Number(newCustomer.firstPayment || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Whole payment (ETB)</label>
                    <input
                      type="number"
                      name="wholePayment"
                      value={newCustomer.wholePayment}
                      onChange={handleInputChange}
                      placeholder="Full order price"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First payment (ETB)</label>
                    <input
                      type="number"
                      name="firstPayment"
                      value={newCustomer.firstPayment}
                      onChange={handleInputChange}
                      placeholder="Paid now"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment method</label>
                    <select
                      name="paymentMethod"
                      value={newCustomer.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First payment date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={newCustomer.paymentDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment proof photo</label>
                    <label className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition ${
                      newCustomer.paymentPhoto
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}>
                      {newCustomer.paymentPhoto ? (
                        <img src={newCustomer.paymentPhoto} alt="Payment proof" className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
                      ) : (
                        <span className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center text-emerald-600 shadow-sm">
                          <FiImage size={22} />
                        </span>
                      )}
                      <div className="text-center sm:text-left">
                        <p className="font-medium text-slate-800">
                          {newCustomer.paymentPhoto ? 'Payment photo attached' : 'Drop or click to attach receipt'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Transfer screenshot or cash receipt · max 2MB</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePaymentPhoto} />
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-cyan-100 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md hover:border-cyan-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-9 w-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <FiClock />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800">Order</h3>
                    <p className="text-xs text-slate-500">What they ordered and when it is due</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order description</label>
                    <input
                      type="text"
                      name="orderDescription"
                      value={newCustomer.orderDescription}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Plate (18 Pieces)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={newCustomer.deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order status</label>
                    <select
                      name="orderStatus"
                      value={newCustomer.orderStatus}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order photo</label>
                    <label className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition ${
                      newCustomer.orderPhoto
                        ? 'border-cyan-300 bg-cyan-50/60'
                        : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50/40'
                    }`}>
                      {newCustomer.orderPhoto ? (
                        <img src={newCustomer.orderPhoto} alt="Order" className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
                      ) : (
                        <span className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center text-cyan-600 shadow-sm">
                          <FiImage size={22} />
                        </span>
                      )}
                      <div className="text-center sm:text-left">
                        <p className="font-medium text-slate-800">
                          {newCustomer.orderPhoto ? 'Order photo attached' : 'Attach photo of the ordered items'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Saved with this customer and order</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleOrderPhoto} />
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <FiBriefcase />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-800">More details</h3>
                    <p className="text-xs text-slate-500">Optional organization and notes</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={newCustomer.organization}
                      onChange={handleInputChange}
                      placeholder="Company or individual"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={newCustomer.address}
                      onChange={handleInputChange}
                      placeholder="Delivery or contact address"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer type</label>
                    <select
                      name="customerType"
                      value={newCustomer.customerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 transition"
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="New">New</option>
                      <option value="Wholesale">Wholesale</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                    <input
                      type="text"
                      name="notes"
                      value={newCustomer.notes}
                      onChange={handleInputChange}
                      placeholder="Anything staff should know"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400 transition"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-teal-100 bg-white/90 backdrop-blur px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Rest payment updates live as you type whole and first payment.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomer}
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-700/20 transition flex items-center justify-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
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
                      Save customer + order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;