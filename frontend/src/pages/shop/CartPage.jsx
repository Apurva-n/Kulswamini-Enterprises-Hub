import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../services/api';
import CurrencyINR from '../../components/CurrencyINR';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const placeOrder = async () => {
    setError('');
    setLoading(true);
    try {
      await orderApi.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      clearCart();
      navigate('/shop/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold">Cart</h2>
        <p className="mt-4 text-slate-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Cart</h2>

      <ul className="mt-6 space-y-3">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between rounded-lg border bg-white p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">{item.brand}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                className="w-16 rounded border px-2 py-1 text-sm"
              />
              <CurrencyINR amount={item.pricePerUnit * item.quantity} />
              <button onClick={() => removeItem(item.productId)} className="text-sm text-red-600">Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-lg border bg-white p-4">
        <p className="text-lg font-semibold">Total: <CurrencyINR amount={total} /></p>
        <button
          onClick={placeOrder}
          disabled={loading}
          className="rounded-md bg-green-700 px-6 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? 'Placing...' : 'Place Order'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
