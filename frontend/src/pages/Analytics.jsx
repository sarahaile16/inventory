import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const PeriodToggle = ({ value, onChange }) => (
  <div className="inline-flex rounded-md overflow-hidden border border-gray-200 text-xs sm:text-sm shrink-0">
    {['yearly', 'monthly', 'daily'].map((period) => (
      <button
        key={period}
        type="button"
        onClick={() => onChange(period)}
        className={`px-3 py-1.5 capitalize ${
          value === period
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        {period.charAt(0).toUpperCase() + period.slice(1)}
      </button>
    ))}
  </div>
);

const Analytics = () => {
  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [productPeriod, setProductPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState({
    salesAmount: 0,
    salesLabel: '',
    inventoryAsset: 0,
    storeAsset: 0,
    assetLabel: '',
    productSales: [],
    productSalesLabel: ''
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${API_URL}/analytics/report`, {
          params: { salesPeriod, productPeriod }
        });
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [salesPeriod, productPeriod]);

  const productSalesTotal = report.productSales.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">General Report</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-3 mb-8">
            <h3 className="text-gray-700 font-medium">Sales Amount</h3>
            <PeriodToggle value={salesPeriod} onChange={setSalesPeriod} />
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? '—' : formatMoney(report.salesAmount)}
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Total Sales <span className="ml-2">{report.salesLabel}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-gray-700 font-medium mb-8">Inventory Asset</h3>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? '—' : formatMoney(report.inventoryAsset)}
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Total Value <span className="ml-2">{report.assetLabel}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="text-gray-700 font-medium mb-8">Store Asset</h3>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            {loading ? '—' : formatMoney(report.storeAsset)}
          </p>
          <p className="text-sm text-gray-400 mt-3">
            Total Value <span className="ml-2">{report.assetLabel}</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h3 className="text-gray-700 font-medium">Product Sales</h3>
          <PeriodToggle value={productPeriod} onChange={setProductPeriod} />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : report.productSales.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            No product sales for {report.productSalesLabel}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Quantity</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.productSales.map((item) => {
                  const share = productSalesTotal
                    ? (item.amount / productSalesTotal) * 100
                    : 0;
                  return (
                    <tr key={item.name}>
                      <td className="py-3 pr-4 font-medium text-gray-800">{item.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{item.quantity}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">
                        {formatMoney(item.amount)}
                      </td>
                      <td className="py-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right">
                            {share.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td className="pt-3 font-semibold text-gray-800">Total</td>
                  <td className="pt-3 font-semibold text-gray-800">
                    {report.productSales.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="pt-3 font-semibold text-gray-900">
                    {formatMoney(productSalesTotal)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
