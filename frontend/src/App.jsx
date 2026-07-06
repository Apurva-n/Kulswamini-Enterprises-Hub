import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import ShopsPage from './pages/admin/ShopsPage';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import OrdersPage from './pages/admin/OrdersPage';
import LedgerPage from './pages/admin/LedgerPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import PendingUsersPage from './pages/admin/PendingUsersPage';
import CatalogPage from './pages/shop/CatalogPage';
import CartPage from './pages/shop/CartPage';
import MyOrdersPage from './pages/shop/MyOrdersPage';
import MyLedgerPage from './pages/shop/MyLedgerPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <Layout role="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="shops" element={<ShopsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="ledger/:shopId" element={<LedgerPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="users/pending" element={<PendingUsersPage />} />
            </Route>

            <Route
              path="/shop"
              element={
                <ProtectedRoute role="shopkeeper">
                  <Layout role="shopkeeper" />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="catalog" replace />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="ledger" element={<MyLedgerPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
