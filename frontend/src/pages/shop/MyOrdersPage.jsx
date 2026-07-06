import { useEffect, useState } from 'react';
import { orderApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import CurrencyINR from '../../components/CurrencyINR';
import { downloadWithAuth } from '../../utils/download';
import { formatDate } from '../../utils/format';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderApi.list().then(({ data }) => setOrders(data));
  }, []);

  const columns = [
    { key: 'invoice', label: 'Invoice', render: (r) => r.invoiceNumber },
    { key: 'date', label: 'Date', render: (r) => formatDate(r.orderDate) },
    { key: 'total', label: 'Total', render: (r) => <CurrencyINR amount={r.totalAmount} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'invoice',
      label: 'Invoice',
      render: (r) => (
        <button
          type="button"
          onClick={() => downloadWithAuth(orderApi.invoiceUrl(r._id), `${r.invoiceNumber}.pdf`)}
          className="text-blue-600 hover:underline"
        >
          Download
        </button>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">My Orders</h2>
      <div className="mt-6">
        <DataTable columns={columns} data={orders} emptyMessage="No orders yet" />
      </div>
    </div>
  );
}
