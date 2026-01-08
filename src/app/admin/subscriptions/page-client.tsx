'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Package,
    Search,
    Edit2,
    Building,
    Users,
    CheckCircle,
    XCircle,
    Crown,
    Star,
    Zap,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

interface Agency {
    id: string;
    name: string;
    email: string | null;
    subscription_plan: string | null;
    subscription_status: string | null;
    max_staff: number;
    is_active: boolean;
    created_at: string;
    user_count: number;
}

interface SubscriptionsPageClientProps {
    agencies: Agency[];
    stats: {
        plans: {
            basic: number;
            pro: number;
            enterprise: number;
        };
        activeSubscriptions: number;
    };
}

const PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        icon: Zap,
        color: 'secondary',
        maxStaff: 5,
        features: ['5 Staff Members', 'Basic Reports', 'Email Support'],
    },
    {
        id: 'pro',
        name: 'Professional',
        icon: Star,
        color: 'primary',
        maxStaff: 15,
        features: ['15 Staff Members', 'Advanced Reports', 'Priority Support', 'API Access'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        icon: Crown,
        color: 'warning',
        maxStaff: 50,
        features: ['Unlimited Staff', 'Custom Reports', '24/7 Support', 'Custom Integration'],
    },
];

export function SubscriptionsPageClient({ agencies, stats }: SubscriptionsPageClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [newPlan, setNewPlan] = useState('');

    const filteredAgencies = agencies.filter((agency) => {
        const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = planFilter === 'all' || agency.subscription_plan === planFilter;
        return matchesSearch && matchesPlan;
    });

    const getPlanBadge = (plan: string | null) => {
        switch (plan) {
            case 'enterprise':
                return <Badge variant="warning">Enterprise</Badge>;
            case 'pro':
                return <Badge variant="primary">Pro</Badge>;
            default:
                return <Badge variant="secondary">Basic</Badge>;
        }
    };

    const handleUpgrade = (agency: Agency) => {
        setSelectedAgency(agency);
        setNewPlan(agency.subscription_plan || 'basic');
        setShowUpgradeModal(true);
    };

    const handleSaveUpgrade = async () => {
        // TODO: Implement plan upgrade API call
        setShowUpgradeModal(false);
        router.refresh();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Subscription Management</h1>
                    <p className="text-secondary text-sm">Manage agency subscription plans</p>
                </div>
            </div>

            {/* Plan Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{agencies.length}</div>
                        <div className="text-sm text-secondary">Total Agencies</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-secondary-600">{stats.plans.basic}</div>
                        <div className="text-sm text-secondary">Basic Plan</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-primary-600">{stats.plans.pro}</div>
                        <div className="text-sm text-secondary">Pro Plan</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-warning-600">{stats.plans.enterprise}</div>
                        <div className="text-sm text-secondary">Enterprise Plan</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                    <div className="flex gap-4">
                        <div style={{ flex: 1 }}>
                            <div className="input-wrapper">
                                <Search className="input-icon" size={18} />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search agencies..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Plans</option>
                            <option value="basic">Basic</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Agencies Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Agency</th>
                                <th>Plan</th>
                                <th>Users</th>
                                <th>Max Staff</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgencies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <p className="text-secondary">No agencies found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgencies.map((agency) => (
                                    <tr key={agency.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="agency-icon">
                                                    <Building size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{agency.name}</div>
                                                    <div className="text-xs text-secondary">{agency.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getPlanBadge(agency.subscription_plan)}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-secondary" />
                                                <span>{agency.user_count}</span>
                                            </div>
                                        </td>
                                        <td>{agency.max_staff}</td>
                                        <td>
                                            {agency.is_active && agency.subscription_status === 'active' ? (
                                                <span className="flex items-center gap-1 text-success-600">
                                                    <CheckCircle size={14} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-error-600">
                                                    <XCircle size={14} />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-sm text-secondary">
                                            {formatDate(agency.created_at)}
                                        </td>
                                        <td>
                                            <Button variant="ghost" size="sm" onClick={() => handleUpgrade(agency)}>
                                                <Edit2 size={14} />
                                                Change Plan
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upgrade Modal */}
            <Modal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                title={`Change Plan - ${selectedAgency?.name}`}
            >
                <div className="plan-options">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.id}
                            className={`plan-option ${newPlan === plan.id ? 'selected' : ''}`}
                            onClick={() => setNewPlan(plan.id)}
                        >
                            <div className="plan-header">
                                <plan.icon size={24} />
                                <span className="plan-name">{plan.name}</span>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowUpgradeModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveUpgrade}>
                        Save Changes
                    </Button>
                </div>
            </Modal>

            <style jsx>{`
                .agency-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .plan-options {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-4);
                }
                .plan-option {
                    border: 2px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-4);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .plan-option:hover {
                    border-color: var(--primary-200);
                }
                .plan-option.selected {
                    border-color: var(--primary-500);
                    background: var(--primary-50);
                }
                .plan-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    margin-bottom: var(--spacing-3);
                }
                .plan-name {
                    font-weight: var(--weight-semibold);
                }
                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    font-size: var(--font-sm);
                    color: var(--text-secondary);
                }
                .plan-features li {
                    padding: var(--spacing-1) 0;
                }
            `}</style>
        </div>
    );
}

