import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiUpload, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PaymentInfo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    transactionId: 'FS-1003484885885',
    paymentMethod: 'Bank Transfer',
    priceInETB: 187500,
    uploadProof: null
  });

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
      
      // Validate required fields
      if (!paymentData.transactionId) {
        toast.error('Transaction ID is required');
        return;
      }
      
      if (!paymentData.paymentMethod) {
        toast.error('Payment method is required');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('transactionId', paymentData.transactionId);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('priceInETB', paymentData.priceInETB);
      if (paymentData.uploadProof) {
        formData.append('paymentProof', paymentData.uploadProof);
      }

      // If using real API:
      // await axios.post('http://localhost:5000/api/sales/payment', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data'
      //   }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Payment saved successfully!');
      
      // Navigate back to sales or invoice
      setTimeout(() => {
        navigate('/store/sales');
      }, 1500);
      
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payment Information</h1>
          <p className="text-gray-600">Complete the payment details for the sale</p>
        </div>
      </div>

      {/* Payment Form - Matching your screenshot */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Transaction Details</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transaction ID */}
            <div>
              <label className="block text-gray-700 mb-2">
                Transaction ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="transactionId"
                value={paymentData.transactionId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter transaction ID"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Unique identifier for this transaction
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-gray-700 mb-2">
                Payment Method
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="paymentMethod"
                value={paymentData.paymentMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Upload Payment Proof */}
            <div>
              <label className="block text-gray-700 mb-2">
                Upload Payment Proof
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              {paymentData.uploadProof && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ {paymentData.uploadProof.name} selected
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Upload receipt, screenshot, or proof of payment
              </p>
            </div>

            {/* Price in ETB */}
            <div>
              <label className="block text-gray-700 mb-2">
                Price in ETB
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="number"
                  name="priceInETB"
                  value={paymentData.priceInETB}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{paymentData.transactionId || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{paymentData.paymentMethod || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proof of Payment:</span>
                <span className="font-medium">
                  {paymentData.uploadProof ? 'Uploaded' : 'Not uploaded'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(paymentData.priceInETB)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveSale}
            disabled={loading}
            className={`px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FiCheck className="mr-2" />
                Save Sale
              </>
            )}
          </button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Payment Instructions</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Transaction ID should be unique for each sale</li>
          <li>• Upload clear proof of payment (receipt, screenshot, etc.)</li>
          <li>• Verify the amount before saving</li>
          <li>• For bank transfers, include reference number in transaction ID</li>
        </ul>
      </div>

      {/* Receipt Preview (if file uploaded) */}
      {paymentData.uploadProof && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Uploaded Proof Preview</h3>
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600">
              File: {paymentData.uploadProof.name}
            </p>
            <p className="text-sm text-gray-500">
              Size: {(paymentData.uploadProof.size / 1024).toFixed(2)} KB
            </p>
            {paymentData.uploadProof.type.startsWith('image/') && (
              <div className="mt-3">
                <img
                  src={URL.createObjectURL(paymentData.uploadProof)}
                  alt="Payment proof"
                  className="max-h-48 rounded border"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInfo;