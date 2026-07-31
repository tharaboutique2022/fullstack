import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useMe, useLogout } from '@/hooks/useAuth';
import { QueryState } from '@/components/QueryState';

const navLinkClass = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : undefined);

export function ProtectedLayout() {
  const token = localStorage.getItem('ecomm_admin_token');
  const meQuery = useMe(!!token);
  const logout = useLogout();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Beauty Admin</h1>
        <nav>
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/product-categories" className={navLinkClass}>
            Product categories
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/services" className={navLinkClass}>
            Services
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
          <NavLink to="/bookings" className={navLinkClass}>
            Bookings
          </NavLink>
          <NavLink to="/customers" className={navLinkClass}>
            Customers
          </NavLink>
          <NavLink to="/coupons" className={navLinkClass}>
            Coupons
          </NavLink>
        </nav>
        <button className="btn btn-secondary" style={{ marginTop: 24 }} onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <QueryState
          isLoading={meQuery.isPending && !meQuery.data}
          isError={meQuery.isError}
          error={meQuery.error}
        >
          <Outlet />
        </QueryState>
      </main>
    </div>
  );
}
