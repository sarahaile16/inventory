import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiEye, FiUserPlus, FiChevronLeft, FiChevronRight,
  FiDownload, FiX, FiSave, FiUser, FiPhone, FiMail,
  FiBriefcase, FiDollarSign, FiClock, FiImage, FiPlus, FiSend, FiCopy, FiCheck
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { canSeeMoney, canSeeCustomerContact, canSeePayments } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton,
  LoadingBlock,
  EmptyState,
  SearchInput
} from '../components/ui/PageChrome';
import {
  buildReceiptFromOrder,
  whatsappShareUrl,
  telegramShareUrl,
  whatsappAppUrl,
  telegramAppUrl,
  openInAppOrWeb,
  shareViaDeviceApps,
  canUseDeviceShare
} from '../utils/receiptShare';

const emptyOrderFields = () => ({
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

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderCustomer, setOrderCustomer] = useState(null);
  const [orderForm, setOrderForm] = useState(emptyOrderFields());
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
    ...emptyOrderFields()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareReceipt, setShareReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  const itemsPerPage = 10;
  const showMoney = canSeeMoney();
  const showContact = canSeeCustomerContact();
  const showPayments = canSeePayments();

  const openShareReceipt = ({ customer, emailInfo, title }) => {
    const receiptText =
      emailInfo?.receiptText ||
      buildReceiptFromOrder({
        ...customer,
        companyName: 'Our Company'
      });
    setCopied(false);
    setShareReceipt({
      title: title || 'Order saved',
      emailInfo,
      phone: customer?.phoneNumber || '',
      name: customer?.fullName || 'Customer',
      receiptText
    });
  };

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

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((current) => ({ ...current, [name]: value }));
  };

  const openAddOrder = (customer) => {
    setOrderCustomer(customer);
    setOrderForm(emptyOrderFields());
    setShowOrderModal(true);
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

  const handleOrderModalOrderPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose a photo smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOrderForm((current) => ({ ...current, orderPhoto: String(reader.result || '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleOrderModalPaymentPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose a payment photo smaller than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setOrderForm((current) => ({ ...current, paymentPhoto: String(reader.result || '') }));
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
      setShowAddModal(false);
      setNewCustomer({
        fullName: '',
        phoneNumber: '',
        organization: '',
        email: '',
        address: '',
        customerType: 'Regular',
        notes: '',
        ...emptyOrderFields()
      });

      openShareReceipt({
        title: 'Customer and order saved',
        customer: customerData,
        emailInfo
      });
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 401) {
        alert('Your session expired. Please log in again, then add the customer.');
      } else {
        alert(msg || 'Error adding customer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddOrder = async () => {
    if (!orderCustomer?._id) return;
    if (!orderForm.orderDescription?.trim()) {
      alert('Please enter order description');
      return;
    }
    const whole = Number(orderForm.wholePayment || 0);
    const first = Number(orderForm.firstPayment || 0);
    if (!whole || whole <= 0) {
      alert('Please enter the whole payment (full order price) so the order counts on the dashboard.');
      return;
    }
    if (first > whole) {
      alert('First payment cannot be greater than whole payment');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...orderForm,
        orderDeadline: orderForm.deadline || null,
        wholePayment: whole,
        firstPayment: first,
        restPayment: Math.max(0, whole - first),
        paymentType: 'first_and_rest'
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${API_URL}/customers/${orderCustomer._id}/orders`, payload);
      await fetchCustomers();

      const emailInfo = response.data?.emailConfirmation;
      const savedFor = {
        fullName: orderCustomer.fullName,
        phoneNumber: orderCustomer.phoneNumber,
        email: orderCustomer.email,
        ...payload
      };

      setShowOrderModal(false);
      setOrderCustomer(null);
      setOrderForm(emptyOrderFields());

      openShareReceipt({
        title: `Order saved for ${orderCustomer.fullName}`,
        customer: savedFor,
        emailInfo
      });
    } catch (error) {
      console.error('❌ Error adding order:', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 401) {
        alert('Your session expired. Please log in again.');
      } else {
        alert(msg || 'Error adding order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (showContact && customer.phoneNumber && customer.phoneNumber.includes(searchTerm)) ||
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
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Customer desk"
        title="Customers"
        subtitle={
          showMoney
            ? 'Look up buyers, payments, and order deadlines.'
            : 'Look up buyers and follow order deadlines. Amounts stay with management.'
        }
        actions={
          <SoftButton
            onClick={() => setShowAddModal(true)}
            className="bg-white text-teal-800 hover:bg-teal-50"
          >
            <FiUserPlus size={12} /> Add customer + order
          </SoftButton>
        }
      />

      <StatGrid cols="6">
        <StatCard label="Total" value={stats.totalCustomers} accent="teal" />
        <StatCard label="Active" value={stats.activeCustomers} accent="emerald" />
        <StatCard label="Returned" value={stats.returnedCustomers} accent="rose" />
        {showMoney ? (
          <StatCard
            label="Revenue"
            value={`ETB ${formatCurrency(stats.totalRevenue)}`}
            accent="sky"
          />
        ) : (
          <StatCard
            label="Due / overdue"
            value={customers.filter((customer) => {
              if (!customer.orderDeadline) return false;
              return new Date(customer.orderDeadline) <= new Date(new Date().toDateString());
            }).length}
            accent="amber"
          />
        )}
        <StatCard label="Pending" value={stats.pendingOrders} accent="amber" />
        <StatCard label="Completed" value={stats.completedOrders} accent="emerald" />
      </StatGrid>

      <Panel
        title="Customer list"
        action={
          <div className="flex gap-1.5">
            <SoftButton
              onClick={() => setShowAddModal(true)}
              className="bg-teal-700 text-white hover:bg-teal-800"
            >
              <FiUserPlus size={12} /> Add
            </SoftButton>
            {showMoney && (
              <SoftButton className="bg-slate-500 text-white hover:bg-slate-600">
                <FiDownload size={12} /> Export
              </SoftButton>
            )}
          </div>
        }
      >
        <div className="mb-3">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by Name or Phone Number"
          />
        </div>

        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            <div className="overflow-x-auto -mx-3 sm:-mx-4">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    <th className="px-3 py-2.5">No.</th>
                    <th className="px-3 py-2.5">Customer</th>
                    {showContact && (
                      <th className="px-3 py-2.5">Phone</th>
                    )}
                    <th className="px-3 py-2.5">Deadline</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCustomers.map((customer, index) => (
                    <tr key={customer._id} className="hover:bg-teal-50/40">
                      <td className="px-3 py-2.5 text-xs text-slate-500">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          {customer.orderPhoto ? (
                            <img src={customer.orderPhoto} alt="" className="w-9 h-9 rounded-lg object-cover border" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-[10px]">—</div>
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-800 truncate flex items-center gap-1.5">
                              <span className="truncate">{customer.fullName}</span>
                              {Number(customer.ordersCount || customer.totalPurchases || 0) > 1 && (
                                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 text-[10px] font-semibold">
                                  {customer.ordersCount || customer.totalPurchases} orders
                                </span>
                              )}
                            </div>
                            {customer.orderDescription && (
                              <div className="text-[10px] text-slate-500 truncate">{customer.orderDescription}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      {showContact && (
                        <td className="px-3 py-2.5 text-xs text-slate-600">
                          {customer.phoneNumber}
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-xs">
                        {customer.orderDeadline ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            new Date(customer.orderDeadline) < new Date(new Date().toDateString())
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {String(customer.orderDeadline).slice(0, 10)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAddOrder(customer)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 text-white text-[11px] font-semibold shadow-sm shadow-teal-700/25 hover:bg-teal-800 active:scale-[0.98] transition"
                          >
                            <FiPlus size={13} strokeWidth={2.5} />
                            Add Order
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(customer._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 text-[11px] font-semibold hover:bg-sky-100 hover:border-sky-300 active:scale-[0.98] transition"
                          >
                            <FiEye size={13} />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCustomers.length === 0 && (
                <EmptyState>No customers found</EmptyState>
              )}
            </div>

            {filteredCustomers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length}
                </p>
                <div className="flex gap-1.5">
                  <SoftButton
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`border ${currentPage === 1 ? 'text-slate-300 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <FiChevronLeft size={12} /> Previous
                  </SoftButton>
                  <span className="px-2 py-1.5 text-xs text-slate-600">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <SoftButton
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`border ${currentPage === totalPages ? 'text-slate-300 border-slate-100 cursor-not-allowed' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    Next <FiChevronRight size={12} />
                  </SoftButton>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

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

      {showOrderModal && orderCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => !isSubmitting && setShowOrderModal(false)}
        >
          <div className="absolute inset-0 overflow-hidden animate-[fadeIn_220ms_ease-out]">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" />
            <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-teal-400/25 blur-3xl" />
            <div className="absolute bottom-0 right-1/5 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          </div>
          <div
            className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#f4faf8] ring-1 ring-white/40 shadow-[0_30px_100px_rgba(15,23,42,0.45)] animate-[slideUp_300ms_cubic-bezier(0.22,1,0.36,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 px-6 py-5 text-white">
              <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-teal-100 text-xs uppercase tracking-[0.18em]">Existing customer</p>
                  <h2 className="text-xl sm:text-2xl font-bold mt-1 flex items-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                      <FiPlus size={20} />
                    </span>
                    Add order
                  </h2>
                  <p className="text-teal-50/90 text-sm mt-2 max-w-xl">
                    Same payment, bank proof, and order details as a new customer — for{' '}
                    <span className="font-semibold">{orderCustomer.fullName}</span>
                    {showContact && orderCustomer.phoneNumber ? ` · ${orderCustomer.phoneNumber}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="rounded-xl bg-white/10 p-2 hover:bg-white/20 transition"
                  aria-label="Close"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-11rem)] px-4 sm:px-6 py-5 space-y-4">
              {/* Same payment block as Add Customer — always shown so totals stay correct */}
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
                      ETB {Math.max(0, Number(orderForm.wholePayment || 0) - Number(orderForm.firstPayment || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Whole payment (ETB) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="wholePayment"
                      value={orderForm.wholePayment}
                      onChange={handleOrderFormChange}
                      placeholder="Full order price"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First payment (ETB)</label>
                    <input
                      type="number"
                      name="firstPayment"
                      value={orderForm.firstPayment}
                      onChange={handleOrderFormChange}
                      placeholder="Paid now"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment method</label>
                    <select
                      name="paymentMethod"
                      value={orderForm.paymentMethod}
                      onChange={handleOrderFormChange}
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
                      value={orderForm.paymentDate}
                      onChange={handleOrderFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment proof photo (bank / receipt)</label>
                    <label className={`flex flex-col sm:flex-row items-center gap-4 rounded-2xl border-2 border-dashed p-4 cursor-pointer transition ${
                      orderForm.paymentPhoto
                        ? 'border-emerald-300 bg-emerald-50/60'
                        : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}>
                      {orderForm.paymentPhoto ? (
                        <img src={orderForm.paymentPhoto} alt="Payment proof" className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
                      ) : (
                        <span className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center text-emerald-600 shadow-sm">
                          <FiImage size={22} />
                        </span>
                      )}
                      <div className="text-center sm:text-left">
                        <p className="font-medium text-slate-800">
                          {orderForm.paymentPhoto ? 'Payment photo attached' : 'Drop or click to attach receipt'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Transfer screenshot or cash receipt · max 2MB</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleOrderModalPaymentPhoto} />
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Order description <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="orderDescription"
                      value={orderForm.orderDescription}
                      onChange={handleOrderFormChange}
                      placeholder="e.g., Main Plate (18 Pieces)"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={orderForm.deadline}
                      onChange={handleOrderFormChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Order status</label>
                    <select
                      name="orderStatus"
                      value={orderForm.orderStatus}
                      onChange={handleOrderFormChange}
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
                      orderForm.orderPhoto
                        ? 'border-cyan-300 bg-cyan-50/60'
                        : 'border-slate-200 bg-slate-50 hover:border-cyan-300 hover:bg-cyan-50/40'
                    }`}>
                      {orderForm.orderPhoto ? (
                        <img src={orderForm.orderPhoto} alt="Order" className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
                      ) : (
                        <span className="h-16 w-16 rounded-2xl bg-white border flex items-center justify-center text-cyan-600 shadow-sm">
                          <FiImage size={22} />
                        </span>
                      )}
                      <div className="text-center sm:text-left">
                        <p className="font-medium text-slate-800">
                          {orderForm.orderPhoto ? 'Order photo attached' : 'Attach photo of the ordered items'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Saved with this customer and order</p>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleOrderModalOrderPhoto} />
                    </label>
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-teal-100 bg-white/90 backdrop-blur px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-slate-500 text-center sm:text-left">
                Whole payment is required so this order is included in dashboard totals.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOrder}
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-teal-700 text-white hover:bg-teal-800 shadow-lg shadow-teal-700/20 transition flex items-center justify-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save order
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {shareReceipt && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShareReceipt(null)}
        >
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-teal-700 px-4 py-3 text-white flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-teal-100">Share receipt</p>
                <h2 className="text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                  <FiSend size={14} /> {shareReceipt.title}
                </h2>
                <p className="text-xs text-teal-50/90 mt-1">
                  Check the number, open the app, then tap <strong>Send</strong> in WhatsApp / Telegram.
                </p>
              </div>
              <button type="button" onClick={() => setShareReceipt(null)} className="p-1 rounded-lg hover:bg-white/10">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(92vh-10rem)]">
              {shareReceipt.emailInfo?.sent ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                  Email sent to {shareReceipt.emailInfo.to}
                </p>
              ) : shareReceipt.emailInfo?.error ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  Email not sent: {shareReceipt.emailInfo.error}
                </p>
              ) : (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                  No email sent (missing email or skipped). You can still share below.
                </p>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wide text-slate-500 mb-1 flex items-center gap-1">
                  <FiPhone size={11} /> Send to (WhatsApp number)
                </label>
                <input
                  type="tel"
                  value={shareReceipt.phone}
                  onChange={(e) =>
                    setShareReceipt((prev) => (prev ? { ...prev, phone: e.target.value } : prev))
                  }
                  placeholder="09xxxxxxxx or 2519xxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Opens that chat with the receipt ready — <strong>you still tap Send</strong> in the app.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-1">Receipt preview</p>
                <pre className="text-xs whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-48 overflow-y-auto text-slate-800">
                  {shareReceipt.receiptText}
                </pre>
              </div>

              {canUseDeviceShare() && (
                <button
                  type="button"
                  onClick={async () => {
                    await shareViaDeviceApps({
                      title: 'Order receipt',
                      text: shareReceipt.receiptText
                    });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 shadow-md"
                >
                  <FiSend size={16} />
                  Share via phone apps
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!String(shareReceipt.phone || '').replace(/\D/g, '')) {
                      alert('Enter the customer WhatsApp number above, then try again.');
                      return;
                    }
                    openInAppOrWeb(
                      whatsappAppUrl(shareReceipt.phone, shareReceipt.receiptText),
                      whatsappShareUrl(shareReceipt.phone, shareReceipt.receiptText)
                    );
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-semibold text-sm py-3 shadow-md shadow-emerald-700/20"
                >
                  <FaWhatsapp size={18} />
                  Open WhatsApp chat
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openInAppOrWeb(
                      telegramAppUrl(shareReceipt.receiptText),
                      telegramShareUrl(shareReceipt.receiptText)
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1b8fc4] text-white font-semibold text-sm py-3 shadow-md shadow-sky-700/20"
                >
                  <FaTelegramPlane size={18} />
                  Open Telegram share
                </button>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareReceipt.receiptText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    alert('Could not copy. Select the text manually.');
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2.5"
              >
                {copied ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                {copied ? 'Copied' : 'Copy receipt text'}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                WhatsApp opens the chat for the number above. Telegram opens share — pick the contact, then tap Send.
              </p>
            </div>

            <div className="px-4 py-3 border-t bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShareReceipt(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default Customers;