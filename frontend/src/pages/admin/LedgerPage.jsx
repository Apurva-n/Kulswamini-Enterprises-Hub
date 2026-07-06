import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ledgerApi, shopApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import CurrencyINR from '../../components/CurrencyINR';
import { formatDate } from '../../utils/format';

const selectCls = 'rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';
const inputCls = 'rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

export default function LedgerPage() {
  const { shopId: paramShopId } = useParams();
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(paramShopId || '');
  const [ledger, setLedger] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    shopApi.list().then(({ data }) => {
      setShops(data);
      if (!selectedShop && data.length) setSelectedShop(paramShopId || data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selectedShop) return;
    ledgerApi.get(selectedShop, dateRange).then(({ data }) => setLedger(data));
  }, [selectedShop, dateRange]);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    {
      key: 'type', label: 'Type',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 font-label-sm capitalize ${r.type === 'credit' ? 'text-[#2e7d32]' : 'text-error'}`}>
          <span className="material-symbols-outlined text-[14px]">{r.type === 'credit' ? 'arrow_downward' : 'arrow_upward'}</span>
          {r.type}
        </span>
      ),
    },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-label-md"><CurrencyINR amount={r.amount} /></span> },
    { key: 'note', label: 'Note', render: (r) => <span className="text-on-surface-variant">{r.note || '—'}</span> },
    { key: 'balance', label: 'Balance After', render: (r) => <span className="font-label-md"><CurrencyINR amount={r.balanceAfter} /></span> },
  ];

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="mb-8">
        <h2 className="font-headline-lg text-primary">Ledger</h2>
        <p className="font-body-md text-on-surface-variant mt-1">View shop-wise transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} className={selectCls}>
          {shops.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.village}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-[18px]">calendar_today</span>
          <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} className={inputCls} />
        </div>
        <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} className={inputCls} />
      </div>

      {/* Balance summary */}
      {ledger && (
        <div className="mb-6 rounded-xl border border-outline-variant bg-surface-white p-5 flex items-center gap-4 max-w-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary-container text-[20px]">account_balance_wallet</span>
          </div>
          <div>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">Current Balance</p>
            <p className="font-headline-md text-on-surface"><CurrencyINR amount={ledger.currentBalance} /></p>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={ledger?.entries || []} emptyMessage="Select a shop to view ledger" />
    </div>
  );
}
