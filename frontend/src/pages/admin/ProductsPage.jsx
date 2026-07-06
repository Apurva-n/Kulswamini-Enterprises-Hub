import { useEffect, useState } from 'react';
import { productApi, categoryApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import CurrencyINR from '../../components/CurrencyINR';

const emptyForm = {
  name: '', categoryId: '', brand: '', unit: 'litre', pricePerUnit: 0, stockQuantity: 0, lowStockThreshold: 10,
};

const inputCls = 'w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [stockAdjust, setStockAdjust] = useState({ id: null, delta: 0 });

  const load = () => {
    productApi.list({ search: search || undefined }).then(({ data }) => setProducts(data));
  };

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
    load();
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await productApi.create({
      ...form,
      categoryId: form.categoryId,
      pricePerUnit: Number(form.pricePerUnit),
      stockQuantity: Number(form.stockQuantity),
      lowStockThreshold: Number(form.lowStockThreshold),
    });
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const handleStockAdjust = async () => {
    await productApi.update(stockAdjust.id, { stockAdjust: Number(stockAdjust.delta) });
    setStockAdjust({ id: null, delta: 0 });
    load();
  };

  const columns = [
    { key: 'name', label: 'Product' },
    { key: 'brand', label: 'Brand' },
    { key: 'category', label: 'Category', render: (r) => r.categoryId?.name },
    { key: 'price', label: 'Price', render: (r) => <CurrencyINR amount={r.pricePerUnit} /> },
    {
      key: 'stock',
      label: 'Stock',
      render: (r) => (
        <span className={`font-label-md ${r.stockQuantity <= r.lowStockThreshold ? 'text-error' : 'text-on-surface'}`}>
          {r.stockQuantity} {r.unit}
          {r.stockQuantity <= r.lowStockThreshold && (
            <span className="material-symbols-outlined text-[14px] ml-1 align-middle">warning</span>
          )}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Adjust Stock',
      render: (r) =>
        stockAdjust.id === r._id ? (
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={stockAdjust.delta}
              onChange={(e) => setStockAdjust({ ...stockAdjust, delta: e.target.value })}
              className="w-16 rounded-lg border border-outline-variant px-2 py-1 font-body-md text-sm outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={handleStockAdjust} className="font-label-sm text-[#2e7d32] hover:underline">Save</button>
            <button onClick={() => setStockAdjust({ id: null, delta: 0 })} className="font-label-sm text-on-surface-variant hover:underline">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setStockAdjust({ id: r._id, delta: 0 })} className="font-label-sm text-primary hover:underline">
            Adjust
          </button>
        ),
    },
  ];

  return (
    <div className="flex-1 p-8 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-lg text-primary">Products</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage your product inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 font-label-md text-label-md hover:bg-steel-blue transition-colors duration-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
          {showForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-outline-variant bg-white font-body-md text-body-md outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 grid gap-4 rounded-xl border border-outline-variant bg-surface-white p-6 sm:grid-cols-2">
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Product Name</label>
            <input placeholder="e.g. Engine Oil 5W-30" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Category</label>
            <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Brand</label>
            <input placeholder="Brand name" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Unit</label>
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className={inputCls}>
              <option value="litre">Litre</option>
              <option value="piece">Piece</option>
              <option value="box">Box</option>
            </select>
          </div>
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Price (₹)</label>
            <input type="number" placeholder="0.00" required value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Initial Stock</label>
            <input type="number" placeholder="0" required value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} className={inputCls} />
          </div>
          <button type="submit" className="sm:col-span-2 flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary py-3 font-label-md text-label-md uppercase tracking-widest hover:bg-steel-blue transition-colors duration-200">
            <span className="material-symbols-outlined text-[18px]">save</span>Save Product
          </button>
        </form>
      )}

      <DataTable columns={columns} data={products} />
    </div>
  );
}
