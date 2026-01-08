'use client';

import { useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Calendar,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart,
    Download,
    FileText,
    FileSpreadsheet,
    User,
    Truck,
} from 'lucide-react';
import { Badge, Button, Select } from '@/components/ui';

interface Stats {
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
    totalBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    pendingAmount: number;
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    totalCustomers: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface StaffStats {
    id: string;
    name: string;
    role: string;
    leads: number;
    converted: number;
    conversionRate: number;
    bookings: number;
    revenue: number;
}

interface SupplierMargin {
    id: string;
    name: string;
    category: string;
    totalCost: number;
    totalSell: number;
    margin: number;
    transactions: number;
}

interface ReportsPageClientProps {
    stats: Stats;
    leadsBySource: Record<string, number>;
    bookingsByDestination: Record<string, number>;
    revenueByDestination: Record<string, number>;
    monthlyRevenue: MonthlyRevenue[];
    paymentModes: Record<string, number>;
    staffStats: StaffStats[];
    supplierMargins: SupplierMargin[];
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export function ReportsPageClient({
    stats,
    leadsBySource,
    bookingsByDestination,
    revenueByDestination,
    monthlyRevenue,
    paymentModes,
    staffStats,
    supplierMargins,
}: ReportsPageClientProps) {
    const [dateRange, setDateRange] = useState('this_month');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportRevenueCSV = () => {
        exportToCSV(monthlyRevenue.map(m => ({ Month: m.month, Revenue: m.revenue })), 'revenue_trend');
    };

    const exportLeadsCSV = () => {
        exportToCSV(Object.entries(leadsBySource).map(([source, count]) => ({ Source: source, Leads: count })), 'leads_by_source');
    };

    const exportBookingsCSV = () => {
        exportToCSV(Object.entries(bookingsByDestination).map(([dest, count]) => ({ Destination: dest, Bookings: count })), 'bookings_by_destination');
    };

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);
    const totalSourceLeads = Object.values(leadsBySource).reduce((a, b) => a + b, 0) || 1;
    const totalDestBookings = Object.values(bookingsByDestination).reduce((a, b) => a + b, 0) || 1;
    const totalPaymentModes = Object.values(paymentModes).reduce((a, b) => a + b, 0) || 1;

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Reports & Analytics</h1>
                    <p className="text-secondary text-sm">Business performance insights</p>
                </div>
                <div className="flex gap-3">
                    <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ width: '150px' }}>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                        <option value="last_month">Last Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                    </Select>
                    <Button variant="outline" onClick={exportRevenueCSV}>
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">This Month Revenue</div>
                                <div className="text-2xl font-bold">{formatCurrency(stats.thisMonthRevenue)}</div>
                            </div>
                            <div className={`stat-badge ${stats.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                                {stats.revenueGrowth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {Math.abs(stats.revenueGrowth).toFixed(1)}%
                            </div>
                        </div>
                        <div className="text-xs text-secondary mt-2">
                            vs {formatCurrency(stats.lastMonthRevenue)} last month
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Total Revenue</div>
                                <div className="text-2xl font-bold text-success-600">{formatCurrency(stats.totalRevenue)}</div>
                            </div>
                            <DollarSign className="text-success-500" size={24} />
                        </div>
                        <div className="text-xs text-secondary mt-2">
                            {formatCurrency(stats.pendingAmount)} pending
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Bookings</div>
                                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                            </div>
                            <Calendar className="text-primary-500" size={24} />
                        </div>
                        <div className="text-xs text-secondary mt-2">
                            {stats.confirmedBookings} confirmed
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm text-secondary mb-1">Lead Conversion</div>
                                <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
                            </div>
                            <Target className="text-warning-500" size={24} />
                        </div>
                        <div className="text-xs text-secondary mt-2">
                            {stats.convertedLeads} of {stats.totalLeads} leads
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Revenue Trend */}
                <div className="card">
                    <div className="card-header">
                        <BarChart3 size={18} className="text-primary-500" />
                        <span>Revenue Trend (Last 6 Months)</span>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            {monthlyRevenue.map((m, i) => (
                                <div key={m.month} className="chart-bar-group">
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${(m.revenue / maxRevenue) * 100}%`,
                                            background: i === monthlyRevenue.length - 1 ? 'var(--primary-500)' : 'var(--primary-200)',
                                        }}
                                    />
                                    <div className="chart-label">{m.month}</div>
                                    <div className="chart-value">{formatCurrency(m.revenue)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Leads by Source */}
                <div className="card">
                    <div className="card-header">
                        <PieChart size={18} className="text-primary-500" />
                        <span>Leads by Source</span>
                    </div>
                    <div className="card-body">
                        <div className="breakdown-list">
                            {Object.entries(leadsBySource).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([source, count], i) => (
                                <div key={source} className="breakdown-item">
                                    <div className="breakdown-label">
                                        <div className="color-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="capitalize">{source}</span>
                                    </div>
                                    <div className="breakdown-value">
                                        <span className="font-medium">{count}</span>
                                        <span className="text-secondary text-sm">
                                            ({((count / totalSourceLeads) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-bar-fill"
                                            style={{
                                                width: `${(count / totalSourceLeads) * 100}%`,
                                                background: COLORS[i % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* More Stats Row */}
            <div className="grid grid-cols-2 gap-6">
                {/* Top Destinations */}
                <div className="card">
                    <div className="card-header">
                        <TrendingUp size={18} className="text-primary-500" />
                        <span>Top Destinations</span>
                    </div>
                    <div className="card-body">
                        <div className="breakdown-list">
                            {Object.entries(bookingsByDestination).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([dest, count], i) => (
                                <div key={dest} className="breakdown-item">
                                    <div className="breakdown-label">
                                        <span>{dest}</span>
                                    </div>
                                    <div className="breakdown-value">
                                        <span className="font-medium">{count} bookings</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-bar-fill"
                                            style={{
                                                width: `${(count / totalDestBookings) * 100}%`,
                                                background: COLORS[i % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Payment Modes */}
                <div className="card">
                    <div className="card-header">
                        <DollarSign size={18} className="text-primary-500" />
                        <span>Payment Modes (This Month)</span>
                    </div>
                    <div className="card-body">
                        <div className="breakdown-list">
                            {Object.entries(paymentModes).sort((a, b) => b[1] - a[1]).map(([mode, amount], i) => (
                                <div key={mode} className="breakdown-item">
                                    <div className="breakdown-label">
                                        <div className="color-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span className="capitalize">{mode.replace('_', ' ')}</span>
                                    </div>
                                    <div className="breakdown-value">
                                        <span className="font-medium">{formatCurrency(amount)}</span>
                                        <span className="text-secondary text-sm">
                                            ({((amount / totalPaymentModes) * 100).toFixed(0)}%)
                                        </span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-bar-fill"
                                            style={{
                                                width: `${(amount / totalPaymentModes) * 100}%`,
                                                background: COLORS[i % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Staff Productivity & Revenue by Destination */}
            <div className="grid grid-cols-2 gap-6 mt-6">
                {/* Staff Productivity */}
                <div className="card">
                    <div className="card-header">
                        <User size={18} className="text-primary-500" />
                        <span>Staff Productivity</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {staffStats.length === 0 ? (
                            <div className="text-center text-secondary py-8">No staff data available</div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Staff</th>
                                        <th>Leads</th>
                                        <th>Conv. Rate</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffStats.slice(0, 5).map((staff) => (
                                        <tr key={staff.id}>
                                            <td>
                                                <div className="font-medium">{staff.name}</div>
                                                <div className="text-xs text-secondary capitalize">{staff.role.replace('_', ' ')}</div>
                                            </td>
                                            <td>{staff.leads}</td>
                                            <td>
                                                <Badge variant={staff.conversionRate >= 30 ? 'success' : staff.conversionRate >= 15 ? 'warning' : 'default'}>
                                                    {staff.conversionRate.toFixed(0)}%
                                                </Badge>
                                            </td>
                                            <td className="font-medium">{formatCurrency(staff.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Revenue by Destination */}
                <div className="card">
                    <div className="card-header">
                        <DollarSign size={18} className="text-primary-500" />
                        <span>Revenue by Destination</span>
                    </div>
                    <div className="card-body">
                        <div className="breakdown-list">
                            {Object.entries(revenueByDestination).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([dest, revenue], i) => (
                                <div key={dest} className="breakdown-item">
                                    <div className="breakdown-label">
                                        <div className="color-dot" style={{ background: COLORS[i % COLORS.length] }} />
                                        <span>{dest}</span>
                                    </div>
                                    <div className="breakdown-value">
                                        <span className="font-medium">{formatCurrency(revenue)}</span>
                                    </div>
                                    <div className="breakdown-bar">
                                        <div
                                            className="breakdown-bar-fill"
                                            style={{
                                                width: `${(revenue / (Object.values(revenueByDestination).reduce((a, b) => a + b, 0) || 1)) * 100}%`,
                                                background: COLORS[i % COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Supplier Margins */}
            {supplierMargins.length > 0 && (
                <div className="card mt-6">
                    <div className="card-header">
                        <Truck size={18} className="text-primary-500" />
                        <span>Supplier Margins</span>
                        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => exportToCSV(
                            supplierMargins.map(s => ({ Name: s.name, Category: s.category, Revenue: s.totalSell, Cost: s.totalCost, Margin: s.margin.toFixed(1) + '%' })),
                            'supplier_margins'
                        )}>
                            <Download size={14} />
                            Export
                        </Button>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Supplier</th>
                                    <th>Category</th>
                                    <th>Revenue</th>
                                    <th>Cost</th>
                                    <th>Margin</th>
                                    <th>Transactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplierMargins.slice(0, 10).map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td className="font-medium">{supplier.name}</td>
                                        <td className="capitalize">{supplier.category}</td>
                                        <td>{formatCurrency(supplier.totalSell)}</td>
                                        <td>{formatCurrency(supplier.totalCost)}</td>
                                        <td>
                                            <Badge variant={supplier.margin >= 20 ? 'success' : supplier.margin >= 10 ? 'warning' : 'error'}>
                                                {supplier.margin.toFixed(1)}%
                                            </Badge>
                                        </td>
                                        <td>{supplier.transactions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style jsx>{`
                .stat-badge {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    padding: 4px 8px;
                    border-radius: var(--radius-full);
                    font-size: var(--font-xs);
                    font-weight: var(--weight-medium);
                }
                .stat-badge.positive {
                    background: var(--success-50);
                    color: var(--success-600);
                }
                .stat-badge.negative {
                    background: var(--error-50);
                    color: var(--error-600);
                }
                .chart-container {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    height: 200px;
                    gap: var(--spacing-3);
                    padding-top: var(--spacing-4);
                }
                .chart-bar-group {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    height: 100%;
                }
                .chart-bar {
                    width: 100%;
                    border-radius: var(--radius-md) var(--radius-md) 0 0;
                    transition: all 0.3s;
                    min-height: 4px;
                }
                .chart-bar:hover {
                    opacity: 0.8;
                }
                .chart-label {
                    font-size: var(--font-xs);
                    color: var(--text-secondary);
                    margin-top: var(--spacing-2);
                }
                .chart-value {
                    font-size: var(--font-xs);
                    font-weight: var(--weight-medium);
                    display: none;
                }
                .chart-bar-group:hover .chart-value {
                    display: block;
                }
                .breakdown-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }
                .breakdown-item {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: var(--spacing-2);
                    align-items: center;
                }
                .breakdown-label {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                .color-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                .breakdown-value {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    text-align: right;
                }
                .breakdown-bar {
                    grid-column: span 2;
                    height: 6px;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }
                .breakdown-bar-fill {
                    height: 100%;
                    border-radius: var(--radius-full);
                    transition: width 0.3s;
                }
            `}</style>
        </div>
    );
}
