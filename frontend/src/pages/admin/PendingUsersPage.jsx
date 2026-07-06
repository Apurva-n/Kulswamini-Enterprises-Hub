import { useEffect, useState } from 'react';
import { userApi, shopApi } from '../../services/api';

export default function PendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShops, setSelectedShops] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    userApi.pending().then(({ data }) => setUsers(data));
    shopApi.list().then(({ data }) => setShops(data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (userId, shopId) => {
    setError('');
    setMessage('');

    if (!shopId) {
      setError('Select a shop before approving the shopkeeper.');
      return;
    }

    try {
      await userApi.approve(userId, { action: 'approve', shopId });
      setMessage('Shopkeeper approved successfully.');
      setSelectedShops((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (userId) => {
    setError('');
    setMessage('');

    try {
      await userApi.approve(userId, { action: 'reject' });
      setMessage('Shopkeeper rejected.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Pending Shopkeeper Approvals</h2>
      {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {users.length === 0 ? (
        <p className="mt-4 text-slate-500">No pending registrations</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {users.map((user) => (
            <li key={user._id} className="rounded-lg border bg-white p-4">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-slate-600">{user.email} - {user.phone}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={selectedShops[user._id] || ''}
                  onChange={(e) => setSelectedShops({ ...selectedShops, [user._id]: e.target.value })}
                  className="rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">Link to shop</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleApprove(user._id, selectedShops[user._id])}
                  disabled={!selectedShops[user._id]}
                  className="rounded-md bg-green-700 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(user._id)}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
