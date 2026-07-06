import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ledgerApi } from '../../services/api';
import DataTable from '../../components/DataTable';
import CurrencyINR from '../../components/CurrencyINR';
import { formatDate } from '../../utils/format';

export default function MyLedgerPage() {
  const { user } = useAuth();
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    if (user?.shopId) {
      ledgerApi.get(user.shopId).then(({ data }) => setLedger(data));
    }
  }, [user]);

  const columns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'type', label: 'Type', render: (r) => <span className="capitalize">{r.type}</span> },
    { key: 'amount', label: 'Amount', render: (r) => <CurrencyINR amount={r.amount} /> },
    { key: 'note', label: 'Note' },
    { key: 'balance', label: 'Balance', render: (r) => <CurrencyINR amount={r.balanceAfter} /> },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold">My Ledger</h2>

      {ledger && (
        <div className="mt-4 rounded-lg border bg-white p-4">
          <p className="text-lg font-semibold">
            Outstanding Balance: <CurrencyINR amount={ledger.currentBalance} />
          </p>
        </div>
      )}

      <div className="mt-6">
        <DataTable columns={columns} data={ledger?.entries || []} emptyMessage="No ledger entries" />
      </div>
    </div>
  );
}
