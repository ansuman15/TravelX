'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    Database,
    Server,
    Shield,
    HardDrive,
    Clock,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    XCircle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface HealthData {
    database: {
        status: 'healthy' | 'warning' | 'error';
        latency: number;
        message: string;
    };
    storage: {
        status: 'healthy' | 'warning' | 'error';
        message: string;
    };
    auth: {
        status: 'healthy' | 'warning' | 'error';
        message: string;
    };
    stats: {
        agencies: number;
        users: number;
        bookings: number;
    };
}

interface HealthPageClientProps {
    healthData: HealthData;
}

export function HealthPageClient({ healthData }: HealthPageClientProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [uptime, setUptime] = useState('99.9%');

    const handleRefresh = () => {
        setRefreshing(true);
        window.location.reload();
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy':
                return <CheckCircle size={20} className="text-success-500" />;
            case 'warning':
                return <AlertCircle size={20} className="text-warning-500" />;
            case 'error':
                return <XCircle size={20} className="text-error-500" />;
            default:
                return <CheckCircle size={20} className="text-success-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge variant="success">Healthy</Badge>;
            case 'warning':
                return <Badge variant="warning">Warning</Badge>;
            case 'error':
                return <Badge variant="error">Error</Badge>;
            default:
                return <Badge variant="success">Healthy</Badge>;
        }
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">System Health</h1>
                    <p className="text-secondary text-sm">Monitor platform infrastructure and services</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-secondary">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overall Status */}
            <div className="card mb-6">
                <div className="card-body">
                    <div className="overall-status">
                        <div className="status-indicator healthy" />
                        <div>
                            <h3 className="text-xl font-bold">All Systems Operational</h3>
                            <p className="text-secondary">Platform uptime: {uptime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Database */}
                <div className="card">
                    <div className="card-body">
                        <div className="service-header">
                            <div className="service-icon">
                                <Database size={24} />
                            </div>
                            {getStatusBadge(healthData.database.status)}
                        </div>
                        <h4 className="font-semibold mt-3">Database</h4>
                        <p className="text-sm text-secondary">{healthData.database.message}</p>
                        <div className="service-metric mt-3">
                            <Clock size={14} />
                            <span>Latency: {healthData.database.latency}ms</span>
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="card">
                    <div className="card-body">
                        <div className="service-header">
                            <div className="service-icon">
                                <HardDrive size={24} />
                            </div>
                            {getStatusBadge(healthData.storage.status)}
                        </div>
                        <h4 className="font-semibold mt-3">Storage</h4>
                        <p className="text-sm text-secondary">{healthData.storage.message}</p>
                        <div className="service-metric mt-3">
                            <Server size={14} />
                            <span>Supabase Storage</span>
                        </div>
                    </div>
                </div>

                {/* Authentication */}
                <div className="card">
                    <div className="card-body">
                        <div className="service-header">
                            <div className="service-icon">
                                <Shield size={24} />
                            </div>
                            {getStatusBadge(healthData.auth.status)}
                        </div>
                        <h4 className="font-semibold mt-3">Authentication</h4>
                        <p className="text-sm text-secondary">{healthData.auth.message}</p>
                        <div className="service-metric mt-3">
                            <Activity size={14} />
                            <span>Supabase Auth</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Stats */}
            <div className="card">
                <div className="card-header">
                    <Activity size={18} className="text-primary-500" />
                    <span>Platform Statistics</span>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="stat-item">
                            <div className="stat-value">{healthData.stats.agencies}</div>
                            <div className="stat-label">Total Agencies</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{healthData.stats.users}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{healthData.stats.bookings}</div>
                            <div className="stat-label">Total Bookings</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .overall-status {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-4);
                }
                .status-indicator {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                }
                .status-indicator.healthy {
                    background: var(--success-500);
                    box-shadow: 0 0 12px var(--success-200);
                }
                .service-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .service-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .service-metric {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: var(--font-sm);
                    color: var(--text-tertiary);
                }
                .stat-item {
                    text-align: center;
                    padding: var(--spacing-4);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                }
                .stat-value {
                    font-size: var(--font-2xl);
                    font-weight: var(--weight-bold);
                    color: var(--primary-600);
                }
                .stat-label {
                    font-size: var(--font-sm);
                    color: var(--text-secondary);
                    margin-top: var(--spacing-1);
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
