import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiBarChart2, FiTrendingUp, FiTrendingDown, 
  FiDollarSign, FiPackage, FiShoppingCart 
} from 'react-icons/fi';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    topSellingProducts: [],
    salesByCategory: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/analytics?range=${dateRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        
        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <FiDollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-green-500 text-sm">+12.5%</span>
          </div>
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold">ETB {analyticsData.totalRevenue?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-400 mt-2">vs previous period</p>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiShoppingCart className="text-blue-600" size={24} />
            </div>
            <span className="text-green-500 text-sm">+8.2%</span>
          </div>
          <p className="text-gray-500 text-sm">Total Sales</p>
          <p className="text-2xl font-bold">{analyticsData.totalSales || 0}</p>
          <p className="text-xs text-gray-400 mt-2">transactions</p>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiPackage className="text-purple-600" size={24} />
            </div>
            <span className="text-green-500 text-sm">+5.3%</span>
          </div>
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold">{analyticsData.totalProducts || 0}</p>
          <p className="text-xs text-gray-400 mt-2">in inventory</p>
        </div>

        {/* Stock Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FiBarChart2 className="text-yellow-600" size={24} />
            </div>
            <span className="text-red-500 text-sm">-2.1%</span>
          </div>
          <p className="text-gray-500 text-sm">Low Stock Items</p>
          <p className="text-2xl font-bold">{analyticsData.lowStockItems || 0}</p>
          <p className="text-xs text-gray-400 mt-2">{analyticsData.outOfStockItems || 0} out of stock</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Trend</h2>
          <div className="h-64 flex items-end space-x-2">
            {[65, 45, 75, 85, 55, 70, 60].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t-lg" 
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <div className="space-y-4">
            {analyticsData.topSellingProducts?.map((product, index) => (
              <div key={index} className="flex items-center">
                <span className="w-8 text-gray-500">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} units sold</p>
                </div>
                <span className="font-semibold">ETB {product.revenue?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsData.salesByCategory?.map((category, index) => (
            <div key={index} className="border rounded-lg p-4">
              <p className="text-gray-500 text-sm">{category.name}</p>
              <p className="text-xl font-bold">{category.percentage}%</p>
              <p className="text-sm text-gray-500">ETB {category.revenue?.toLocaleString()}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analyticsData.recentTransactions?.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{transaction.id}</td>
                  <td className="px-4 py-3 text-sm">{transaction.customer}</td>
                  <td className="px-4 py-3 text-sm">{transaction.items}</td>
                  <td className="px-4 py-3 text-sm font-medium">ETB {transaction.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{transaction.date}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {transaction.status || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;