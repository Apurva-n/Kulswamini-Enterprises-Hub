import { useEffect, useState } from 'react';
import { productApi, categoryApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import CurrencyINR from '../../components/CurrencyINR';

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    productApi.list({ search: search || undefined, categoryId: categoryId || undefined })
      .then(({ data }) => setProducts(data));
  }, [search, categoryId]);

  return (
    <div>
      <h2 className="text-2xl font-bold">Product Catalog</h2>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p._id} className="rounded-lg border bg-white p-4">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-slate-500">{p.brand} · {p.categoryId?.name}</p>
            <p className="mt-2"><CurrencyINR amount={p.pricePerUnit} /> / {p.unit}</p>
            <p className="text-sm text-slate-600">Stock: {p.stockQuantity}</p>
            <button
              onClick={() => addItem(p)}
              disabled={p.stockQuantity <= 0}
              className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
