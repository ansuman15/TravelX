'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Eye, EyeOff, Loader2, Mail, Check } from 'lucide-react';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<'form' | 'verify'>('form');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
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

            // Sign up with Supabase Auth
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            if (data.user) {
                // Show verification message
                setStep('verify');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        }

        setLoading(false);
    };

    if (step === 'verify') {
        return (
            <div className="login-form-wrapper">
                <div className="text-center">
                    <div className="verify-icon">
                        <Mail size={48} />
                    </div>
                    <h2 style={{ marginBottom: '16px' }}>Check your email</h2>
                    <p className="text-secondary" style={{ marginBottom: '24px' }}>
                        We've sent a verification link to <strong>{email}</strong>
                    </p>
                    <p className="text-secondary text-sm" style={{ marginBottom: '24px' }}>
                        Click the link in the email to verify your account and complete your registration.
                    </p>
                    <Link href="/login">
                        <button className="btn btn-secondary" style={{ width: '100%' }}>
                            Back to Sign In
                        </button>
                    </Link>
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
                <h2>Create your account</h2>
                <p>Start managing your travel agency today</p>
            </div>

            <form onSubmit={handleSignup} className="login-form">
                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="fullName" className="form-label">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        className="form-input"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

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
                        Confirm Password
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
                            Creating account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="login-footer">
                <p>
                    Already have an account? <Link href="/login" className="text-primary-600">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
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
                        <h1>Start Your Journey</h1>
                        <p>
                            Join thousands of travel agencies managing their business efficiently with TravelX.
                        </p>
                        <div className="login-features">
                            <div className="login-feature">
                                <span className="login-feature-icon">✓</span>
                                <span>Free 14-day trial</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">✓</span>
                                <span>No credit card required</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">✓</span>
                                <span>Setup in under 5 minutes</span>
                            </div>
                            <div className="login-feature">
                                <span className="login-feature-icon">✓</span>
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="login-form-container">
                    <Suspense fallback={<div className="spinner" />}>
                        <SignupForm />
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
          background: linear-gradient(135deg, var(--success-600), var(--success-800));
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
        </div>
    );
}
