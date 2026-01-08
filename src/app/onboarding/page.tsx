'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Building, User, ArrowRight, Loader2, Check } from 'lucide-react';

type OnboardingStep = 'loading' | 'agency' | 'profile' | 'complete';

interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('loading');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState<AuthUser | null>(null);

    // Agency form
    const [agencyData, setAgencyData] = useState({
        name: '',
        phone: '',
        address: '',
        city: '',
    });

    // Profile form
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
            router.push('/login');
            return;
        }

        setUser({ id: authUser.id, email: authUser.email, user_metadata: authUser.user_metadata });

        // Pre-fill name from auth metadata
        if (authUser.user_metadata?.full_name) {
            setProfileData(prev => ({ ...prev, full_name: authUser.user_metadata?.full_name || '' }));
        }

        // Check if user already has profile and agency
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, agency_id')
            .eq('id', authUser.id)
            .single();

        if (existingUser?.agency_id) {
            // Already onboarded
            router.push('/agency');
            return;
        }

        setStep('agency');
    };

    const handleCreateAgency = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const supabase = createClient();

            // Create agency
            const { data: agency, error: agencyError } = await supabase
                .from('agencies')
                .insert({
                    name: agencyData.name,
                    phone: agencyData.phone || null,
                    address: agencyData.address || null,
                    city: agencyData.city || null,
                    is_active: true,
                })
                .select()
                .single();

            if (agencyError) {
                setError(agencyError.message);
                setLoading(false);
                return;
            }

            // Store agency ID for profile step
            localStorage.setItem('onboarding_agency_id', agency.id);

            setStep('profile');
        } catch (err) {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            const supabase = createClient();
            const agencyId = localStorage.getItem('onboarding_agency_id');

            if (!agencyId) {
                setStep('agency');
                setLoading(false);
                return;
            }

            // Check if user already exists in users table
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            if (existingUser) {
                // Update existing user
                const { error: updateError } = await supabase
                    .from('users')
                    .update({
                        full_name: profileData.full_name,
                        phone: profileData.phone || null,
                        agency_id: agencyId,
                        role: 'agency_admin',
                        is_active: true,
                    })
                    .eq('id', user.id);

                if (updateError) {
                    setError(updateError.message);
                    setLoading(false);
                    return;
                }
            } else {
                // Create user profile
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: profileData.full_name,
                        phone: profileData.phone || null,
                        agency_id: agencyId,
                        role: 'agency_admin',
                        is_active: true,
                    });

                if (profileError) {
                    setError(profileError.message);
                    setLoading(false);
                    return;
                }
            }

            localStorage.removeItem('onboarding_agency_id');
            setStep('complete');

            // Redirect after a brief pause
            setTimeout(() => {
                router.push('/agency');
            }, 2000);
        } catch (err) {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    if (step === 'loading') {
        return (
            <div className="onboarding-page">
                <div className="onboarding-loading">
                    <Loader2 size={48} className="spin text-primary-500" />
                    <p>Loading...</p>
                </div>
                <style jsx>{`
          .onboarding-page {
            min-height: 100vh;
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .onboarding-loading {
            text-align: center;
          }
        `}</style>
            </div>
        );
    }

    if (step === 'complete') {
        return (
            <div className="onboarding-page">
                <div className="onboarding-content">
                    <div className="complete-icon">
                        <Check size={48} />
                    </div>
                    <h2>You&apos;re all set!</h2>
                    <p>Redirecting to your dashboard...</p>
                </div>
                <style jsx>{`
          .onboarding-page {
            min-height: 100vh;
            background: var(--bg-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .onboarding-content {
            text-align: center;
            max-width: 400px;
          }
          .complete-icon {
            width: 100px;
            height: 100px;
            background: var(--success-50);
            color: var(--success-600);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
          h2 {
            margin-bottom: 8px;
          }
          p {
            color: var(--text-secondary);
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="onboarding-page">
            <div className="onboarding-container">
                {/* Header */}
                <div className="onboarding-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <MapPin size={24} />
                        </div>
                        <span>TravelX</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="progress-steps">
                    <div className={`progress-step ${step === 'agency' || step === 'profile' ? 'active' : ''}`}>
                        <div className="step-number">1</div>
                        <span>Agency Details</span>
                    </div>
                    <div className="progress-line" />
                    <div className={`progress-step ${step === 'profile' ? 'active' : ''}`}>
                        <div className="step-number">2</div>
                        <span>Your Profile</span>
                    </div>
                </div>

                {/* Form */}
                <div className="onboarding-form-container">
                    {step === 'agency' && (
                        <form onSubmit={handleCreateAgency} className="onboarding-form">
                            <div className="form-header">
                                <Building size={32} className="text-primary-500" />
                                <h2>Set up your agency</h2>
                                <p>Tell us about your travel agency</p>
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Agency Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Your Travel Agency Name"
                                    value={agencyData.name}
                                    onChange={(e) => setAgencyData({ ...agencyData, name: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+91 98765 43210"
                                    value={agencyData.phone}
                                    onChange={(e) => setAgencyData({ ...agencyData, phone: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Mumbai"
                                    value={agencyData.city}
                                    onChange={(e) => setAgencyData({ ...agencyData, city: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Full address"
                                    value={agencyData.address}
                                    onChange={(e) => setAgencyData({ ...agencyData, address: e.target.value })}
                                    disabled={loading}
                                    rows={2}
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !agencyData.name}>
                                {loading ? (
                                    <>
                                        <Loader2 className="spin" size={18} />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'profile' && (
                        <form onSubmit={handleCompleteProfile} className="onboarding-form">
                            <div className="form-header">
                                <User size={32} className="text-primary-500" />
                                <h2>Complete your profile</h2>
                                <p>This helps your team identify you</p>
                            </div>

                            {error && <div className="form-error">{error}</div>}

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+91 98765 43210"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={user?.email || ''}
                                    disabled
                                />
                                <span className="form-hint">Email cannot be changed</span>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !profileData.full_name}>
                                {loading ? (
                                    <>
                                        <Loader2 className="spin" size={18} />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        Complete Setup
                                        <Check size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
        .onboarding-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-50), var(--bg-secondary));
          padding: var(--spacing-8);
        }

        .onboarding-container {
          max-width: 520px;
          margin: 0 auto;
        }

        .onboarding-header {
          text-align: center;
          margin-bottom: var(--spacing-8);
        }

        .logo {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-2);
          font-size: var(--font-xl);
          font-weight: var(--weight-bold);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--primary-500);
          color: white;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-4);
          margin-bottom: var(--spacing-8);
        }

        .progress-step {
          display: flex;
          align-items: center;
          gap: var(--spacing-2);
          opacity: 0.5;
        }

        .progress-step.active {
          opacity: 1;
        }

        .step-number {
          width: 28px;
          height: 28px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--weight-medium);
          font-size: var(--font-sm);
        }

        .progress-step.active .step-number {
          background: var(--primary-500);
          color: white;
        }

        .progress-line {
          width: 60px;
          height: 2px;
          background: var(--border-light);
        }

        .onboarding-form-container {
          background: white;
          border-radius: var(--radius-xl);
          padding: var(--spacing-8);
          box-shadow: var(--shadow-lg);
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4);
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--spacing-4);
        }

        .form-header h2 {
          margin-top: var(--spacing-3);
          margin-bottom: var(--spacing-1);
        }

        .form-header p {
          color: var(--text-secondary);
        }

        .form-error {
          padding: var(--spacing-3);
          background: var(--error-50);
          border: 1px solid var(--error-200);
          border-radius: var(--radius-lg);
          color: var(--error-600);
          font-size: var(--font-sm);
        }

        .form-hint {
          font-size: var(--font-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-1);
        }

        .btn-lg {
          padding: var(--spacing-3) var(--spacing-6);
          font-size: var(--font-base);
          margin-top: var(--spacing-4);
        }
      `}</style>

            <style jsx global>{`
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
