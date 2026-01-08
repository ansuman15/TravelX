'use client';

import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Building,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Badge } from '@/components/ui';

interface RevenueData {
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    growthPercentage: number | string;
    revenueByAgency: {
        id: string;
        name: string;
        is_active: boolean;
        revenue: number;
    }[];
}

interface RevenuePageClientProps {
    revenueData: RevenueData;
}

export function RevenuePageClient({ revenueData }: RevenuePageClientProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const isPositiveGrowth = Number(revenueData.growthPercentage) >= 0;

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Revenue</h1>
                    <p className="text-secondary text-sm">Track revenue across all agencies</p>
                </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Revenue</div>
                                <div className="text-3xl font-bold">{formatCurrency(revenueData.totalRevenue)}</div>
                                <div className="text-xs text-success-600 mt-1">All time</div>
                            </div>
                            <div className="stat-icon bg-success-50 text-success-600">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">This Month</div>
                                <div className="text-3xl font-bold">{formatCurrency(revenueData.thisMonthRevenue)}</div>
                                <div className={`text-xs mt-1 flex items-center gap-1 ${isPositiveGrowth ? 'text-success-600' : 'text-error-600'}`}>
                                    {isPositiveGrowth ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {revenueData.growthPercentage}% vs last month
                                </div>
                            </div>
                            <div className="stat-icon bg-primary-50 text-primary-600">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Last Month</div>
                                <div className="text-3xl font-bold">{formatCurrency(revenueData.lastMonthRevenue)}</div>
                                <div className="text-xs text-secondary mt-1">Previous period</div>
                            </div>
                            <div className="stat-icon bg-secondary-50 text-secondary-600">
                                <DollarSign size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Active Agencies</div>
                                <div className="text-3xl font-bold">
                                    {revenueData.revenueByAgency.filter(a => a.is_active).length}
                                </div>
                                <div className="text-xs text-secondary mt-1">Contributing agencies</div>
                            </div>
                            <div className="stat-icon bg-warning-50 text-warning-600">
                                <Building size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue by Agency */}
            <div className="card">
                <div className="card-header">
                    <Building size={18} className="text-primary-500" />
                    <span>Revenue by Agency</span>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Agency</th>
                                <th>Status</th>
                                <th>Revenue</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenueData.revenueByAgency.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <p className="text-secondary">No revenue data available</p>
                                    </td>
                                </tr>
                            ) : (
                                revenueData.revenueByAgency.map((agency, index) => (
                                    <tr key={agency.id}>
                                        <td>
                                            <span className={`rank ${index < 3 ? 'top' : ''}`}>
                                                #{index + 1}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="font-medium">{agency.name}</div>
                                        </td>
                                        <td>
                                            <Badge variant={agency.is_active ? 'success' : 'error'}>
                                                {agency.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="font-semibold">
                                            {formatCurrency(agency.revenue)}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${revenueData.totalRevenue > 0
                                                                ? (agency.revenue / revenueData.totalRevenue * 100)
                                                                : 0}%`
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-secondary">
                                                    {revenueData.totalRevenue > 0
                                                        ? (agency.revenue / revenueData.totalRevenue * 100).toFixed(1)
                                                        : 0}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                .rank {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    font-size: var(--font-sm);
                    font-weight: var(--weight-medium);
                }
                .rank.top {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }
                .progress-bar {
                    width: 100px;
                    height: 6px;
                    background: var(--bg-tertiary);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-fill {
                    height: 100%;
                    background: var(--primary-500);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
}
