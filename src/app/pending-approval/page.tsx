'use client';

import { MapPin, Clock, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PendingApprovalPage() {
    return (
        <div className="pending-page">
            <div className="pending-container">
                <div className="pending-card">
                    <div className="pending-icon">
                        <Clock size={48} />
                    </div>

                    <h1>Account Pending Approval</h1>

                    <p className="pending-message">
                        Thank you for signing up! Your account is currently under review by our admin team.
                    </p>

                    <div className="pending-steps">
                        <div className="step completed">
                            <div className="step-icon">
                                <CheckCircle size={20} />
                            </div>
                            <div className="step-content">
                                <h4>Account Created</h4>
                                <p>Your registration was successful</p>
                            </div>
                        </div>

                        <div className="step active">
                            <div className="step-icon">
                                <Clock size={20} />
                            </div>
                            <div className="step-content">
                                <h4>Pending Approval</h4>
                                <p>Admin is reviewing your account</p>
                            </div>
                        </div>

                        <div className="step">
                            <div className="step-icon">
                                <Mail size={20} />
                            </div>
                            <div className="step-content">
                                <h4>Get Notified</h4>
                                <p>We'll email you once approved</p>
                            </div>
                        </div>
                    </div>

                    <div className="pending-info">
                        <p>This usually takes less than 24 hours. You'll receive an email once your account is approved.</p>
                    </div>

                    <Link href="/login" className="back-link">
                        ← Back to Login
                    </Link>
                </div>

                <div className="brand-footer">
                    <MapPin size={18} />
                    <span>TravelX</span>
                </div>
            </div>

            <style jsx>{`
                .pending-page {
                    min-height: 100vh;
                    background: var(--gray-50);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-6);
                }
                
                .pending-container {
                    width: 100%;
                    max-width: 480px;
                }
                
                .pending-card {
                    background: white;
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-10);
                    box-shadow: var(--shadow-card);
                    text-align: center;
                }
                
                .pending-icon {
                    width: 80px;
                    height: 80px;
                    background: var(--warning-50);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--warning-600);
                    margin: 0 auto var(--spacing-6);
                }
                
                .pending-card h1 {
                    font-size: var(--font-2xl);
                    font-weight: var(--weight-bold);
                    color: var(--text-primary);
                    margin-bottom: var(--spacing-3);
                }
                
                .pending-message {
                    color: var(--text-secondary);
                    font-size: var(--font-base);
                    line-height: 1.6;
                    margin-bottom: var(--spacing-8);
                }
                
                .pending-steps {
                    text-align: left;
                    margin-bottom: var(--spacing-6);
                }
                
                .step {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-4);
                    padding: var(--spacing-4);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-2);
                    opacity: 0.5;
                }
                
                .step.completed {
                    opacity: 1;
                    background: var(--success-50);
                }
                
                .step.completed .step-icon {
                    color: var(--success-600);
                }
                
                .step.active {
                    opacity: 1;
                    background: var(--warning-50);
                }
                
                .step.active .step-icon {
                    color: var(--warning-600);
                }
                
                .step-icon {
                    flex-shrink: 0;
                    color: var(--text-tertiary);
                }
                
                .step-content h4 {
                    font-size: var(--font-sm);
                    font-weight: var(--weight-semibold);
                    color: var(--text-primary);
                    margin-bottom: 2px;
                }
                
                .step-content p {
                    font-size: var(--font-xs);
                    color: var(--text-secondary);
                }
                
                .pending-info {
                    padding: var(--spacing-4);
                    background: var(--gray-50);
                    border-radius: var(--radius-lg);
                    margin-bottom: var(--spacing-6);
                }
                
                .pending-info p {
                    font-size: var(--font-sm);
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .back-link {
                    color: var(--primary-600);
                    font-size: var(--font-sm);
                    font-weight: var(--weight-medium);
                    text-decoration: none;
                }
                
                .back-link:hover {
                    text-decoration: underline;
                }
                
                .brand-footer {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--spacing-2);
                    margin-top: var(--spacing-6);
                    color: var(--text-tertiary);
                    font-weight: var(--weight-semibold);
                }
            `}</style>
        </div>
    );
}
