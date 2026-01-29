'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Eye, EyeOff, Loader2, Shield, Globe, Plane, Sparkles } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/agency';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      let message = 'An authentication error occurred.';

      if (errorParam === 'access_denied') {
        message = 'Access denied. Please try again.';
      } else if (errorParam === 'otp_expired' || errorDescription?.includes('expired')) {
        message = 'The email link has expired. Please request a new one.';
      } else if (errorParam === 'auth_error') {
        message = 'Authentication failed. Please try again.';
      } else if (errorDescription) {
        message = errorDescription.replace(/\+/g, ' ');
      }

      setError(message);

      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      url.searchParams.delete('error_description');
      url.searchParams.delete('error_code');
      window.history.replaceState(null, '', url.toString());
    }
  }, [searchParams]);

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
        const { data: userData } = await supabase
          .from('users')
          .select('role, is_active, agency_id')
          .eq('id', data.user.id)
          .single();

        if (!userData) {
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
          router.push('/onboarding');
          router.refresh();
          return;
        }

        if (userData.role === 'super_admin') {
          router.push('/admin');
        } else {
          router.push(redirect);
        }
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-card-header">
        <div className="login-icon-wrapper">
          <Sparkles size={24} />
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to continue to TravelX</p>
      </div>

      <form onSubmit={handleLogin} className="login-form">
        {error && (
          <div className="login-error">
            <div className="error-icon">!</div>
            {error}
          </div>
        )}

        <div className={`form-field ${focusedField === 'email' ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            required
            disabled={loading}
          />
          <div className="field-border"></div>
        </div>

        <div className={`form-field ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="field-border"></div>
          <div style={{ textAlign: 'right', marginTop: '8px' }}>
            <Link href="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" className="login-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="spin" size={20} />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <Sparkles size={18} />
            </>
          )}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don&apos;t have an account? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}

function FloatingParticles() {
  return (
    <div className="particles">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <FloatingParticles />
      </div>

      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="brand-logo">
              <div className="logo-icon">
                <MapPin size={28} />
              </div>
              <span className="logo-text">TravelX</span>
            </div>

            <div className="brand-hero">
              <h1>Welcome Back</h1>
              <p>
                Access your travel agency dashboard and manage bookings, customers, and documents seamlessly.
              </p>
            </div>

            <div className="brand-features">
              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={22} />
                </div>
                <div className="feature-content">
                  <h4>Secure Access</h4>
                  <p>Enterprise-grade security</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Globe size={22} />
                </div>
                <div className="feature-content">
                  <h4>Real-time Sync</h4>
                  <p>Access from anywhere</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon">
                  <Plane size={22} />
                </div>
                <div className="feature-content">
                  <h4>Smart Dashboard</h4>
                  <p>All insights at a glance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <Suspense fallback={<div className="login-loading"><Loader2 className="spin" size={32} /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
        }

        .gradient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
          animation: float 20s ease-in-out infinite;
        }

        .orb-1 {
          width: 600px;
          height: 600px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          top: -200px;
          right: -100px;
        }

        .orb-2 {
          width: 500px;
          height: 500px;
          background: linear-gradient(135deg, #06b6d4, #3b82f6);
          bottom: -150px;
          left: -100px;
          animation-delay: -5s;
        }

        .orb-3 {
          width: 400px;
          height: 400px;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -10s;
          opacity: 0.3;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -30px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(10px, 10px) scale(1.02); }
        }

        .particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: particle-float linear infinite;
        }

        @keyframes particle-float {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
        }

        .login-container {
          position: relative;
          z-index: 1;
          display: flex;
          min-height: 100vh;
        }

        .login-branding {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: white;
        }

        .branding-content {
          max-width: 480px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 48px;
        }

        .logo-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .brand-hero h1 {
          font-size: 42px;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-hero p {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 40px;
        }

        .brand-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(8px);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .feature-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a5b4fc;
        }

        .feature-content h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 2px;
          color: white;
        }

        .feature-content p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
        }

        .login-form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
        }

        .login-loading {
          color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 1024px) {
          .login-branding {
            display: none;
          }
          
          .login-form-container {
            background: transparent;
          }
        }
      `}</style>

      <style jsx global>{`
        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 
            0 4px 6px rgba(0, 0, 0, 0.05),
            0 10px 20px rgba(0, 0, 0, 0.08),
            0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .login-card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-icon-wrapper {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
        }

        .login-card-header h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }

        .login-card-header p {
          font-size: 15px;
          color: #64748b;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
          animation: shake 0.5s ease;
        }

        .error-icon {
          width: 22px;
          height: 22px;
          background: #dc2626;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }

        .form-field {
          position: relative;
        }

        .form-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
          transition: color 0.2s ease;
        }

        .form-field.focused label {
          color: #6366f1;
        }

        .form-field input {
          width: 100%;
          padding: 14px 16px;
          font-size: 15px;
          color: #1e293b;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-field input::placeholder {
          color: #94a3b8;
        }

        .form-field input:focus {
          background: white;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .form-field input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .field-border {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 0 0 12px 12px;
        }

        .form-field.focused .field-border {
          width: 100%;
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #6366f1;
        }

        .forgot-link {
          font-size: 13px;
          color: #6366f1;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #4f46e5;
        }

        .login-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          margin-top: 8px;
        }

        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
        }

        .login-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 28px;
          text-align: center;
        }

        .login-footer p {
          font-size: 14px;
          color: #64748b;
        }

        .login-footer a {
          color: #6366f1;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .login-footer a:hover {
          color: #4f46e5;
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
