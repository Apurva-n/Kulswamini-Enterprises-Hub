const statusConfig = {
  pending:    { bg: 'bg-[#fff8e1] text-[#7c5c00]',    icon: 'schedule' },
  confirmed:  { bg: 'bg-secondary-fixed text-secondary', icon: 'check_circle' },
  dispatched: { bg: 'bg-tertiary-fixed text-[#39485a]', icon: 'local_shipping' },
  delivered:  { bg: 'bg-[#e8f5e9] text-[#2e7d32]',    icon: 'inventory' },
  cancelled:  { bg: 'bg-error-container text-on-error-container', icon: 'cancel' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { bg: 'bg-surface-container text-on-surface-variant', icon: 'help' };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm capitalize ${cfg.bg}`}>
      <span className="material-symbols-outlined text-[12px]">{cfg.icon}</span>
      {status}
    </span>
  );
}
