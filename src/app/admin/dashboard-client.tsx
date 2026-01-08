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
} from 'lucide-react';
import { Badge } from '@/components/ui';

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
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Overview</h1>
                    <p className="text-secondary text-sm">TravelX Admin Dashboard</p>
                </div>
                <Badge variant="primary">Super Admin</Badge>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Agencies</div>
                                <div className="text-3xl font-bold">{stats.totalAgencies}</div>
                                <div className="text-xs text-success-600 mt-1">
                                    +{stats.newAgenciesThisMonth} this month
                                </div>
                            </div>
                            <div className="stat-icon bg-primary-50 text-primary-600">
                                <Building size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Users</div>
                                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                                <div className="text-xs text-success-600 mt-1">
                                    +{stats.newUsersThisMonth} this month
                                </div>
                            </div>
                            <div className="stat-icon bg-success-50 text-success-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Bookings</div>
                                <div className="text-3xl font-bold">{stats.totalBookings}</div>
                                <div className="text-xs text-success-600 mt-1">
                                    +{stats.bookingsThisMonth} this month
                                </div>
                            </div>
                            <div className="stat-icon bg-warning-50 text-warning-600">
                                <Briefcase size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Revenue</div>
                                <div className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                                <div className="text-xs text-success-600 mt-1">
                                    +{formatCurrency(stats.revenueThisMonth)} this month
                                </div>
                            </div>
                            <div className="stat-icon bg-error-50 text-error-600">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity & Agencies */}
            <div className="grid grid-cols-2 gap-6">
                {/* Platform Health */}
                <div className="card">
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
                <div className="card">
                    <div className="card-header">
                        <Building size={18} className="text-primary-500" />
                        <span>Recent Agencies</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="table">
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
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
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
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }
                .health-indicator.success {
                    background: var(--success-500);
                    box-shadow: 0 0 8px var(--success-200);
                }
                .health-indicator.warning {
                    background: var(--warning-500);
                    box-shadow: 0 0 8px var(--warning-200);
                }
                .health-indicator.error {
                    background: var(--error-500);
                    box-shadow: 0 0 8px var(--error-200);
                }
            `}</style>
        </div>
    );
}
