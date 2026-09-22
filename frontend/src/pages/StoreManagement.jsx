import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiDollarSign, FiAlertCircle, FiPlus, FiTruck, FiPackage } from 'react-icons/fi';
import { can, canSeeMoney, getUserRole, ROLES } from '../auth/roles';
import {
  PageShell,
  PageHero,
  StatGrid,
  StatCard,
  Panel,
  HeroLink,
  LoadingBlock,
  EmptyState,
  SearchInput
} from '../components/ui/PageChrome';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const formatMoney = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const StoreManagement = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [productRes, salesRes] = await Promise.all([
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/sales`).catch(() => ({ data: [] }))
        ]);
        setProducts(Array.isArray(productRes.data) ? productRes.data : []);
        setSales(Array.isArray(salesRes.data) ? salesRes.data : []);
      } catch (error) {
        console.error('Error loading store:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isStaff = getUserRole() === ROLES.STAFF;
  const showMoney = canSeeMoney();
  const today = new Date().toLocaleDateString('en-CA');
  const todaySales = sales.filter((sale) => String(sale.date).slice(0, 10) === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const storeValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.storeStock || 0),
    0
  );
  const lowStore = products.filter(
    (product) => Number(product.storeStock || 0) <= Number(product.restockLevel || 0)
  ).length;
  const unitsOnFloor = products.reduce((sum, product) => sum + Number(product.storeStock || 0), 0);

  const filtered = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productId?.toString().includes(searchTerm) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageShell>
      <PageHero
        tone={isStaff ? 'teal' : 'slate'}
        eyebrow={isStaff ? 'Staff floor' : 'Store desk'}
        title="Store"
        subtitle={
          isStaff
            ? 'Take orders, check floor stock, and help customers. Warehouse add/edit stays with management.'
            : 'Sell from floor stock and restock from the warehouse'
        }
        actions={
          <>
            <HeroLink to="/orders">View orders</HeroLink>
            {can('stockTransfer') && (
              <HeroLink to="/stock-movement">
                <FiTruck size={14} /> Transfer
              </HeroLink>
            )}
            {can('saleCreate') && (
              <HeroLink to="/store/sales" primary>
                <FiPlus size={14} /> New Sale
              </HeroLink>
            )}
          </>
        }
      />

      <StatGrid cols="4">
        <StatCard
          label="Store Products"
          value={products.length}
          icon={<FiShoppingBag size={16} />}
          accent="sky"
        />
        {showMoney ? (
          <StatCard
            label="Store Asset"
            value={`ETB ${formatMoney(storeValue)}`}
            icon={<FiDollarSign size={16} />}
            accent="emerald"
          />
        ) : (
          <StatCard
            label="Units on floor"
            value={unitsOnFloor}
            icon={<FiPackage size={16} />}
            accent="teal"
          />
        )}
        <StatCard
          label="Today's orders"
          value={todaySales.length}
          hint={showMoney ? `ETB ${formatMoney(todayRevenue)}` : undefined}
          icon={<FiPackage size={16} />}
          accent="violet"
        />
        <StatCard
          label="Low Store Stock"
          value={lowStore}
          icon={<FiAlertCircle size={16} />}
          accent="amber"
        />
      </StatGrid>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        <Panel
          className="xl:col-span-2"
          title="Floor products"
          action={
            <div className="w-full sm:w-56">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products…"
              />
            </div>
          }
          bodyClassName="p-0 sm:p-0"
        >
          {loading ? (
            <LoadingBlock />
          ) : filtered.length === 0 ? (
            <EmptyState>No products match your search</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="bg-slate-50 text-[10px] sm:text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Store</th>
                    <th className="px-3 py-2 text-left">Warehouse</th>
                    {showMoney && <th className="px-3 py-2 text-left">Price</th>}
                    {showMoney && <th className="px-3 py-2 text-left">Store Value</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((product) => (
                    <tr key={product._id} className="hover:bg-teal-50/40">
                      <td className="px-3 py-2.5 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{product.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {product.productId} · {product.category}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] rounded-md ${
                            Number(product.storeStock || 0) <= Number(product.restockLevel || 0)
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.storeStock || 0} {product.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600">{product.stock || 0}</td>
                      {showMoney && (
                        <td className="px-3 py-2.5 text-xs">
                          ETB {Number(product.price || 0).toLocaleString()}
                        </td>
                      )}
                      {showMoney && (
                        <td className="px-3 py-2.5 text-xs font-medium">
                          ETB {formatMoney(Number(product.price || 0) * Number(product.storeStock || 0))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          title="Recent Sales"
          action={
            <Link
              to="/store/sales"
              className="text-xs font-medium text-teal-700 hover:text-teal-800"
            >
              POS →
            </Link>
          }
          bodyClassName="p-0 sm:p-0"
        >
          <div className="divide-y divide-slate-100">
            {sales.slice(0, 6).map((sale) => (
              <div key={sale._id} className="px-3 py-2.5">
                <div className="flex justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {sale.customerName || 'Walk-in'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {sale.transactionId} · {sale.date}
                    </p>
                  </div>
                  {showMoney ? (
                    <p className="text-xs font-semibold text-emerald-600 shrink-0">
                      ETB {formatMoney(sale.totalAmount)}
                    </p>
                  ) : (
                    <p className="text-[10px] text-teal-700 shrink-0">
                      {(sale.items || []).length} items
                    </p>
                  )}
                </div>
              </div>
            ))}
            {sales.length === 0 && <EmptyState>No sales recorded yet</EmptyState>}
          </div>
        </Panel>
      </div>
    </PageShell>
  );
};

export default StoreManagement;
