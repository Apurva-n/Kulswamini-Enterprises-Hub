import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard',    icon: 'dashboard' },
  { to: '/admin/shops',     label: 'Shops',         icon: 'storefront' },
  { to: '/admin/products',  label: 'Products',      icon: 'inventory_2' },
  { to: '/admin/categories',label: 'Categories',    icon: 'category' },
  { to: '/admin/orders',    label: 'Orders',         icon: 'receipt_long' },
  { to: '/admin/payments',  label: 'Payments',       icon: 'payments' },
  { to: '/admin/users/pending', label: 'Pending Users', icon: 'person_add' },
];

const shopLinks = [
  { to: '/shop/catalog', label: 'Catalog',    icon: 'grid_view' },
  { to: '/shop/cart',    label: 'Cart',        icon: 'shopping_cart' },
  { to: '/shop/orders',  label: 'My Orders',   icon: 'receipt_long' },
  { to: '/shop/ledger',  label: 'My Ledger',   icon: 'account_balance_wallet' },
];

export default function Layout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : shopLinks;

  // safely access cart only for shop role
  let cartCount = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { items } = useCart();
    if (role === 'shop') cartCount = items.reduce((s, i) => s + i.quantity, 0);
  } catch (_) { /* cart context not available */ }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-primary-container border-r border-outline-variant">
        {/* Brand */}
        <div className="px-6 py-6 border-b border-outline-variant/30">
          <p className="font-headline-lg text-on-primary tracking-tight leading-none">Kulswamini Enterprises</p>
          <p className="font-label-sm text-on-primary-container mt-1 uppercase tracking-widest opacity-70">
            {role === 'admin' ? 'Admin Portal' : 'Shop Portal'}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-label-md text-label-md ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-primary-container hover:bg-white/10'
                }`
              }
            >
              <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
              {link.label}
              {link.to === '/shop/cart' && cartCount > 0 && (
                <span className="ml-auto bg-oil-amber text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-secondary text-[16px]">person</span>
            </div>
            <div className="min-w-0">
              <p className="font-label-md text-on-primary truncate">{user?.name}</p>
              <p className="font-label-sm text-on-primary-container opacity-60 truncate capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-sm text-on-primary-container hover:bg-error/20 hover:text-error transition-colors duration-150"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
