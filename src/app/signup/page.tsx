'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Eye, EyeOff, Loader2, Mail, Check, Plane, Globe, Shield, Sparkles } from 'lucide-react';

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
    const [focusedField, setFocusedField] = useState<string | null>(null);

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
                // Handle specific error cases
                if (signUpError.message.includes('rate limit')) {
                    setError('Too many signup attempts. Please wait and try again.');
                } else if (signUpError.message.includes('already registered')) {
                    setError('This email is already registered. Please sign in instead.');
                } else {
                    setError(signUpError.message);
                }
                setLoading(false);
                return;
            }

            if (data.user) {
                // Create user record with is_active = false (pending approval)
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        role: 'agency_admin',
                        is_active: false, // Requires admin approval
                    });

                if (insertError) {
                    console.error('Error creating user record:', insertError);
                }

                // Redirect to pending approval page
                router.push('/pending-approval');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('An unexpected error occurred. Please try again.');
        }

        setLoading(false);
    };

    if (step === 'verify') {
        return (
            <div className="signup-card">
                <div className="verify-container">
                    <div className="verify-icon-wrapper">
                        <div className="verify-icon-bg"></div>
                        <div className="verify-icon">
                            <Mail size={32} />
                        </div>
                        <div className="verify-check">
                            <Check size={14} />
                        </div>
                    </div>
                    <h2 className="verify-title">Check your email</h2>
                    <p className="verify-email">{email}</p>
                    <p className="verify-description">
                        We've sent you a verification link. Click the link in your email to activate your account.
                    </p>
                    <div className="verify-divider"></div>
                    <Link href="/login" className="verify-back-btn">
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-card">
            <div className="signup-card-header">
                <div className="signup-icon-wrapper">
                    <Sparkles size={24} />
                </div>
                <h2>Create your account</h2>
                <p>Start your journey with TravelX today</p>
            </div>

            <form onSubmit={handleSignup} className="signup-form">
                {error && (
                    <div className="signup-error">
                        <div className="error-icon">!</div>
                        {error}
                    </div>
                )}

                <div className={`form-field ${focusedField === 'fullName' ? 'focused' : ''} ${fullName ? 'has-value' : ''}`}>
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={loading}
                    />
                    <div className="field-border"></div>
                </div>

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
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                            required
                            disabled={loading}
                            minLength={6}
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
                </div>

                <div className={`form-field ${focusedField === 'confirmPassword' ? 'focused' : ''} ${confirmPassword ? 'has-value' : ''}`}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        required
                        disabled={loading}
                    />
                    <div className="field-border"></div>
                    {confirmPassword && password && (
                        <div className={`password-match ${confirmPassword === password ? 'match' : 'no-match'}`}>
                            {confirmPassword === password ? (
                                <><Check size={12} /> Passwords match</>
                            ) : (
                                <><span className="x-icon">✕</span> Passwords don't match</>
                            )}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="signup-submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="spin" size={20} />
                            <span>Creating account...</span>
                        </>
                    ) : (
                        <>
                            <span>Create Account</span>
                            <Sparkles size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="signup-footer">
                <p>
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}

// Floating particles component
function FloatingParticles() {
    return (
        <div className="particles">
            {[...Array(20)].map((_, i) => (
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

export default function SignupPage() {
    return (
        <div className="signup-page">
            {/* Animated Background */}
            <div className="signup-bg">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
                <FloatingParticles />
            </div>

            <div className="signup-container">
                {/* Left Side - Branding */}
                <div className="signup-branding">
                    <div className="branding-content">
                        <div className="brand-logo">
                            <div className="logo-icon">
                                <MapPin size={28} />
                            </div>
                            <span className="logo-text">TravelX</span>
                        </div>

                        <div className="brand-hero">
                            <h1>Start Your Journey</h1>
                            <p>
                                Join thousands of travel agencies transforming their business with our next-generation platform.
                            </p>
                        </div>

                        <div className="brand-features">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Shield size={22} />
                                </div>
                                <div className="feature-content">
                                    <h4>Enterprise Security</h4>
                                    <p>Bank-grade encryption & compliance</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Globe size={22} />
                                </div>
                                <div className="feature-content">
                                    <h4>Global Coverage</h4>
                                    <p>Manage bookings worldwide</p>
                                </div>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <Plane size={22} />
                                </div>
                                <div className="feature-content">
                                    <h4>Smart Automation</h4>
                                    <p>AI-powered workflows</p>
                                </div>
                            </div>
                        </div>

                        <div className="brand-trust">
                            <div className="trust-badge">
                                <Check size={14} />
                                <span>Free 14-day trial</span>
                            </div>
                            <div className="trust-badge">
                                <Check size={14} />
                                <span>No credit card required</span>
                            </div>
                            <div className="trust-badge">
                                <Check size={14} />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Signup Form */}
                <div className="signup-form-container">
                    <Suspense fallback={<div className="signup-loading"><Loader2 className="spin" size={32} /></div>}>
                        <SignupForm />
                    </Suspense>
                </div>
            </div>

            <style jsx>{`
                .signup-page {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                }

                .signup-bg {
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
                    left: -100px;
                }

                .orb-2 {
                    width: 500px;
                    height: 500px;
                    background: linear-gradient(135deg, #06b6d4, #3b82f6);
                    bottom: -150px;
                    right: -100px;
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

                .signup-container {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    min-height: 100vh;
                }

                .signup-branding {
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
                    margin-bottom: 40px;
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

                .brand-trust {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .trust-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: rgba(34, 197, 94, 0.15);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 20px;
                    font-size: 13px;
                    color: #86efac;
                }

                .signup-form-container {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px;
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(20px);
                }

                .signup-loading {
                    color: rgba(255, 255, 255, 0.6);
                }

                @media (max-width: 1024px) {
                    .signup-branding {
                        display: none;
                    }
                    
                    .signup-form-container {
                        background: transparent;
                    }
                }
            `}</style>

            <style jsx global>{`
                .signup-card {
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

                .signup-card-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .signup-icon-wrapper {
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

                .signup-card-header h2 {
                    font-size: 26px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .signup-card-header p {
                    font-size: 15px;
                    color: #64748b;
                }

                .signup-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .signup-error {
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

                .password-match {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 8px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .password-match.match {
                    color: #22c55e;
                }

                .password-match.no-match {
                    color: #ef4444;
                }

                .x-icon {
                    font-weight: 700;
                }

                .signup-submit {
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

                .signup-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
                }

                .signup-submit:active:not(:disabled) {
                    transform: translateY(0);
                }

                .signup-submit:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .signup-footer {
                    margin-top: 28px;
                    text-align: center;
                    padding-top: 24px;
                    border-top: 1px solid #e2e8f0;
                }

                .signup-footer p {
                    font-size: 14px;
                    color: #64748b;
                }

                .signup-footer a {
                    color: #6366f1;
                    font-weight: 600;
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .signup-footer a:hover {
                    color: #4f46e5;
                }

                /* Verify Screen */
                .verify-container {
                    text-align: center;
                }

                .verify-icon-wrapper {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 24px;
                }

                .verify-icon-bg {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-radius: 50%;
                    animation: pulse-ring 2s ease-out infinite;
                }

                .verify-icon {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    z-index: 1;
                }

                .verify-check {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 28px;
                    height: 28px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #22c55e;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    z-index: 2;
                }

                @keyframes pulse-ring {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.4); opacity: 0; }
                }

                .verify-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .verify-email {
                    font-size: 15px;
                    font-weight: 600;
                    color: #6366f1;
                    margin-bottom: 16px;
                }

                .verify-description {
                    font-size: 14px;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .verify-divider {
                    height: 1px;
                    background: #e2e8f0;
                    margin-bottom: 24px;
                }

                .verify-back-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 28px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #6366f1;
                    background: #f1f5f9;
                    border-radius: 10px;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .verify-back-btn:hover {
                    background: #e2e8f0;
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
