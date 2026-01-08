'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Loader2, Mail, ArrowLeft } from 'lucide-react';

function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const supabase = createClient();

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
                setLoading(false);
                return;
            }

            setSent(true);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }

        setLoading(false);
    };

    if (sent) {
        return (
            <div className="login-form-wrapper">
                <div className="text-center">
                    <div className="verify-icon">
                        <Mail size={48} />
                    </div>
                    <h2 style={{ marginBottom: '16px' }}>Check your email</h2>
                    <p className="text-secondary" style={{ marginBottom: '24px' }}>
                        We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <Link href="/login">
                        <button className="btn btn-secondary" style={{ width: '100%' }}>
                            <ArrowLeft size={16} />
                            Back to Sign In
                        </button>
                    </Link>
                </div>

                <style jsx>{`
          .verify-icon {
            width: 80px;
            height: 80px;
            background: var(--primary-50);
            color: var(--primary-600);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="login-form-wrapper">
            <div className="login-form-header">
                <h2>Forgot password?</h2>
                <p>Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
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

                <button
                    type="submit"
                    className="btn btn-primary login-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="spin" size={18} />
                            Sending...
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </button>
            </form>

            <div className="login-footer">
                <p>
                    <Link href="/login" className="text-primary-600">
                        <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
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
                        <h1>Reset Your Password</h1>
                        <p>
                            Don't worry, it happens to the best of us. Enter your email and we'll help you get back in.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-container">
                    <Suspense fallback={<div className="spinner" />}>
                        <ForgotPasswordForm />
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
          background: linear-gradient(135deg, var(--warning-500), var(--warning-700));
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
          color: rgba(255, 255, 255, 0.9);
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
        </div>
    );
}
