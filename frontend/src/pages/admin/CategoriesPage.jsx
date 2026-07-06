import { useEffect, useState } from 'react';
import { categoryApi } from '../../services/api';
import DataTable from '../../components/DataTable';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'oil' });

  const load = () => categoryApi.list().then(({ data }) => setCategories(data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await categoryApi.create(form);
    setForm({ name: '', type: 'oil' });
    load();
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">Categories</h2>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-3 rounded-lg border bg-white p-4">
        <input
          placeholder="Category name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-md border px-3 py-2 text-sm"
        />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-md border px-3 py-2 text-sm">
          <option value="oil">Oil</option>
          <option value="part">Part</option>
        </select>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Add</button>
      </form>

      <div className="mt-6">
        <DataTable columns={columns} data={categories} />
      </div>
    </div>
  );
}
