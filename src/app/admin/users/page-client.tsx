'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    User,
    Users,
    Shield,
    Building,
    Power,
    PowerOff,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { Badge, Button, Select } from '@/components/ui';
import { updatePlatformUser } from '@/lib/actions/admin';

interface UserType {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
    agency: {
        id: string;
        name: string;
    } | null;
}

interface UsersPageClientProps {
    users: UserType[];
}

const ROLES = [
    { value: 'super_admin', label: 'Super Admin', color: 'primary' },
    { value: 'agency_admin', label: 'Agency Admin', color: 'warning' },
    { value: 'manager', label: 'Manager', color: 'success' },
    { value: 'agent', label: 'Agent', color: 'default' },
    { value: 'accountant', label: 'Accountant', color: 'default' },
];

export function UsersPageClient({ users }: UsersPageClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            user.full_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.agency?.name.toLowerCase().includes(query);

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && user.is_active) ||
            (statusFilter === 'inactive' && !user.is_active) ||
            (statusFilter === 'pending' && !user.is_active && user.role !== 'super_admin');

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleToggleStatus = async (user: UserType) => {
        const result = await updatePlatformUser(user.id, { is_active: !user.is_active });
        if (result.data) {
            router.refresh();
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        const result = await updatePlatformUser(userId, { role: newRole });
        if (result.data) {
            router.refresh();
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getRoleBadge = (role: string) => {
        const roleInfo = ROLES.find(r => r.value === role);
        return (
            <Badge variant={roleInfo?.color as 'primary' | 'warning' | 'success' | 'default' || 'default'}>
                {roleInfo?.label || role}
            </Badge>
        );
    };

    // Stats
    const superAdmins = users.filter(u => u.role === 'super_admin').length;
    const agencyAdmins = users.filter(u => u.role === 'agency_admin').length;
    const activeUsers = users.filter(u => u.is_active).length;
    const pendingUsers = users.filter(u => !u.is_active && u.role !== 'super_admin').length;

    // Handle approve user
    const handleApprove = async (user: UserType) => {
        const result = await updatePlatformUser(user.id, { is_active: true });
        if (result.data) {
            router.refresh();
        }
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Users</h1>
                    <p className="text-secondary text-sm">Manage all users across agencies</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <div className="text-sm text-secondary">Total Users</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-primary-600">{superAdmins}</div>
                        <div className="text-sm text-secondary">Super Admins</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-warning-600">{agencyAdmins}</div>
                        <div className="text-sm text-secondary">Agency Admins</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-success-600">{activeUsers}</div>
                        <div className="text-sm text-secondary">Active Users</div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: pendingUsers > 0 ? '3px solid var(--warning-500)' : undefined }}>
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-warning-600">{pendingUsers}</div>
                        <div className="text-sm text-secondary">Pending Approval</div>
                    </div>
                </div>
            </div>

            {/* Pending Approvals Alert */}
            {pendingUsers > 0 && (
                <div className="pending-alert mb-6">
                    <div className="flex items-center gap-3">
                        <Clock size={20} className="text-warning-600" />
                        <div>
                            <div className="font-semibold">{pendingUsers} user{pendingUsers > 1 ? 's' : ''} awaiting approval</div>
                            <div className="text-sm text-secondary">New agency signups require your approval before they can access the platform.</div>
                        </div>
                    </div>
                </div>
            )}

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
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Roles</option>
                            {ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </Select>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '180px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">⏳ Pending Approval</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Agency</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">No users found.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="user-avatar">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{user.full_name}</div>
                                                    <div className="text-xs text-secondary">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {user.agency ? (
                                                <div className="flex items-center gap-2">
                                                    <Building size={14} className="text-secondary" />
                                                    <span>{user.agency.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-secondary">-</span>
                                            )}
                                        </td>
                                        <td>{getRoleBadge(user.role)}</td>
                                        <td>
                                            <Badge variant={user.is_active ? 'success' : 'error'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-sm text-secondary">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {!user.is_active && user.role !== 'super_admin' ? (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleApprove(user)}
                                                        title="Approve User"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(user)}
                                                        title={user.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                                    </Button>
                                                )}
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
                .user-avatar {
                    width: 40px;
                    height: 40px;
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pending-alert {
                    background: var(--warning-50);
                    border: 1px solid var(--warning-200);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-4);
                }
            `}</style>
        </div>
    );
}
