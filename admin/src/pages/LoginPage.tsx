import { type FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getErrorMessage, useLogin } from '@/hooks/useAuth';

export function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const loginMutation = useLogin();

  if (localStorage.getItem('ecomm_admin_token')) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <h2>Admin Login</h2>
        <p className="muted">Sign in to manage products and services.</p>

        {loginMutation.isError ? (
          <div className="error-box">{getErrorMessage(loginMutation.error)}</div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label className="form-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
