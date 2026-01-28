'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Loader2, Check, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Handle auth state change when user lands from email link
    useEffect(() => {
        const supabase = createClient();

        // Check if we have a valid session or if auth state changes
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setIsReady(true);
            }
        };

        checkSession();

        // Listen for auth state changes (for when session is established from hash fragment)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
                setIsReady(true);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/agency');
            }, 2000);
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }

        setLoading(false);
    };

    if (success) {
        return (
            <div className="login-form-wrapper">
                <div className="text-center">
                    <div className="verify-icon">
                        <Check size={48} />
                    </div>
                    <h2 style={{ marginBottom: '16px' }}>Password Updated!</h2>
                    <p className="text-secondary">
                        Redirecting to your dashboard...
                    </p>
                </div>

                <style jsx>{`
          .verify-icon {
            width: 80px;
            height: 80px;
            background: var(--success-50);
            color: var(--success-600);
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
                <h2>Set New Password</h2>
                <p>Enter your new password below</p>
            </div>

            {!isReady && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Loader2 className="spin" size={32} style={{ margin: '0 auto 16px' }} />
                    <p className="text-secondary">Verifying your reset link...</p>
                </div>
            )}

            {isReady && (
                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            New Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            className="form-input"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            )}

            <div className="login-footer">
                <p>
                    <Link href="/login" className="text-primary-600">Back to Sign In</Link>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
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
                        <h1>Set New Password</h1>
                        <p>
                            Choose a strong password to keep your account secure.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-container">
                    <Suspense fallback={<div className="spinner" />}>
                        <ResetPasswordForm />
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
