export default function CurrencyINR({ amount }) {
  return (
    <span className="font-medium tabular-nums">
      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0)}
    </span>
  );
}
