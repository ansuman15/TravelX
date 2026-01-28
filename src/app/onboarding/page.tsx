'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Clock, Mail, LogOut, Loader2, Check, Building } from 'lucide-react';

type OnboardingStep = 'loading' | 'pending' | 'complete';

interface AuthUser {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
}

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<OnboardingStep>('loading');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userName, setUserName] = useState('');

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
        setUserName(authUser.user_metadata?.full_name || authUser.email || 'User');

        // Check if user already has profile and agency
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, agency_id, role')
            .eq('id', authUser.id)
            .single();

        if (existingUser?.agency_id) {
            // Already has an agency - redirect based on role
            if (existingUser.role === 'super_admin') {
                router.push('/admin');
            } else {
                router.push('/agency');
            }
            return;
        }

        if (existingUser?.role === 'super_admin') {
            // Super admin without agency - redirect to admin dashboard
            router.push('/admin');
            return;
        }

        // User registered but not yet assigned to an agency
        setStep('pending');
    };

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
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

    // Pending approval screen
    return (
        <div className="onboarding-page">
            <div className="pending-container">
                {/* Header */}
                <div className="pending-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <MapPin size={24} />
                        </div>
                        <span>TravelX</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pending-card">
                    <div className="pending-icon">
                        <Clock size={40} />
                    </div>

                    <h1>Account Pending Setup</h1>

                    <p className="welcome-text">
                        Welcome, <strong>{userName}</strong>!
                    </p>

                    <p className="description">
                        Your account has been created successfully. An administrator will
                        assign you to a travel agency shortly.
                    </p>

                    <div className="info-box">
                        <div className="info-item">
                            <Mail size={18} />
                            <span>You'll receive an email notification once your account is ready.</span>
                        </div>
                        <div className="info-item">
                            <Building size={18} />
                            <span>Contact your administrator if you need immediate access.</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => window.location.reload()} className="btn-refresh">
                            <Check size={18} />
                            Check Status
                        </button>
                        <button onClick={handleSignOut} className="btn-signout">
                            <LogOut size={18} />
                            Sign Out
                        </button>
                    </div>

                    <div className="email-display">
                        Signed in as: <strong>{user?.email}</strong>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .onboarding-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .pending-container {
                    width: 100%;
                    max-width: 480px;
                }

                .pending-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    color: white;
                    font-size: 24px;
                    font-weight: 700;
                }

                .logo-icon {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8));
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pending-card {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 24px;
                    padding: 48px 40px;
                    text-align: center;
                    box-shadow: 
                        0 4px 6px rgba(0, 0, 0, 0.05),
                        0 10px 20px rgba(0, 0, 0, 0.08),
                        0 20px 40px rgba(0, 0, 0, 0.1);
                }

                .pending-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #fef3c7, #fde68a);
                    color: #d97706;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 24px;
                }

                h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 12px;
                }

                .welcome-text {
                    font-size: 16px;
                    color: #475569;
                    margin-bottom: 8px;
                }

                .description {
                    font-size: 15px;
                    color: #64748b;
                    line-height: 1.6;
                    margin-bottom: 24px;
                }

                .info-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 24px;
                    text-align: left;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 8px 0;
                    color: #475569;
                    font-size: 14px;
                }

                .info-item:first-child {
                    border-bottom: 1px solid #e2e8f0;
                }

                .action-buttons {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                .btn-refresh {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-refresh:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                }

                .btn-signout {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 20px;
                    background: #f1f5f9;
                    color: #475569;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .btn-signout:hover {
                    background: #e2e8f0;
                }

                .email-display {
                    font-size: 13px;
                    color: #94a3b8;
                }
            `}</style>
        </div>
    );
}
