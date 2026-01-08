'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Eye, EyeOff, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/agency';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Get user role to determine redirect
        const { data: userData } = await supabase
          .from('users')
          .select('role, is_active, agency_id')
          .eq('id', data.user.id)
          .single();

        if (!userData) {
          // New user - needs onboarding
          router.push('/onboarding');
          router.refresh();
          return;
        }

        if (!userData.is_active) {
          setError('Your account has been deactivated. Please contact administrator.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!userData.agency_id && userData.role !== 'super_admin') {
          // No agency assigned - needs onboarding
          router.push('/onboarding');
          router.refresh();
          return;
        }

        // Redirect based on role
        if (userData.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push(redirect);
        }
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-form-wrapper">
      <div className="login-form-header">
        <h2>Welcome back</h2>
        <p>Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <Link href="/forgot-password" className="text-sm text-primary-600">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary login-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="spin" size={18} />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account? <Link href="/signup" className="text-primary-600">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <div className="login-logo-icon">
                <MapPin size={32} />
              </div>
              <span className="login-logo-text">TravelX</span>
            </div>
            <h1>Enterprise Travel Agency Management</h1>
            <p>
              Manage leads, bookings, payments, and documents — all in one place.
              Built for serious travel agencies.
            </p>
            <div className="login-features">
              <div className="login-feature">
                <span className="login-feature-icon">✓</span>
                <span>Multi-tenant architecture</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">✓</span>
                <span>Role-based access control</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">✓</span>
                <span>Complete booking lifecycle</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">✓</span>
                <span>Secure document management</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <Suspense fallback={<div className="spinner" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .login-container {
          display: flex;
          min-height: 100vh;
        }

        .login-branding {
          flex: 1;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-10);
          color: white;
        }

        .login-branding-content {
          max-width: 480px;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          margin-bottom: var(--spacing-8);
        }

        .login-logo-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-logo-text {
          font-size: var(--font-3xl);
          font-weight: var(--weight-bold);
        }

        .login-branding h1 {
          font-size: var(--font-3xl);
          font-weight: var(--weight-bold);
          margin-bottom: var(--spacing-4);
          color: white;
        }

        .login-branding p {
          font-size: var(--font-lg);
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: var(--spacing-8);
          color: rgba(255, 255, 255, 0.9);
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-3);
        }

        .login-feature {
          display: flex;
          align-items: center;
          gap: var(--spacing-3);
          font-size: var(--font-base);
        }

        .login-feature-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-sm);
        }

        .login-form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-10);
          background: var(--bg-secondary);
        }

        @media (max-width: 900px) {
          .login-branding {
            display: none;
          }
        }
      `}</style>

      <style jsx global>{`
        .login-form-wrapper {
          width: 100%;
          max-width: 400px;
        }

        .login-form-header {
          text-align: center;
          margin-bottom: var(--spacing-8);
        }

        .login-form-header h2 {
          font-size: var(--font-2xl);
          font-weight: var(--weight-bold);
          color: var(--text-primary);
          margin-bottom: var(--spacing-2);
        }

        .login-form-header p {
          color: var(--text-secondary);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .login-error {
          padding: var(--spacing-3) var(--spacing-4);
          background: var(--error-50);
          border: 1px solid var(--error-200);
          border-radius: var(--radius-lg);
          color: var(--error-600);
          font-size: var(--font-sm);
        }

        .password-input-wrapper {
          position: relative;
        }

        .password-input-wrapper .form-input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .password-toggle:hover {
          color: var(--text-secondary);
        }

        .login-submit {
          width: 100%;
          padding: var(--spacing-3);
          font-size: var(--font-base);
          margin-top: var(--spacing-4);
        }

        .login-footer {
          margin-top: var(--spacing-8);
          text-align: center;
        }

        .login-footer p {
          font-size: var(--font-sm);
          color: var(--text-tertiary);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
