// controllers/analyticsController.js

class AnalyticsController {
  constructor() {
    this.cache = {
      daily: null,
      weekly: null,
      monthly: null,
      yearly: null,
      lastUpdated: null
    };
  }

  // ========== DASHBOARD OVERVIEW ==========
  getDashboardOverview = (req, res) => {
    try {
      const { products, sales, customers } = this.getMockData();
      
      const overview = {
        summary: this.calculateSummary(products, sales, customers),
        trends: this.calculateTrends(sales),
        topProducts: this.getTopProducts(products, sales),
        recentActivity: this.getRecentActivity(sales)
      };

      res.json(overview);
    } catch (error) {
      console.error('Error in dashboard overview:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== SALES ANALYTICS ==========
  getSalesAnalytics = (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const { sales } = this.getMockData();
      
      const analytics = {
        summary: this.getSalesSummary(sales, period),
        daily: this.getDailySales(sales, period),
        byPaymentMethod: this.getSalesByPaymentMethod(sales),
        byProduct: this.getSalesByProduct(sales),
        trends: this.calculateSalesTrends(sales, period)
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error in sales analytics:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== PRODUCT ANALYTICS ==========
  getProductAnalytics = (req, res) => {
    try {
      const { products, sales } = this.getMockData();
      
      const analytics = {
        inventory: this.getInventoryAnalytics(products),
        performance: this.getProductPerformance(products, sales),
        categories: this.getCategoryAnalytics(products, sales),
        movement: this.getStockMovementAnalytics(products, sales)
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error in product analytics:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== CUSTOMER ANALYTICS ==========
  getCustomerAnalytics = (req, res) => {
    try {
      const { customers, sales } = this.getMockData();
      
      const analytics = {
        summary: this.getCustomerSummary(customers, sales),
        topCustomers: this.getTopCustomers(customers, sales),
        retention: this.calculateRetention(customers, sales),
        segments: this.getCustomerSegments(customers, sales)
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error in customer analytics:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== FINANCIAL REPORTS ==========
  getFinancialReports = (req, res) => {
    try {
      const { period = 'month' } = req.query;
      const { products, sales } = this.getMockData();
      
      const reports = {
        profitLoss: this.calculateProfitLoss(sales, period),
        revenue: this.getRevenueBreakdown(sales, period),
        costs: this.getCostBreakdown(products, sales),
        margins: this.calculateMargins(products, sales)
      };

      res.json(reports);
    } catch (error) {
      console.error('Error in financial reports:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== TREND ANALYSIS ==========
  getTrendAnalysis = (req, res) => {
    try {
      const { metric = 'revenue', period = '6months' } = req.query;
      const { sales } = this.getMockData();
      
      const trends = {
        data: this.calculateTrendData(sales, metric, period),
        forecast: this.generateForecast(sales, metric),
        comparisons: this.getYearOverYear(sales),
        insights: this.generateInsights(sales)
      };

      res.json(trends);
    } catch (error) {
      console.error('Error in trend analysis:', error);
      res.status(500).json({ error: error.message });
    }
  };

  // ========== HELPER METHODS ==========

  getMockData() {
    // Products data
    const products = [
      { _id: 1, name: 'GODMIDDAG (18 Piece)', category: 'Dinnerware', price: 3900, cost: 2500, stock: 15, restockLevel: 3 },
      { _id: 2, name: 'GLADELIG (18 Piece)', category: 'Dinnerware', price: 9800, cost: 6500, stock: 70, restockLevel: 5 },
      { _id: 3, name: 'FÄRGKLAR (18 Piece)', category: 'Dinnerware', price: 2900, cost: 1800, stock: 50, restockLevel: 15 },
      { _id: 4, name: 'VARDAGEN', category: 'Bowls', price: 3500, cost: 2200, stock: 50, restockLevel: 20 },
      { _id: 5, name: 'MOSSMAL (Bowl)', category: 'Bowls', price: 2000, cost: 1200, stock: 5, restockLevel: 5 },
      { _id: 6, name: 'VÄRDERA (6 pieces)', category: 'Plates', price: 1500, cost: 900, stock: 15, restockLevel: 5 },
      { _id: 7, name: 'HAVSGÅDDA Plate', category: 'Plates', price: 200, cost: 100, stock: 100, restockLevel: 50 }
    ];

    // Sales data (last 30 days)
    const sales = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + Math.floor(Math.random() * 30));
      
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const amount = product.price * quantity;
      const cost = product.cost * quantity;
      const profit = amount - cost;

      sales.push({
        _id: i + 1,
        date: date.toISOString().split('T')[0],
        productId: product._id,
        productName: product.name,
        category: product.category,
        quantity,
        amount,
        cost,
        profit,
        margin: (profit / amount) * 100,
        paymentMethod: ['Bank Transfer', 'Cash', 'Mobile Money'][Math.floor(Math.random() * 3)],
        customerId: Math.floor(Math.random() * 5) + 1
      });
    }

    // Sort by date
    sales.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Customers data
    const customers = [
      { _id: 1, name: 'Dagmawi Tsegaye', totalSpent: 187500, orders: 15, lastOrder: '2025-02-20' },
      { _id: 2, name: 'Benyam Assegdw', totalSpent: 436500, orders: 8, lastOrder: '2025-02-18' },
      { _id: 3, name: 'Abebe Kebede', totalSpent: 94500, orders: 5, lastOrder: '2025-02-15' },
      { _id: 4, name: 'Almaz Worku', totalSpent: 156000, orders: 7, lastOrder: '2025-02-22' },
      { _id: 5, name: 'Kahlid Teshome', totalSpent: 23400, orders: 2, lastOrder: '2025-02-10' }
    ];

    return { products, sales, customers };
  }

  calculateSummary(products, sales, customers) {
    const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.cost, 0);
    const inventoryValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const inventoryRetail = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return {
      revenue: {
        total: totalRevenue,
        averagePerDay: totalRevenue / 30,
        trend: this.calculateTrend(sales.map(s => s.amount))
      },
      profit: {
        total: totalProfit,
        margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
        trend: this.calculateTrend(sales.map(s => s.profit))
      },
      inventory: {
        value: inventoryValue,
        retailValue: inventoryRetail,
        potentialProfit: inventoryRetail - inventoryValue,
        items: products.length
      },
      customers: {
        total: customers.length,
        active: customers.filter(c => {
          const last30Days = new Date();
          last30Days.setDate(last30Days.getDate() - 30);
          return new Date(c.lastOrder) >= last30Days;
        }).length,
        averageSpend: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
      },
      transactions: {
        total: sales.length,
        averageValue: totalRevenue / sales.length
      }
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;
    
    return firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
  }

  calculateTrends(sales) {
    const byDay = this.groupBy(sales, 'date');
    const dates = Object.keys(byDay).sort();
    
    return {
      daily: dates.map(date => ({
        date,
        revenue: byDay[date].reduce((sum, s) => sum + s.amount, 0),
        profit: byDay[date].reduce((sum, s) => sum + s.profit, 0),
        transactions: byDay[date].length
      })),
      weekly: this.getWeeklyTrends(sales),
      monthly: this.getMonthlyTrends(sales)
    };
  }

  getWeeklyTrends(sales) {
    const weekly = {};
    sales.forEach(sale => {
      const date = new Date(sale.date);
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      if (!weekly[week]) weekly[week] = [];
      weekly[week].push(sale);
    });

    return Object.entries(weekly).map(([week, weekSales]) => ({
      week,
      revenue: weekSales.reduce((sum, s) => sum + s.amount, 0),
      profit: weekSales.reduce((sum, s) => sum + s.profit, 0),
      transactions: weekSales.length
    }));
  }

  getMonthlyTrends(sales) {
    const monthly = {};
    sales.forEach(sale => {
      const month = sale.date.substring(0, 7);
      if (!monthly[month]) monthly[month] = [];
      monthly[month].push(sale);
    });

    return Object.entries(monthly).map(([month, monthSales]) => ({
      month,
      revenue: monthSales.reduce((sum, s) => sum + s.amount, 0),
      profit: monthSales.reduce((sum, s) => sum + s.profit, 0),
      transactions: monthSales.length
    }));
  }

  getTopProducts(products, sales) {
    const productSales = {};
    sales.forEach(sale => {
      if (!productSales[sale.productId]) {
        productSales[sale.productId] = {
          id: sale.productId,
          name: sale.productName,
          quantity: 0,
          revenue: 0,
          profit: 0
        };
      }
      productSales[sale.productId].quantity += sale.quantity;
      productSales[sale.productId].revenue += sale.amount;
      productSales[sale.productId].profit += sale.profit;
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        ...p,
        product: products.find(prod => prod._id === p.id)
      }));
  }

  getRecentActivity(sales) {
    return sales
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(sale => ({
        id: sale._id,
        date: sale.date,
        product: sale.productName,
        amount: sale.amount,
        customer: sale.customerId,
        type: 'sale'
      }));
  }

  getSalesSummary(sales, period) {
    const filtered = this.filterByPeriod(sales, period);
    
    return {
      total: filtered.reduce((sum, s) => sum + s.amount, 0),
      count: filtered.length,
      average: filtered.length > 0 
        ? filtered.reduce((sum, s) => sum + s.amount, 0) / filtered.length 
        : 0,
      min: Math.min(...filtered.map(s => s.amount)),
      max: Math.max(...filtered.map(s => s.amount))
    };
  }

  getDailySales(sales, period) {
    const filtered = this.filterByPeriod(sales, period);
    const byDay = this.groupBy(filtered, 'date');
    
    return Object.entries(byDay).map(([date, daySales]) => ({
      date,
      revenue: daySales.reduce((sum, s) => sum + s.amount, 0),
      profit: daySales.reduce((sum, s) => sum + s.profit, 0),
      transactions: daySales.length
    }));
  }

  getSalesByPaymentMethod(sales) {
    const byMethod = this.groupBy(sales, 'paymentMethod');
    
    return Object.entries(byMethod).map(([method, methodSales]) => ({
      method,
      count: methodSales.length,
      total: methodSales.reduce((sum, s) => sum + s.amount, 0),
      percentage: (methodSales.length / sales.length) * 100
    }));
  }

  getSalesByProduct(sales) {
    const byProduct = this.groupBy(sales, 'productName');
    
    return Object.entries(byProduct).map(([product, productSales]) => ({
      product,
      quantity: productSales.reduce((sum, s) => sum + s.quantity, 0),
      revenue: productSales.reduce((sum, s) => sum + s.amount, 0),
      profit: productSales.reduce((sum, s) => sum + s.profit, 0),
      transactions: productSales.length
    }));
  }

  calculateSalesTrends(sales, period) {
    const filtered = this.filterByPeriod(sales, period);
    const byDay = this.groupBy(filtered, 'date');
    const values = Object.values(byDay).map(d => d.reduce((sum, s) => sum + s.amount, 0));
    
    return {
      direction: values[values.length - 1] > values[0] ? 'up' : 'down',
      change: this.calculateTrend(values),
      volatility: this.calculateVolatility(values),
      projection: this.linearRegression(values)
    };
  }

  getInventoryAnalytics(products) {
    const totalValue = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const lowStock = products.filter(p => p.stock <= p.restockLevel);
    
    return {
      summary: {
        totalItems: products.length,
        totalValue,
        averageValue: totalValue / products.length,
        lowStockCount: lowStock.length
      },
      byCategory: this.groupBy(products, 'category'),
      lowStock: lowStock.map(p => ({
        name: p.name,
        current: p.stock,
        restock: p.restockLevel,
        value: p.cost * p.stock
      }))
    };
  }

  getProductPerformance(products, sales) {
    return products.map(product => {
      const productSales = sales.filter(s => s.productId === product._id);
      const revenue = productSales.reduce((sum, s) => sum + s.amount, 0);
      const profit = productSales.reduce((sum, s) => sum + s.profit, 0);
      const quantity = productSales.reduce((sum, s) => sum + s.quantity, 0);
      
      return {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        margin: ((product.price - product.cost) / product.price) * 100,
        sales: {
          revenue,
          profit,
          quantity,
          transactions: productSales.length
        },
        inventory: {
          stock: product.stock,
          value: product.cost * product.stock,
          turnover: quantity / (product.stock || 1)
        }
      };
    });
  }

  getCategoryAnalytics(products, sales) {
    const categories = {};
    
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          products: [],
          totalValue: 0,
          totalRevenue: 0,
          totalProfit: 0
        };
      }
      
      categories[product.category].products.push(product);
      categories[product.category].totalValue += product.cost * product.stock;
      
      const productSales = sales.filter(s => s.productId === product._id);
      categories[product.category].totalRevenue += productSales.reduce((sum, s) => sum + s.amount, 0);
      categories[product.category].totalProfit += productSales.reduce((sum, s) => sum + s.profit, 0);
    });
    
    return categories;
  }

  getStockMovementAnalytics(products, sales) {
    return products.map(product => {
      const productSales = sales.filter(s => s.productId === product._id);
      const sold = productSales.reduce((sum, s) => sum + s.quantity, 0);
      const daysInStock = 30; // Simplified
      
      return {
        name: product.name,
        sold,
        remaining: product.stock,
        turnover: sold / (product.stock || 1),
        daysToSell: product.stock > 0 ? daysInStock * (product.stock / sold) : Infinity
      };
    });
  }

  getCustomerSummary(customers, sales) {
    const activeCustomers = customers.filter(c => {
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      return new Date(c.lastOrder) >= last30Days;
    });
    
    return {
      total: customers.length,
      active: activeCustomers.length,
      new: customers.filter(c => {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        return new Date(c.lastOrder) >= last30Days;
      }).length,
      returning: activeCustomers.filter(c => {
        const orderCount = sales.filter(s => s.customerId === c._id).length;
        return orderCount > 1;
      }).length,
      churn: customers.length > 0 
        ? ((customers.length - activeCustomers.length) / customers.length) * 100 
        : 0
    };
  }

  getTopCustomers(customers, sales) {
    return customers
      .map(customer => ({
        ...customer,
        totalRevenue: sales
          .filter(s => s.customerId === customer._id)
          .reduce((sum, s) => sum + s.amount, 0),
        totalProfit: sales
          .filter(s => s.customerId === customer._id)
          .reduce((sum, s) => sum + s.profit, 0),
        orderCount: sales.filter(s => s.customerId === customer._id).length
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);
  }

  calculateRetention(customers, sales) {
    const cohorts = {};
    
    customers.forEach(customer => {
      const month = customer.lastOrder.substring(0, 7);
      if (!cohorts[month]) {
        cohorts[month] = {
          total: 0,
          retained: 0
        };
      }
      cohorts[month].total++;
      
      // Check if customer ordered in subsequent months
      const customerSales = sales.filter(s => s.customerId === customer._id);
      if (customerSales.length > 1) {
        cohorts[month].retained++;
      }
    });
    
    return Object.entries(cohorts).map(([month, data]) => ({
      month,
      retentionRate: data.total > 0 ? (data.retained / data.total) * 100 : 0
    }));
  }

  getCustomerSegments(customers, sales) {
    const segments = {
      vip: [],
      regular: [],
      new: [],
      atRisk: []
    };
    
    customers.forEach(customer => {
      const customerSales = sales.filter(s => s.customerId === customer._id);
      const totalSpent = customerSales.reduce((sum, s) => sum + s.amount, 0);
      const daysSinceLast = Math.floor(
        (new Date() - new Date(customer.lastOrder)) / (1000 * 60 * 60 * 24)
      );
      
      if (totalSpent > 100000) {
        segments.vip.push(customer);
      } else if (customerSales.length === 1 && daysSinceLast < 30) {
        segments.new.push(customer);
      } else if (daysSinceLast > 60) {
        segments.atRisk.push(customer);
      } else {
        segments.regular.push(customer);
      }
    });
    
    return Object.entries(segments).map(([segment, customers]) => ({
      segment,
      count: customers.length,
      percentage: (customers.length / customers.length) * 100
    }));
  }

  calculateProfitLoss(sales, period) {
    const filtered = this.filterByPeriod(sales, period);
    
    return {
      revenue: filtered.reduce((sum, s) => sum + s.amount, 0),
      cost: filtered.reduce((sum, s) => sum + s.cost, 0),
      grossProfit: filtered.reduce((sum, s) => sum + (s.amount - s.cost), 0),
      netProfit: filtered.reduce((sum, s) => sum + s.profit, 0),
      margin: filtered.length > 0 
        ? (filtered.reduce((sum, s) => sum + s.profit, 0) / filtered.reduce((sum, s) => sum + s.amount, 0)) * 100
        : 0
    };
  }

  getRevenueBreakdown(sales, period) {
    const filtered = this.filterByPeriod(sales, period);
    
    return {
      byProduct: this.getSalesByProduct(filtered),
      byCategory: this.groupBy(filtered, 'category'),
      byPaymentMethod: this.getSalesByPaymentMethod(filtered)
    };
  }

  getCostBreakdown(products, sales) {
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.stock), 0);
    const soldCost = sales.reduce((sum, s) => sum + s.cost, 0);
    
    return {
      inventory: totalCost,
      sold: soldCost,
      average: soldCost / (sales.length || 1)
    };
  }

  calculateMargins(products, sales) {
    const productMargins = products.map(p => ({
      name: p.name,
      margin: ((p.price - p.cost) / p.price) * 100
    }));
    
    const saleMargins = sales.map(s => s.margin);
    
    return {
      averageProductMargin: productMargins.reduce((sum, p) => sum + p.margin, 0) / productMargins.length,
      averageSaleMargin: saleMargins.reduce((sum, m) => sum + m, 0) / saleMargins.length,
      byProduct: productMargins
    };
  }

  calculateTrendData(sales, metric, period) {
    const filtered = this.filterByPeriod(sales, period);
    const byDay = this.groupBy(filtered, 'date');
    
    return Object.entries(byDay).map(([date, daySales]) => ({
      date,
      value: daySales.reduce((sum, s) => sum + (s[metric] || 0), 0)
    }));
  }

  generateForecast(sales, metric) {
    const values = sales.map(s => s[metric] || 0);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const trend = this.calculateTrend(values);
    
    return {
      next7Days: avg * 7 * (1 + trend / 100),
      next30Days: avg * 30 * (1 + trend / 100),
      confidence: Math.abs(trend) < 10 ? 'high' : 'medium',
      basedOn: values.length
    };
  }

  getYearOverYear(sales) {
    const byYear = this.groupBy(sales, s => s.date.substring(0, 4));
    
    return Object.entries(byYear).map(([year, yearSales]) => ({
      year,
      total: yearSales.reduce((sum, s) => sum + s.amount, 0),
      count: yearSales.length
    }));
  }

  generateInsights(sales) {
    const insights = [];
    const revenue = sales.reduce((sum, s) => sum + s.amount, 0);
    const avgPerDay = revenue / 30;
    
    if (avgPerDay > 50000) {
      insights.push({
        type: 'positive',
        message: 'Sales are strong! Average daily revenue is ETB ' + avgPerDay.toLocaleString()
      });
    }
    
    const weekendSales = sales.filter(s => {
      const day = new Date(s.date).getDay();
      return day === 0 || day === 6;
    });
    
    if (weekendSales.length > 0) {
      const weekendAvg = weekendSales.reduce((sum, s) => sum + s.amount, 0) / weekendSales.length;
      const weekdayAvg = sales.filter(s => {
        const day = new Date(s.date).getDay();
        return day !== 0 && day !== 6;
      }).reduce((sum, s) => sum + s.amount, 0) / (sales.length - weekendSales.length);
      
      if (weekendAvg > weekdayAvg * 1.2) {
        insights.push({
          type: 'opportunity',
          message: 'Weekend sales are 20% higher! Consider weekend promotions.'
        });
      }
    }
    
    const topProduct = this.getTopProducts([], sales)[0];
    if (topProduct) {
      insights.push({
        type: 'info',
        message: `${topProduct.name} is your best seller with ETB ${topProduct.revenue.toLocaleString()} in revenue.`
      });
    }
    
    return insights;
  }

  // ========== UTILITY METHODS ==========

  filterByPeriod(data, period) {
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'day':
        startDate = new Date(now.setHours(0,0,0,0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= startDate);
  }

  groupBy(array, key) {
    return array.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  }

  calculateVolatility(values) {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  linearRegression(values) {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return {
      slope,
      intercept,
      nextValue: slope * n + intercept
    };
  }
}

module.exports = new AnalyticsController();