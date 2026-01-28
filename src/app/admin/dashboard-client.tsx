'use client';

import {
    Building,
    Users,
    Briefcase,
    DollarSign,
    TrendingUp,
    Activity,
    Calendar,
    Shield,
    ArrowRight,
} from 'lucide-react';
import { Badge, StatCard } from '@/components/ui';

interface Stats {
    totalAgencies: number;
    activeAgencies: number;
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    newAgenciesThisMonth: number;
    newUsersThisMonth: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
}

interface Agency {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
}

interface AdminDashboardClientProps {
    stats: Stats;
    recentAgencies: Agency[];
}

export function AdminDashboardClient({ stats, recentAgencies }: AdminDashboardClientProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
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
            {/* Welcome Banner */}
            <div className="welcome-banner mb-6 animate-slide-up">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={20} />
                            <span className="text-sm opacity-80">Super Admin</span>
                        </div>
                        <h1 className="welcome-title">Platform Overview</h1>
                        <p className="welcome-subtitle">Monitor and manage all TravelX agencies</p>
                    </div>
                    <button
                        className="btn-professional btn-professional-secondary"
                        onClick={() => window.location.href = '/admin/agencies'}
                        style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        Manage Agencies <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="animate-slide-up stagger-1">
                    <StatCard
                        label="Total Agencies"
                        value={stats.totalAgencies}
                        icon={Building}
                        variant="primary"
                        trend={stats.newAgenciesThisMonth > 0 ? { value: stats.newAgenciesThisMonth, isPositive: true } : undefined}
                    />
                </div>
                <div className="animate-slide-up stagger-2">
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        icon={Users}
                        variant="success"
                        trend={stats.newUsersThisMonth > 0 ? { value: stats.newUsersThisMonth, isPositive: true } : undefined}
                    />
                </div>
                <div className="animate-slide-up stagger-3">
                    <StatCard
                        label="Total Bookings"
                        value={stats.totalBookings}
                        icon={Briefcase}
                        variant="warning"
                        trend={stats.bookingsThisMonth > 0 ? { value: stats.bookingsThisMonth, isPositive: true } : undefined}
                    />
                </div>
                <div className="animate-slide-up stagger-4">
                    <StatCard
                        label="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                        variant="primary"
                    />
                </div>
            </div>

            {/* Activity & Agencies */}
            <div className="grid grid-cols-2 gap-6">
                {/* Platform Health */}
                <div className="card card-professional">
                    <div className="card-header">
                        <Activity size={18} className="text-primary-500" />
                        <span>Platform Health</span>
                    </div>
                    <div className="card-body">
                        <div className="health-grid">
                            <div className="health-item">
                                <div className="health-indicator success" />
                                <div>
                                    <div className="font-medium">Active Agencies</div>
                                    <div className="text-sm text-secondary">
                                        {stats.activeAgencies} / {stats.totalAgencies} ({((stats.activeAgencies / (stats.totalAgencies || 1)) * 100).toFixed(0)}%)
                                    </div>
                                </div>
                            </div>
                            <div className="health-item">
                                <div className="health-indicator success" />
                                <div>
                                    <div className="font-medium">Database</div>
                                    <div className="text-sm text-secondary">Connected to Supabase</div>
                                </div>
                            </div>
                            <div className="health-item">
                                <div className="health-indicator success" />
                                <div>
                                    <div className="font-medium">Authentication</div>
                                    <div className="text-sm text-secondary">All services operational</div>
                                </div>
                            </div>
                            <div className="health-item">
                                <div className="health-indicator success" />
                                <div>
                                    <div className="font-medium">Storage</div>
                                    <div className="text-sm text-secondary">Supabase Storage ready</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Agencies */}
                <div className="card card-professional">
                    <div className="card-header">
                        <Building size={18} className="text-primary-500" />
                        <span>Recent Agencies</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="table table-professional">
                            <thead>
                                <tr>
                                    <th>Agency</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentAgencies.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center', padding: 'var(--spacing-4)' }}>
                                            <div className="text-secondary">No agencies yet</div>
                                        </td>
                                    </tr>
                                ) : (
                                    recentAgencies.map((agency) => (
                                        <tr key={agency.id}>
                                            <td>
                                                <div className="font-medium">{agency.name}</div>
                                            </td>
                                            <td>
                                                <Badge variant={agency.is_active ? 'success' : 'error'}>
                                                    {agency.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="text-sm text-secondary">
                                                {formatDate(agency.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .health-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-4);
                }
                .health-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }
                .health-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .health-indicator.success {
                    background: var(--status-success);
                }
                .health-indicator.warning {
                    background: var(--status-warning);
                }
                .health-indicator.error {
                    background: var(--status-error);
                }
            `}</style>
        </div>
    );
}
