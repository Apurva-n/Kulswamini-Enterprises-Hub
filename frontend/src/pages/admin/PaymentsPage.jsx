import { useEffect, useState } from 'react';
import { paymentApi, shopApi } from '../../services/api';
import CurrencyINR from '../../components/CurrencyINR';
import DataTable from '../../components/DataTable';
import { downloadWithAuth } from '../../utils/download';
import { formatDate } from '../../utils/format';

const inputCls = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

export default function PaymentsPage() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState({ shopId: '', amount: '', method: 'cash', note: '' });
  const [payments, setPayments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    shopApi.list().then(({ data }) => setShops(data));
  }, []);

  useEffect(() => {
    if (form.shopId) {
      paymentApi.list(form.shopId).then(({ data }) => setPayments(data));
    }
  }, [form.shopId, message]);c

  const handleSubmit = async (e) => {
    e.preventDefault();
    await paymentApi.create({ ...form, amount: Number(form.amount) });
    setMessage(`Payment of ₹${form.amount} recorded successfully`);
    setForm({ ...form, amount: '', note: '' });
  };

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'amount', label: 'Amount', render: (r) => <span className="font-label-md"><CurrencyINR amount={r.amount} /></span> },
    { key: 'method', label: 'Method', render: (r) => <span className="capitalize">{r.method.replace('_', ' ')}</span> },
    { key: 'note', label: 'Note', render: (r) => <span className="text-on-surface-variant">{r.note || '—'}</span> },
    {
      key: 'receipt',
      label: 'Receipt',
      render: (r) => (
        <button
          type="button"
          onClick={() => downloadWithAuth(paymentApi.receiptUrl(r._id), `receipt-${r._id}.pdf`)}
          className="flex items-center gap-1 font-label-sm text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>PDF
        </button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="mb-8">
        <h2 className="font-headline-lg text-primary">Record Payment</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Log a payment received from a shop</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-outline-variant bg-surface-white p-6 max-w-lg">
        <div>
          <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Shop</label>
          <select required value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} className={inputCls}>
            <option value="">Select shop</option>
            {shops.map((s) => <option key={s._id} value={s._id}>{s.name} (Due: ₹{s.currentBalance?.toLocaleString('en-IN')})</option>)}
          </select>
        </div>
        <div>
          <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Amount (₹)</label>
          <input type="number" required min="0.01" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Method</label>
          <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputCls}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        <div>
          <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Note (optional)</label>
          <input placeholder="Reference / remarks" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
        </div>
        <button type="submit" className="flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-steel-blue transition-colors duration-200">
          <span className="material-symbols-outlined text-[18px]">payments</span>Record Payment
        </button>
        {message && (
          <div className="flex items-center gap-2 p-3 bg-[#e8f5e9] text-[#2e7d32] rounded-lg font-label-md">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>{message}
          </div>
        )}
      </form>

      {form.shopId && (
        <div>
          <h3 className="font-headline-md text-on-surface mb-4">Payment History</h3>
          <DataTable columns={columns} data={payments} />
        </div>
      )}
    </div>
  );
}
