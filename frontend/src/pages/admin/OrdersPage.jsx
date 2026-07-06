import { useEffect, useState } from 'react';
import { orderApi, shopApi, productApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyINR from '../../components/CurrencyINR';
import { downloadWithAuth } from '../../utils/download';
import { formatDate } from '../../utils/format';

const statuses = ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
const selectCls = 'rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [manualOrder, setManualOrder] = useState({ shopId: '', items: [] });
  const [showManual, setShowManual] = useState(false);

  const load = () => {
    orderApi.list({ status: statusFilter || undefined }).then(({ data }) => setOrders(data));
  };

  useEffect(() => {
    load();
    shopApi.list().then(({ data }) => setShops(data));
    productApi.list().then(({ data }) => setProducts(data));
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await orderApi.updateStatus(id, status);
    load();
  };

  const addManualItem = (productId, quantity) => {
    if (!productId || !quantity) return;
    setManualOrder((prev) => ({ ...prev, items: [...prev.items, { productId, quantity: Number(quantity) }] }));
  };

  const submitManualOrder = async () => {
    await orderApi.create({ shopId: manualOrder.shopId, items: manualOrder.items });
    setManualOrder({ shopId: '', items: [] });
    setShowManual(false);
    load();
  };

  const columns = [
    { key: 'invoice', label: 'Invoice', render: (r) => <span className="font-label-md text-primary">{r.invoiceNumber}</span> },
    { key: 'shop', label: 'Shop', render: (r) => r.shopId?.name },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.orderDate) },
    { key: 'total', label: 'Total', render: (r) => <span className="font-label-md"><CurrencyINR amount={r.totalAmount} /></span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-col gap-1.5">
          <select
            value={r.status}
            onChange={(e) => updateStatus(r._id, e.target.value)}
            className="rounded-lg border border-outline-variant bg-white px-2 py-1.5 font-label-sm text-label-sm text-on-surface outline-none"
          >
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            type="button"
            onClick={() => downloadWithAuth(orderApi.invoiceUrl(r._id), `${r.invoiceNumber}.pdf`)}
            className="flex items-center gap-1 font-label-sm text-primary hover:underline"
          >
            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>Invoice
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 p-8 bg-background">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline-lg text-primary">Orders</h2>
          <p className="font-body-md text-on-surface-variant mt-1">Manage and track all orders</p>
        </div>
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 font-label-md text-label-md hover:bg-steel-blue transition-colors duration-200 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">{showManual ? 'close' : 'add_shopping_cart'}</span>
          {showManual ? 'Cancel' : 'Create Manual Order'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Manual order panel */}
      {showManual && (
        <div className="mb-8 rounded-xl border border-outline-variant bg-surface-white p-6 space-y-4">
          <h3 className="font-headline-md text-on-surface">Create Manual Order</h3>
          <select
            value={manualOrder.shopId}
            onChange={(e) => setManualOrder({ ...manualOrder, shopId: e.target.value })}
            className={selectCls}
          >
            <option value="">Select shop</option>
            {shops.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <ManualItemForm products={products} onAdd={addManualItem} />
          {manualOrder.items.length > 0 && (
            <ul className="space-y-1">
              {manualOrder.items.map((item, i) => (
                <li key={i} className="font-body-md text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  Product #{item.productId.slice(-6)} × {item.quantity}
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={submitManualOrder}
            disabled={!manualOrder.shopId || !manualOrder.items.length}
            className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-5 py-2.5 font-label-md text-label-md hover:bg-steel-blue transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>Place Order
          </button>
        </div>
      )}

      <DataTable columns={columns} data={orders} />
    </div>
  );
}

function ManualItemForm({ products, onAdd }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const selectCls = 'rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all';

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div>
        <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Product</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className={selectCls}>
          <option value="">Select product</option>
          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-1 block">Qty</label>
        <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
          className="w-20 rounded-lg border border-outline-variant bg-white px-3 py-2.5 font-body-md text-on-surface outline-none focus:ring-1 focus:ring-primary transition-all" />
      </div>
      <button type="button" onClick={() => { onAdd(productId, quantity); setProductId(''); }}
        className="flex items-center gap-1 rounded-lg bg-secondary text-on-secondary px-4 py-2.5 font-label-md text-label-md hover:opacity-90 transition-opacity">
        <span className="material-symbols-outlined text-[16px]">add</span>Add
      </button>
    </div>
  );
}
