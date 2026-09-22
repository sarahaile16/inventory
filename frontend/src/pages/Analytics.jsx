import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiShoppingBag, FiPackage, FiHome,
  FiTrendingUp, FiAlertCircle, FiClipboard, FiTruck, FiBox
} from 'react-icons/fi';
import { getUserRole, ROLES } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  HeroLink,
  LoadingBlock,
  EmptyState
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const PeriodToggle = ({ value, onChange }) => (
  <div className="inline-flex rounded-lg overflow-hidden border border-teal-100 bg-teal-50/50 text-[10px] sm:text-xs shrink-0">
    {['yearly', 'monthly', 'daily'].map((period) => (
      <button
        key={period}
        type="button"
        onClick={() => onChange(period)}
        className={`px-2.5 py-1 capitalize transition ${
          value === period
            ? 'bg-teal-700 text-white shadow-sm'
            : 'text-teal-800/70 hover:bg-white'
        }`}
      >
        {period}
      </button>
    ))}
  </div>
);

const Analytics = () => {
  const role = getUserRole();
  const isManager = role === ROLES.MANAGEMENT;

  const [salesPeriod, setSalesPeriod] = useState('daily');
  const [productPeriod, setProductPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState({
    mode: isManager ? 'activity' : 'financial',
    salesAmount: 0,
    salesLabel: '',
    inventoryAsset: 0,
    storeAsset: 0,
    assetLabel: '',
    ordersTaken: 0,
    unitsSold: 0,
    warehouseUnits: 0,
    storeUnits: 0,
    lowStockItems: 0,
    stockTransfers: 0,
    stockReceived: 0,
    productSales: [],
    productSalesLabel: '',
    productPeriodOrders: 0,
    productPeriodUnits: 0
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
        setError(err.response?.data?.message || 'Failed to load analytics. Admin or Management only.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [salesPeriod, productPeriod]);

  const activityMode = isManager || report.mode === 'activity';
  const productQtyTotal = report.productSales.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  const productSalesTotal = report.productSales.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const combinedAssets = Number(report.inventoryAsset || 0) + Number(report.storeAsset || 0);

  return (
    <PageShell>
      <PageHero
        tone="slate"
        eyebrow={activityMode ? 'Operations insight' : 'Business insight'}
        title="Analytics"
        subtitle={
          activityMode
            ? 'Work activity by day, month, or year — orders taken, units sold, and warehouse / store stock (no money).'
            : 'Sales performance, warehouse value, and store floor assets for your furniture business.'
        }
        actions={
          <>
            <HeroLink to="/inventory">Inventory</HeroLink>
            <HeroLink to="/orders">Orders</HeroLink>
            <HeroLink to="/stock-movement">Stock moves</HeroLink>
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs px-3 py-2.5 flex items-start gap-2">
          <FiAlertCircle className="mt-0.5 shrink-0" size={14} />
          {error}
        </div>
      )}

      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wide">
          {activityMode ? 'Activity period' : 'Sales period'}
        </p>
        <PeriodToggle value={salesPeriod} onChange={setSalesPeriod} />
      </div>

      {activityMode ? (
        <>
          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2.5 text-xs text-teal-900">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <FiTrendingUp className="text-teal-700" size={14} />
              Work activity · {report.salesLabel || '—'}
            </span>
            <p className="text-[11px] text-teal-800/80 mt-1">
              Based on orders taken and items sold — not payment amounts.
            </p>
          </div>

          <StatGrid cols="4">
            <StatCard
              label="Orders taken"
              value={loading ? '—' : report.ordersTaken}
              hint={`Orders · ${report.salesLabel || '—'}`}
              icon={<FiClipboard size={16} />}
              accent="teal"
            />
            <StatCard
              label="Units sold"
              value={loading ? '—' : report.unitsSold}
              hint={`Items sold · ${report.salesLabel || '—'}`}
              icon={<FiShoppingBag size={16} />}
              accent="emerald"
            />
            <StatCard
              label="Warehouse units"
              value={loading ? '—' : report.warehouseUnits}
              hint="Units currently in warehouse"
              icon={<FiPackage size={16} />}
              accent="sky"
            />
            <StatCard
              label="Store floor units"
              value={loading ? '—' : report.storeUnits}
              hint={
                Number(report.lowStockItems || 0) > 0
                  ? `${report.lowStockItems} products at / below restock`
                  : 'Units ready to sell on floor'
              }
              icon={<FiHome size={16} />}
              accent="amber"
            />
          </StatGrid>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <StatCard
              label="Transfers to store"
              value={loading ? '—' : report.stockTransfers}
              hint={`Stock moves · ${report.salesLabel || '—'}`}
              icon={<FiTruck size={16} />}
              accent="violet"
            />
            <StatCard
              label="Deliveries received"
              value={loading ? '—' : report.stockReceived}
              hint={`Into warehouse · ${report.salesLabel || '—'}`}
              icon={<FiBox size={16} />}
              accent="slate"
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2.5 text-xs text-teal-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <span className="inline-flex items-center gap-1.5">
              <FiTrendingUp className="text-teal-700" size={14} />
              Combined stock value (warehouse + store)
            </span>
            <span className="text-sm font-bold text-teal-900">
              {loading ? '—' : `ETB ${formatMoney(combinedAssets)}`}
            </span>
          </div>

          <StatGrid cols="3">
            <StatCard
              label="Sales amount"
              value={loading ? '—' : `ETB ${formatMoney(report.salesAmount)}`}
              hint={`Total sales · ${report.salesLabel || '—'}`}
              icon={<FiShoppingBag size={16} />}
              accent="teal"
            />
            <StatCard
              label="Warehouse asset"
              value={loading ? '—' : `ETB ${formatMoney(report.inventoryAsset)}`}
              hint={`Inventory value · ${report.assetLabel || '—'}`}
              icon={<FiPackage size={16} />}
              accent="emerald"
            />
            <StatCard
              label="Store asset"
              value={loading ? '—' : `ETB ${formatMoney(report.storeAsset)}`}
              hint={`Floor stock value · ${report.assetLabel || '—'}`}
              icon={<FiHome size={16} />}
              accent="amber"
            />
          </StatGrid>
        </>
      )}

      <Panel
        title={activityMode ? 'Product movement' : 'Product sales'}
        action={<PeriodToggle value={productPeriod} onChange={setProductPeriod} />}
      >
        <p className="text-[10px] sm:text-xs text-slate-500 -mt-1 mb-3">
          {activityMode
            ? `Units sold by product · ${report.productSalesLabel || productPeriod}`
            : `Breakdown for ${report.productSalesLabel || productPeriod}`}
        </p>

        {loading ? (
          <LoadingBlock />
        ) : report.productSales.length === 0 ? (
          <EmptyState>
            No {activityMode ? 'product activity' : 'product sales'} for {report.productSalesLabel || 'this period'}.
            Data appears after store orders are recorded.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:-mx-4">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-[10px] font-semibold text-teal-800/70 uppercase tracking-wide border-b border-teal-50">
                  <th className="pb-2.5 px-3">Product</th>
                  <th className="pb-2.5 px-3">Qty sold</th>
                  {!activityMode && <th className="pb-2.5 px-3">Amount</th>}
                  <th className="pb-2.5 px-3">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.productSales.map((item, index) => {
                  const shareBase = activityMode ? productQtyTotal : productSalesTotal;
                  const shareValue = activityMode ? Number(item.quantity || 0) : Number(item.amount || 0);
                  const share = shareBase ? (shareValue / shareBase) * 100 : 0;
                  return (
                    <tr key={`${item.name}-${index}`} className="hover:bg-teal-50/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-800 text-sm">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-sm font-semibold text-slate-800">{item.quantity}</td>
                      {!activityMode && (
                        <td className="py-2.5 px-3 text-sm font-semibold text-slate-900">
                          ETB {formatMoney(item.amount)}
                        </td>
                      )}
                      <td className="py-2.5 px-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-teal-600 to-emerald-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.max(share, 2)}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 w-8 text-right font-medium">
                            {share.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-teal-100">
                  <td className="pt-3 px-3 text-sm font-semibold text-slate-800">Total</td>
                  <td className="pt-3 px-3 text-sm font-semibold text-slate-800">{productQtyTotal}</td>
                  {!activityMode && (
                    <td className="pt-3 px-3 text-sm font-bold text-teal-800">
                      ETB {formatMoney(productSalesTotal)}
                    </td>
                  )}
                  <td className="pt-3 px-3 text-[10px] text-slate-400">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Panel>
    </PageShell>
  );
};

export default Analytics;
