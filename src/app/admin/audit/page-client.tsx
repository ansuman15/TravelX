'use client';

import { useState } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    User,
    Calendar,
    Activity,
    LogIn,
    Edit,
    Trash2,
    CreditCard,
    Plus,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/ui';

interface AuditLog {
    id: string;
    entity: string;
    entity_id: string;
    action: string;
    old_data: Record<string, unknown> | null;
    new_data: Record<string, unknown> | null;
    changes: Record<string, unknown> | null;
    performed_by: string | null;
    ip_address: string | null;
    created_at: string;
    user?: {
        id: string;
        full_name: string;
        email: string;
    };
}

interface AuditPageClientProps {
    logs: AuditLog[];
}

export function AuditPageClient({ logs }: AuditPageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create':
                return <Plus size={14} className="text-success-500" />;
            case 'update':
                return <Edit size={14} className="text-warning-500" />;
            case 'delete':
                return <Trash2 size={14} className="text-error-500" />;
            case 'login':
                return <LogIn size={14} className="text-primary-500" />;
            case 'payment':
                return <CreditCard size={14} className="text-success-500" />;
            default:
                return <Activity size={14} className="text-secondary" />;
        }
    };

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'create':
                return <Badge variant="success">Create</Badge>;
            case 'update':
                return <Badge variant="warning">Update</Badge>;
            case 'delete':
                return <Badge variant="error">Delete</Badge>;
            case 'login':
                return <Badge variant="primary">Login</Badge>;
            case 'payment':
                return <Badge variant="success">Payment</Badge>;
            case 'status_change':
                return <Badge variant="secondary">Status Change</Badge>;
            default:
                return <Badge variant="secondary">{action}</Badge>;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesEntity = entityFilter === 'all' || log.entity === entityFilter;

        return matchesSearch && matchesAction && matchesEntity;
    });

    const uniqueEntities = [...new Set(logs.map((l) => l.entity))];
    const uniqueActions = [...new Set(logs.map((l) => l.action))];

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Audit Logs</h1>
                    <p className="text-secondary text-sm">Track all platform activity and changes</p>
                </div>
                <Button variant="secondary">
                    <Download size={18} />
                    Export CSV
                </Button>
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
                                    placeholder="Search by entity, user..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Actions</option>
                            {uniqueActions.map((action) => (
                                <option key={action} value={action}>
                                    {action.charAt(0).toUpperCase() + action.slice(1)}
                                </option>
                            ))}
                        </Select>
                        <Select
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Entities</option>
                            {uniqueEntities.map((entity) => (
                                <option key={entity} value={entity}>
                                    {entity.charAt(0).toUpperCase() + entity.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity</th>
                                <th>Details</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="empty-state">
                                            <FileText size={48} className="text-tertiary" />
                                            <p className="text-secondary mt-2">No audit logs found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <div className="text-sm">{formatDate(log.created_at)}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="user-avatar">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {log.user?.full_name || 'System'}
                                                    </div>
                                                    <div className="text-xs text-secondary">
                                                        {log.user?.email || ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getActionBadge(log.action)}</td>
                                        <td>
                                            <span className="entity-badge">
                                                {log.entity}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-sm text-secondary truncate" style={{ maxWidth: '200px' }}>
                                                {log.entity_id ? `ID: ${log.entity_id.substring(0, 8)}...` : '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sm text-tertiary">
                                                {log.ip_address || '-'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                .user-avatar {
                    width: 28px;
                    height: 28px;
                    background: var(--bg-tertiary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                }
                .entity-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    background: var(--bg-secondary);
                    border-radius: var(--radius-md);
                    font-size: var(--font-xs);
                    text-transform: capitalize;
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--spacing-8);
                }
            `}</style>
        </div>
    );
}
