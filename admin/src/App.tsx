import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductCategoriesPage } from '@/pages/ProductCategoriesPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CouponsPage } from '@/pages/CouponsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/product-categories" element={<ProductCategoriesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
