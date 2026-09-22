import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  FiArrowLeft, FiPhone, FiMail, FiCalendar,
  FiDollarSign, FiPackage, FiDownload,
  FiChevronLeft, FiChevronRight, FiClock, FiUpload,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit,
  FiSave, FiPlus, FiMapPin, FiBriefcase, FiTag,
  FiUser, FiFileText, FiTrash2, FiX
} from 'react-icons/fi';
import { canSeeMoney, canSeeCustomerContact } from '../auth/roles';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'orders' || tab === 'payments' || tab === 'files' ? tab : 'overview';
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('payment');
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
  const showMoney = canSeeMoney();
  const showContact = canSeeCustomerContact();

  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.get(`${API_URL}/customers/${id}`);
      setCustomer(response.data);
      setEditFormData(response.data);
      setUploadedFiles(Array.isArray(response.data.documents) ? response.data.documents : []);
    } catch (error) {
      console.error('Error fetching customer:', error);
      setCustomer(null);
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message;
      if (status === 404) {
        setLoadError(
          `Customer #${id} was not found on the server. Refresh the customers list and try again (the server may have restarted).`
        );
      } else if (status === 401) {
        setLoadError('Please log in again to view this customer.');
      } else {
        setLoadError(apiMessage || error.message || 'Could not load customer details.');
      }
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
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert('Please choose a file smaller than 2MB');
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      const isImage = selectedFile.type.startsWith('image/');
      const type = uploadType || (isImage ? 'order' : 'other');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.post(`${API_URL}/customers/${id}/documents`, {
        name: selectedFile.name,
        type,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
        url: dataUrl
      });
      setUploadedFiles(response.data.documents || []);
      if (type === 'payment') {
        setCustomer((current) => current ? { ...current, paymentPhoto: dataUrl, documents: response.data.documents } : current);
      } else if (type === 'order') {
        setCustomer((current) => current ? { ...current, orderPhoto: dataUrl, documents: response.data.documents } : current);
      } else {
        setCustomer((current) => current ? { ...current, documents: response.data.documents } : current);
      }
      alert('File uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadType('payment');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios.delete(`${API_URL}/customers/${id}/documents/${fileId}`);
      setUploadedFiles(response.data.documents || []);
      setCustomer((current) => current ? { ...current, documents: response.data.documents || [] } : current);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      setCustomer({ ...customer, ...editFormData });
      setShowEditModal(false);
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      alert('Customer deleted successfully!');
      navigate('/customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      const updatedPurchases = customer.purchaseHistory.filter((p) => p._id !== paymentId);
      setCustomer({
        ...customer,
        purchaseHistory: updatedPurchases,
        totalPurchases: updatedPurchases.length,
        totalSpent: updatedPurchases.reduce((sum, p) => sum + p.amount, 0)
      });
    }
  };

  const updateOrderStatus = (status) => {
    setCustomer({ ...customer, orderStatus: status });
    alert(`Order status updated to ${status}`);
  };

  const purchaseHistory = customer?.purchaseHistory || [];
  const customerOrders = customer?.orders || [];
  const selectedOrder =
    customerOrders.find((o) => o._id === selectedOrderId) ||
    customerOrders[customerOrders.length - 1] ||
    null;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = purchaseHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(purchaseHistory.length / itemsPerPage) || 1;

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString).slice(0, 10);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium';
    switch (String(status || '').toLowerCase()) {
      case 'completed':
        return <span className={`${base} bg-emerald-100 text-emerald-800`}><FiCheckCircle size={10} /> Completed</span>;
      case 'pending':
        return <span className={`${base} bg-amber-100 text-amber-800`}><FiClock size={10} /> Pending</span>;
      case 'processing':
        return <span className={`${base} bg-sky-100 text-sky-800`}><FiAlertCircle size={10} /> Processing</span>;
      case 'cancelled':
        return <span className={`${base} bg-rose-100 text-rose-800`}><FiXCircle size={10} /> Cancelled</span>;
      default:
        return <span className={`${base} bg-slate-100 text-slate-700`}>{status || 'N/A'}</span>;
    }
  };

  const infoChip = (icon, label, value) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1 mb-0.5">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 truncate" title={value}>{value || '—'}</p>
    </div>
  );

  const modalShell = (children) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => {
        setShowEditModal(false);
        setShowDeleteConfirm(false);
        setShowAddPaymentModal(false);
        setShowUploadModal(false);
      }} />
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-4 sm:p-6 max-w-lg mx-auto">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 space-y-3">
          <p className="font-semibold">Customer not found</p>
          <p className="text-rose-700/90">{loadError || `No customer with id ${id}.`}</p>
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
          >
            <FiArrowLeft size={12} /> Back to customers
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'payments', label: 'Payments' },
    { id: 'orders', label: `Orders${customerOrders.length ? ` (${customerOrders.length})` : ''}` },
    { id: 'files', label: 'Files' }
  ];

  return (
    <div className="p-3 sm:p-5 lg:p-6 max-w-6xl mx-auto w-full min-w-0">
      {/* Top bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => navigate('/customers')}
          className="inline-flex items-center text-xs sm:text-sm text-slate-600 hover:text-teal-800 w-fit"
        >
          <FiArrowLeft className="mr-1.5" size={14} /> Back to customers
        </button>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => setShowEditModal(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs hover:bg-sky-700">
            <FiEdit size={12} /> Edit
          </button>
          <button type="button" onClick={() => setShowDeleteConfirm(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs hover:bg-rose-700">
            <FiTrash2 size={12} /> Delete
          </button>
          {showMoney && (
            <button type="button" onClick={() => setShowAddPaymentModal(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700">
              <FiPlus size={12} /> Payment
            </button>
          )}
          <button type="button" onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs hover:bg-teal-800">
            <FiUpload size={12} /> Upload
          </button>
        </div>
      </div>

      {/* Hero card */}
      <section className="rounded-2xl overflow-hidden border border-teal-100 bg-white shadow-sm mb-4">
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-3 sm:px-5 sm:py-4 text-white flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-teal-100">Customer</p>
            <h1 className="text-base sm:text-lg font-bold truncate">{customer.fullName}</h1>
            {customer.orderDescription && (
              <p className="text-xs text-teal-50/90 mt-0.5 truncate">{customer.orderDescription}</p>
            )}
          </div>
          {customer.orderStatus && getStatusBadge(customer.orderStatus)}
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          {(customer.orderPhoto || (showMoney && customer.paymentPhoto)) && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {customer.orderPhoto && (
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Order photo</p>
                  <img src={customer.orderPhoto} alt="Order" className="h-24 sm:h-32 w-full rounded-xl border object-cover" />
                </div>
              )}
              {showMoney && customer.paymentPhoto && (
                <div>
                  <p className="text-[10px] text-slate-500 mb-1">Payment proof</p>
                  <img src={customer.paymentPhoto} alt="Payment" className="h-24 sm:h-32 w-full rounded-xl border object-cover" />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {infoChip(<FiUser size={10} />, 'Full name', customer.fullName)}
            {showContact && infoChip(<FiPhone size={10} />, 'Phone', customer.phoneNumber)}
            {infoChip(<FiBriefcase size={10} />, 'Organization', customer.organization || 'Individual')}
            {showContact && customer.email && infoChip(<FiMail size={10} />, 'Email', customer.email)}
            {showContact && customer.address && infoChip(<FiMapPin size={10} />, 'Address', customer.address)}
            {infoChip(<FiTag size={10} />, 'Type', customer.customerType || 'Regular')}
            {infoChip(<FiCalendar size={10} />, 'Member since', formatDate(customer.createdAt))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {showMoney ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                <p className="text-[10px] font-medium text-emerald-700 uppercase tracking-wide">Payment</p>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">ETB {formatCurrency(customer.wholePayment || customer.totalSpent)}</p>
                <p className="text-[11px] text-teal-700">First {formatCurrency(customer.firstPayment)}</p>
                <p className="text-[11px] text-amber-700">{customer.restPaid ? 'Rest paid' : `Rest ${formatCurrency(customer.restPayment)}`}</p>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
                <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wide">Deadline</p>
                <p className="text-sm font-bold text-amber-900 mt-0.5">{customer.orderDeadline ? formatDate(customer.orderDeadline) : 'Not set'}</p>
                <p className="text-[11px] text-amber-800/80">{customer.restPaid ? 'Paid in full' : 'Rest due on delivery'}</p>
              </div>
            )}
            <div className="rounded-xl bg-sky-50 border border-sky-100 px-3 py-2.5">
              <p className="text-[10px] font-medium text-sky-700 uppercase tracking-wide">Purchases</p>
              <p className="text-sm font-bold text-sky-900 mt-0.5">{customer.totalPurchases || 0}</p>
            </div>
            <div className="rounded-xl bg-violet-50 border border-violet-100 px-3 py-2.5">
              <p className="text-[10px] font-medium text-violet-700 uppercase tracking-wide">Last purchase</p>
              <p className="text-sm font-bold text-violet-900 mt-0.5">{formatDate(customer.lastPurchaseDate)}</p>
            </div>
          </div>

          {(customer.orderDescription || customer.orderDeadline) && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <FiPackage className="text-orange-600" size={14} />
                <h3 className="text-xs font-semibold text-slate-800">Latest order</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customer.orderDescription && (
                  <div>
                    <p className="text-[10px] text-slate-500">Description</p>
                    <p className="text-sm font-medium text-slate-800">{customer.orderDescription}</p>
                  </div>
                )}
                {customer.orderDeadline && (
                  <div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><FiClock size={10} /> Deadline</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium ${new Date(customer.orderDeadline) < new Date(new Date().toDateString()) ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {formatDate(customer.orderDeadline)}
                        {new Date(customer.orderDeadline) < new Date(new Date().toDateString()) ? ' · Overdue' : ''}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const newDeadline = prompt('Enter new deadline (YYYY-MM-DD):', customer.orderDeadline);
                          if (newDeadline) setCustomer({ ...customer, orderDeadline: newDeadline });
                        }}
                        className="text-sky-600 hover:text-sky-800 p-1"
                        aria-label="Edit deadline"
                      >
                        <FiEdit size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
              <p className="text-[10px] text-slate-500">Notes</p>
              <p className="text-sm text-slate-800">{customer.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-slate-500 mr-1">Status:</span>
            {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateOrderStatus(status)}
                className="px-2 py-1 rounded-lg text-[10px] font-medium capitalize bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-800"
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 overflow-x-auto">
          <nav className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-4">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2">Recent activity</h3>
              {purchaseHistory.length > 0 ? (
                <div className="space-y-2">
                  {purchaseHistory.slice(0, 5).map((purchase, index) => (
                    <div key={purchase._id || index} className="flex justify-between items-center gap-3 rounded-xl border border-slate-100 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{purchase.description || purchase.type || 'Payment'}</p>
                        <p className="text-[11px] text-slate-500">{purchase.date}</p>
                      </div>
                      {showMoney ? (
                        <p className="text-sm font-semibold text-emerald-700 shrink-0">ETB {formatCurrency(purchase.amount)}</p>
                      ) : (
                        <p className="text-[11px] text-teal-700 shrink-0">{purchase.quantity || 0} items</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No recent activity</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              {/* Mobile cards */}
              <div className="sm:hidden space-y-2">
                {currentPurchases.map((purchase, index) => (
                  <div key={purchase._id || index} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{purchase.description || purchase.type || 'Payment'}</p>
                      <button type="button" onClick={() => handleDeletePayment(purchase._id)} className="text-rose-500"><FiTrash2 size={14} /></button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{purchase.date} · {purchase.method || 'N/A'}</p>
                    {showMoney && <p className="text-sm font-semibold text-emerald-700 mt-1">ETB {formatCurrency(purchase.amount)}</p>}
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{purchase.transactionId || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Description</th>
                      {showMoney && <th className="px-3 py-2 text-left font-medium">Amount</th>}
                      <th className="px-3 py-2 text-left font-medium">Method</th>
                      <th className="px-3 py-2 text-left font-medium">Txn</th>
                      <th className="px-3 py-2 text-left font-medium"> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentPurchases.map((purchase, index) => (
                      <tr key={purchase._id || index}>
                        <td className="px-3 py-2">{indexOfFirstItem + index + 1}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{purchase.date}</td>
                        <td className="px-3 py-2">{purchase.description || purchase.type || 'Payment'}</td>
                        {showMoney && <td className="px-3 py-2 font-medium text-emerald-700">ETB {formatCurrency(purchase.amount)}</td>}
                        <td className="px-3 py-2">{purchase.method || 'N/A'}</td>
                        <td className="px-3 py-2 max-w-[8rem] truncate">{purchase.transactionId || '—'}</td>
                        <td className="px-3 py-2">
                          <button type="button" onClick={() => handleDeletePayment(purchase._id)} className="text-rose-500 hover:text-rose-700">
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {purchaseHistory.length > itemsPerPage && (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded-lg text-xs disabled:opacity-40"><FiChevronLeft size={14} /></button>
                    <button type="button" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 border rounded-lg text-xs disabled:opacity-40"><FiChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-500 rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center">
                  No orders yet. Use Add Order on the customers list.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {[...customerOrders].reverse().map((order, index) => {
                      const isActive = (selectedOrder?._id || '') === order._id;
                      return (
                        <button
                          key={order._id || index}
                          type="button"
                          onClick={() => setSelectedOrderId(order._id)}
                          className={`w-full text-left rounded-xl border px-3 py-2.5 transition ${
                            isActive
                              ? 'border-teal-300 bg-teal-50/80 ring-1 ring-teal-200'
                              : 'border-slate-100 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">
                                {order.description || 'Order'}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {order.date ? formatDate(order.date) : '—'}
                                {order.transactionId ? ` · ${order.transactionId}` : ''}
                              </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              {getStatusBadge(order.status)}
                              <span className="text-[10px] font-medium text-sky-700">View details</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedOrder && (
                    <div className="rounded-xl border border-teal-100 bg-teal-50/40 p-3 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-teal-900 uppercase tracking-wide">
                          Order details
                        </h4>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-slate-500">Description</p>
                          <p className="text-sm font-medium text-slate-800">{selectedOrder.description || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Deadline</p>
                          <p className={`text-sm font-medium ${
                            selectedOrder.deadline && new Date(selectedOrder.deadline) < new Date(new Date().toDateString())
                              ? 'text-rose-600'
                              : 'text-emerald-700'
                          }`}>
                            {selectedOrder.deadline ? formatDate(selectedOrder.deadline) : 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Order date</p>
                          <p className="text-sm font-medium text-slate-800">
                            {selectedOrder.date ? formatDate(selectedOrder.date) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500">Receipt</p>
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {selectedOrder.transactionId || '—'}
                          </p>
                        </div>
                        {showMoney && (
                          <>
                            <div>
                              <p className="text-[10px] text-slate-500">Whole</p>
                              <p className="text-sm font-semibold text-slate-800">
                                ETB {formatCurrency(selectedOrder.wholePayment)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500">First / Rest</p>
                              <p className="text-sm font-medium text-teal-800">
                                ETB {formatCurrency(selectedOrder.firstPayment)}
                                <span className="text-amber-700">
                                  {' · '}
                                  {selectedOrder.restPaid
                                    ? 'Rest paid'
                                    : `Rest ETB ${formatCurrency(selectedOrder.restPayment)}`}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500">Payment method</p>
                              <p className="text-sm font-medium text-slate-800">
                                {selectedOrder.paymentMethod || '—'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {(selectedOrder.orderPhoto || (showMoney && selectedOrder.paymentPhoto)) && (
                        <div className="grid grid-cols-2 gap-2">
                          {selectedOrder.orderPhoto && (
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">Order photo</p>
                              <img
                                src={selectedOrder.orderPhoto}
                                alt="Order"
                                className="h-24 w-full rounded-xl border object-cover"
                              />
                            </div>
                          )}
                          {showMoney && selectedOrder.paymentPhoto && (
                            <div>
                              <p className="text-[10px] text-slate-500 mb-1">Payment proof</p>
                              <img
                                src={selectedOrder.paymentPhoto}
                                alt="Payment"
                                className="h-24 w-full rounded-xl border object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              {uploadedFiles.length > 0 ? (
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 p-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {file.url && String(file.url).startsWith('data:image') ? (
                          <img src={file.url} alt={file.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <FiFileText className="text-teal-600 shrink-0" size={18} />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-500">{file.type ? `${file.type} · ` : ''}{file.date} · {file.size}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {file.url && (
                          <a href={file.url} target="_blank" rel="noreferrer" className="text-sky-600"><FiDownload size={16} /></a>
                        )}
                        <button type="button" onClick={() => handleDeleteFile(file.id)} className="text-rose-500"><FiTrash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed rounded-xl">
                  <FiUpload className="mx-auto mb-2 opacity-50" size={24} />
                  <p className="text-xs">No files yet</p>
                  <button type="button" onClick={() => setShowUploadModal(true)} className="mt-2 text-xs text-teal-700 font-medium">Upload a file</button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit modal */}
      {showEditModal && modalShell(
        <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-teal-700 px-4 py-3 text-white flex justify-between items-center sticky top-0">
            <h2 className="text-sm font-semibold flex items-center gap-1.5"><FiEdit size={14} /> Edit customer</h2>
            <button type="button" onClick={() => setShowEditModal(false)}><FiX size={18} /></button>
          </div>
          <div className="p-4 overflow-y-auto max-h-[calc(92vh-7rem)] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['fullName', 'Full name', 'text'],
                ['phoneNumber', 'Phone', 'text'],
                ['organization', 'Organization', 'text'],
                ['email', 'Email', 'email'],
                ['address', 'Address', 'text'],
                ['orderDescription', 'Order description', 'text'],
                ['orderDeadline', 'Deadline', 'date']
              ].map(([key, label, type]) => (
                <div key={key} className={key === 'address' || key === 'orderDescription' ? 'sm:col-span-2' : ''}>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={editFormData[key] || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
                <select
                  value={editFormData.customerType || 'Regular'}
                  onChange={(e) => setEditFormData({ ...editFormData, customerType: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                >
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="New">New</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Notes</label>
                <textarea
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">
            <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 text-xs rounded-lg border">Cancel</button>
            <button type="button" onClick={handleUpdateCustomer} className="px-3 py-1.5 text-xs rounded-lg bg-teal-700 text-white inline-flex items-center gap-1"><FiSave size={12} /> Save</button>
          </div>
        </div>
      )}

      {showDeleteConfirm && modalShell(
        <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl m-0 sm:m-0" onClick={(e) => e.stopPropagation()}>
          <div className="bg-rose-600 px-4 py-3 text-white">
            <h2 className="text-sm font-semibold flex items-center gap-1.5"><FiTrash2 size={14} /> Delete customer</h2>
          </div>
          <div className="p-4 text-sm text-slate-700">
            Delete <span className="font-semibold">{customer.fullName}</span>? This cannot be undone.
          </div>
          <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">
            <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1.5 text-xs rounded-lg border">Cancel</button>
            <button type="button" onClick={handleDeleteCustomer} className="px-3 py-1.5 text-xs rounded-lg bg-rose-600 text-white">Delete</button>
          </div>
        </div>
      )}

      {showAddPaymentModal && modalShell(
        <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-emerald-600 px-4 py-3 text-white flex justify-between items-center">
            <h2 className="text-sm font-semibold flex items-center gap-1.5"><FiDollarSign size={14} /> Add payment</h2>
            <button type="button" onClick={() => setShowAddPaymentModal(false)}><FiX size={18} /></button>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto">
            {[
              ['amount', 'Amount (ETB)', 'number'],
              ['date', 'Date', 'date'],
              ['transactionId', 'Transaction ID', 'text'],
              ['description', 'Description', 'text']
            ].map(([key, label, type]) => (
              <div key={key}>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">{label}</label>
                <input
                  type={type}
                  value={newPayment[key]}
                  onChange={(e) => setNewPayment({ ...newPayment, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Method</label>
              <select value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200">
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
          </div>
          <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddPaymentModal(false)} className="px-3 py-1.5 text-xs rounded-lg border">Cancel</button>
            <button type="button" onClick={handleAddPayment} className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white">Save</button>
          </div>
        </div>
      )}

      {showUploadModal && modalShell(
        <div className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="bg-teal-700 px-4 py-3 text-white flex justify-between items-center">
            <h2 className="text-sm font-semibold flex items-center gap-1.5"><FiUpload size={14} /> Upload file</h2>
            <button type="button" onClick={() => setShowUploadModal(false)}><FiX size={18} /></button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Type</label>
              <select value={uploadType} onChange={(e) => setUploadType(e.target.value)} className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200">
                <option value="payment">Payment proof</option>
                <option value="order">Order photo</option>
                <option value="other">Other</option>
              </select>
            </div>
            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 cursor-pointer hover:border-teal-300">
              {selectedFile ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <FiUpload className="text-slate-400" size={22} />
                  <p className="text-xs text-slate-600">Tap to select file</p>
                </>
              )}
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="px-4 py-3 border-t bg-slate-50 flex justify-end gap-2">
            <button type="button" onClick={() => setShowUploadModal(false)} className="px-3 py-1.5 text-xs rounded-lg border">Cancel</button>
            <button type="button" onClick={handleFileUpload} disabled={!selectedFile || uploading} className="px-3 py-1.5 text-xs rounded-lg bg-teal-700 text-white disabled:opacity-50">
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
