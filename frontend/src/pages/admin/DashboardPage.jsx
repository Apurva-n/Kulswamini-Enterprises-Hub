import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../../services/api';
import CurrencyINR from '../../components/CurrencyINR';

function StatCard({ label, value, icon, isCount }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-white p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-primary-container text-[20px]">{icon}</span>
      </div>
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="font-headline-md text-headline-md text-on-surface mt-1">
          {isCount ? value : <CurrencyINR amount={value} />}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.summary().then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-on-surface-variant">
        <span className="material-symbols-outlined text-[48px] animate-spin">progress_activity</span>
        <p className="font-body-md">Loading dashboard…</p>
      </div>
    </div>
  );
  if (!data) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-body-md text-error">Failed to load dashboard</p>
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-headline-lg text-primary">Dashboard</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Overview of your distribution operations</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Sales"       value={data.monthlySales}        icon="trending_up" />
        <StatCard label="Monthly Collections" value={data.monthlyCollections}  icon="payments" />
        <StatCard label="Total Outstanding"   value={data.totalOutstanding}    icon="account_balance_wallet" />
        <StatCard label="Pending Approvals"   value={data.pendingApprovals}    icon="person_add" isCount />
      </div>

      {/* Charts row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-white p-6">
          <h3 className="font-headline-md text-on-surface">Sales Trend (6 months)</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.salesTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Hanken Grotesk' }} />
                <YAxis tick={{ fontSize: 12, fontFamily: 'Hanken Grotesk' }} />
                <Tooltip
                  formatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                  contentStyle={{ fontFamily: 'Hanken Grotesk', fontSize: 12, border: '1px solid #c6c6cd', borderRadius: 8 }}
                />
                <Bar dataKey="sales" fill="#131b2e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-white p-6">
          <h3 className="font-headline-md text-on-surface">Top Shops by Due Amount</h3>
          <ul className="mt-4 space-y-3">
            {data.topShopsByDue.map((shop) => (
              <li key={shop.shopId} className="flex items-center justify-between">
                <Link to={`/admin/ledger/${shop.shopId}`} className="font-body-md text-primary hover:underline">
                  {shop.name} <span className="text-on-surface-variant">({shop.village})</span>
                </Link>
                <span className="font-label-md text-on-surface"><CurrencyINR amount={shop.balance} /></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant bg-surface-white p-6">
          <h3 className="font-headline-md flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[18px]">warning</span>Low Stock Alerts
          </h3>
          <ul className="mt-4 space-y-2">
            {data.lowStock.length === 0 ? (
              <li className="font-body-md text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#2e7d32]">check_circle</span>
                All products adequately stocked
              </li>
            ) : (
              data.lowStock.map((p) => (
                <li key={p.id} className="flex justify-between font-body-md">
                  <span>{p.name} <span className="text-on-surface-variant">({p.brand})</span></span>
                  <span className="font-label-md text-error">{p.stockQuantity} left</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-outline-variant bg-surface-white p-6">
          <h3 className="font-headline-md text-on-surface">Top Products This Month</h3>
          <ul className="mt-4 space-y-2">
            {data.topProducts.map((p, i) => (
              <li key={i} className="flex justify-between font-body-md">
                <span>{p.name}</span>
                <span className="font-label-md text-secondary">{p.quantitySold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
