import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import CurrencyINR from '../../components/CurrencyINR';

const emptyForm = {
  name: '', ownerName: '', phone: '', village: '', taluka: '', address: '', gstNumber: '', openingBalance: 0,
};

const fieldMeta = {
  name:           { label: 'Shop Name',       placeholder: 'Bergen Auto Parts' },
  ownerName:      { label: 'Owner Name',       placeholder: 'Full name' },
  phone:          { label: 'Phone',            placeholder: '+91 9999 999999' },
  village:        { label: 'Village',          placeholder: 'Village' },
  taluka:         { label: 'Taluka',           placeholder: 'Taluka' },
  address:        { label: 'Address',          placeholder: 'Full address' },
  gstNumber:      { label: 'GST Number',       placeholder: 'Optional' },
  openingBalance: { label: 'Opening Balance ₹', placeholder: '0', type: 'number' },
};

const inputCls = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => shopApi.list({ search: search || undefined }).then(({ data }) => setShops(data));

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await shopApi.create({ ...form, openingBalance: Number(form.openingBalance) });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shop');
    }
  };

  const toggleActive = async (shop) => {
    await shopApi.update(shop._id, { isActive: !shop.isActive });
    load();
  };

  const columns = [
    { key: 'name', label: 'Shop' },
    { key: 'ownerName', label: 'Owner' },
    { key: 'taluka', label: 'Taluka' },
    { key: 'village', label: 'Village' },
    { key: 'balance', label: 'Due', render: (r) => <span className="font-label-md"><CurrencyINR amount={r.currentBalance} /></span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-3">
          <Link to={`/admin/ledger/${r._id}`} className="flex items-center gap-1 font-label-sm text-primary hover:underline">
            <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>Ledger
          </Link>
          <button onClick={() => toggleActive(r)} className={`font-label-sm hover:underline ${r.isActive ? 'text-error' : 'text-[#2e7d32]'}`}>
            {r.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-lg text-primary">Shops</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage distributor shop accounts</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 font-label-md text-label-md hover:bg-steel-blue transition-colors duration-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Shop'}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input
          placeholder="Search shops…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant bg-white font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-outline-variant bg-surface-white p-6 sm:grid-cols-2">
          {Object.keys(emptyForm).map((key) => {
            const meta = fieldMeta[key] || { label: key, placeholder: '' };
            return (
              <div key={key}>
                <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">{meta.label}</label>
                <input
                  type={meta.type || (key === 'openingBalance' ? 'number' : 'text')}
                  required={['name', 'ownerName', 'phone', 'village', 'taluka'].includes(key)}
                  placeholder={meta.placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            );
          })}
          {error && (
            <div className="sm:col-span-2 flex items-center gap-2 p-3 bg-error-container text-on-error-container rounded-lg font-label-md">
              <span className="material-symbols-outlined text-[16px]">warning</span>{error}
            </div>
          )}
          <button type="submit" className="sm:col-span-2 flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-steel-blue transition-colors duration-200">
            <span className="material-symbols-outlined text-[18px]">save</span>Save Shop
          </button>
        </form>
      )}

      <DataTable columns={columns} data={shops} />
    </div>
  );
}
