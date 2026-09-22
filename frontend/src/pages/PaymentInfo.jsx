import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { canSeeMoney } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  SoftButton
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const inputClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30';

const PaymentInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const saleState = location.state || {};
  const showMoney = canSeeMoney();
  const [loading, setLoading] = useState(false);
  const startingTotal = Number(saleState.total || 0);
  const startingFirst = startingTotal ? Number((startingTotal * 0.5).toFixed(2)) : 0;
  const [paymentData, setPaymentData] = useState({
    transactionId: saleState.transactionId || `FS-${Date.now()}`,
    paymentMethod: 'Bank Transfer',
    priceInETB: startingTotal,
    firstPayment: startingFirst,
    deadline: saleState.deadline || '',
    uploadProof: null
  });
  const restPayment = Math.max(
    0,
    Number(paymentData.priceInETB || 0) - Number(paymentData.firstPayment || 0)
  );

  const [paymentMethods] = useState([
    'Bank Transfer',
    'Cash',
    'Credit Card',
    'Mobile Money'
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({
      ...paymentData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentData({
        ...paymentData,
        uploadProof: file
      });
    }
  };

  const handleSaveSale = async () => {
    try {
      setLoading(true);

      if (!paymentData.transactionId) {
        toast.error('Transaction ID is required');
        return;
      }

      if (!paymentData.paymentMethod) {
        toast.error('Payment method is required');
        return;
      }

      if (!paymentData.deadline) {
        toast.error('Order deadline is required');
        return;
      }

      if (
        Number(paymentData.firstPayment) < 0 ||
        Number(paymentData.firstPayment) > Number(paymentData.priceInETB || 0)
      ) {
        toast.error('First payment must be between 0 and the whole payment');
        return;
      }

      const whole = Number(paymentData.priceInETB || saleState.total || 0);
      const first = Number(paymentData.firstPayment || 0);
      await axios.post(`${API_URL}/sales`, {
        transactionId: paymentData.transactionId,
        paymentMethod: paymentData.paymentMethod,
        totalAmount: whole,
        firstPayment: first,
        restPayment: Math.max(0, whole - first),
        deadline: paymentData.deadline,
        status: 'pending',
        customerName: saleState.buyerInfo?.fullName || '',
        cart: saleState.cart || []
      });

      toast.success(showMoney ? 'Payment saved successfully!' : 'Order saved with deadline.');

      setTimeout(() => {
        navigate('/orders');
      }, 800);
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to save payment');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <PageShell>
      <PageHero
        tone="teal"
        eyebrow="Checkout"
        title="Payment Information"
        subtitle="Complete the payment details for the sale"
        actions={
          <SoftButton
            onClick={() => navigate(-1)}
            className="bg-white/15 hover:bg-white/25 text-white"
          >
            <FiArrowLeft size={14} /> Back
          </SoftButton>
        }
      />

      <StatGrid cols="3">
        <StatCard
          label="Whole payment"
          value={formatCurrency(paymentData.priceInETB)}
          accent="slate"
        />
        <StatCard
          label="First payment"
          value={formatCurrency(paymentData.firstPayment)}
          accent="teal"
        />
        <StatCard
          label="Rest on delivery"
          value={formatCurrency(restPayment)}
          accent="amber"
        />
      </StatGrid>

      <Panel title="Transaction details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Transaction ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="transactionId"
              value={paymentData.transactionId}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Enter transaction ID"
              required
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Unique identifier for this transaction</p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={paymentData.paymentMethod}
              onChange={handleInputChange}
              className={inputClass}
              required
            >
              <option value="">Select Method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Upload Payment Proof
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {paymentData.uploadProof && (
              <p className="text-xs text-emerald-600 mt-0.5">
                ✓ {paymentData.uploadProof.name} selected
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5">
              Receipt, screenshot, or proof of payment
            </p>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Order deadline <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="deadline"
              value={paymentData.deadline}
              onChange={handleInputChange}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Whole payment (ETB) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="number"
                name="priceInETB"
                value={paymentData.priceInETB}
                onChange={handleInputChange}
                className={`${inputClass} pl-9`}
                placeholder="Full order amount"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              First payment (ETB) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="firstPayment"
              value={paymentData.firstPayment}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="Paid now"
              required
              min="0"
              step="0.01"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">
              Paid now. Rest due on delivery.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mb-1">
              Rest payment on delivery (ETB)
            </label>
            <input
              type="number"
              value={restPayment}
              readOnly
              className={`${inputClass} bg-slate-100`}
            />
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">Payment Summary</h3>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Transaction ID</span>
            <span className="font-medium truncate">{paymentData.transactionId || '—'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Method</span>
            <span className="font-medium">{paymentData.paymentMethod || '—'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Proof</span>
            <span className="font-medium">
              {paymentData.uploadProof ? 'Uploaded' : 'Not uploaded'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">Deadline</span>
            <span className="font-medium">{paymentData.deadline || '—'}</span>
          </div>
          <div className="flex justify-between gap-2 pt-1.5 border-t border-slate-200">
            <span className="text-slate-500">Whole</span>
            <span className="font-medium">{formatCurrency(paymentData.priceInETB)}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500">First now</span>
            <span className="font-medium text-teal-700">
              {formatCurrency(paymentData.firstPayment)}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="font-semibold">Rest on delivery</span>
            <span className="text-base font-bold text-amber-600">
              {formatCurrency(restPayment)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-1.5">
          <SoftButton
            onClick={() => navigate(-1)}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </SoftButton>
          <SoftButton
            onClick={handleSaveSale}
            disabled={loading}
            className={`bg-emerald-600 text-white hover:bg-emerald-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                Processing…
              </>
            ) : (
              <>
                <FiCheck size={12} /> Save Sale
              </>
            )}
          </SoftButton>
        </div>
      </Panel>

      <Panel title="Payment instructions" className="mt-3 sm:mt-4">
        <ul className="text-xs text-teal-800 space-y-1 list-disc ml-4">
          <li>Transaction ID should be unique for each sale</li>
          <li>Upload clear proof of payment when available</li>
          <li>Enter whole price and first payment; rest stays for delivery</li>
          <li>Admin is notified when deadline is near and rest is still due</li>
          <li>For bank transfers, include reference in transaction ID</li>
        </ul>
      </Panel>

      {paymentData.uploadProof && (
        <Panel title="Uploaded proof preview" className="mt-3 sm:mt-4">
          <p className="text-xs text-slate-600">File: {paymentData.uploadProof.name}</p>
          <p className="text-[10px] text-slate-500">
            Size: {(paymentData.uploadProof.size / 1024).toFixed(2)} KB
          </p>
          {paymentData.uploadProof.type.startsWith('image/') && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(paymentData.uploadProof)}
                alt="Payment proof"
                className="max-h-40 rounded-lg border border-slate-100"
              />
            </div>
          )}
        </Panel>
      )}
    </PageShell>
  );
};

export default PaymentInfo;
