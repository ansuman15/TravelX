'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    Shield,
    UserCheck,
    UserX,
} from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';

interface StaffMember {
    id: string;
    email: string;
    full_name: string;
    role: string;
    staff_role: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

interface StaffPageClientProps {
    staffMembers: StaffMember[];
    currentUserId: string;
    isAdmin: boolean;
}

export function StaffPageClient({ staffMembers, currentUserId, isAdmin }: StaffPageClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [inviteData, setInviteData] = useState({
        email: '',
        name: '',
        role: 'agency_staff',
        staffRole: '',
    });

    const filteredStaff = staffMembers.filter(staff => {
        const matchesSearch =
            staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'agency_admin':
                return <Badge variant="primary">Admin</Badge>;
            case 'agency_staff':
                return <Badge variant="gray">Staff</Badge>;
            default:
                return <Badge variant="gray">{role}</Badge>;
        }
    };

    const handleInvite = async () => {
        if (!inviteData.email) return;
        setLoading(true);
        // TODO: Implement staff invitation API
        // For now, just close the modal
        setTimeout(() => {
            setShowInviteModal(false);
            setInviteData({ email: '', name: '', role: 'agency_staff', staffRole: '' });
            setLoading(false);
        }, 1000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const activeCount = staffMembers.filter(s => s.is_active).length;

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Team Management</h1>
                    <p className="text-secondary text-sm">Manage your agency staff members</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => setShowInviteModal(true)}>
                        <Plus size={18} />
                        Invite Staff
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{staffMembers.length}</div>
                                <div className="text-sm text-secondary">Total Members</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon success">
                                <UserCheck size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{activeCount}</div>
                                <div className="text-sm text-secondary">Active</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon warning">
                                <Shield size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">
                                    {staffMembers.filter(s => s.role === 'agency_admin').length}
                                </div>
                                <div className="text-sm text-secondary">Admins</div>
                            </div>
                        </div>
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
                                    placeholder="Search staff..."
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
                            <option value="agency_admin">Admins</option>
                            <option value="agency_staff">Staff</option>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Staff Grid */}
            <div className="staff-grid">
                {filteredStaff.length === 0 ? (
                    <div className="card empty-state">
                        <Users size={48} className="text-tertiary" />
                        <p>No staff members found</p>
                    </div>
                ) : (
                    filteredStaff.map((staff) => (
                        <div key={staff.id} className="staff-card">
                            <div className="staff-avatar">
                                {staff.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="staff-info">
                                <h3 className="staff-name">
                                    {staff.full_name}
                                    {staff.id === currentUserId && (
                                        <span className="you-badge">You</span>
                                    )}
                                </h3>
                                <p className="staff-email">{staff.email}</p>
                                {staff.staff_role && (
                                    <p className="staff-position">{staff.staff_role}</p>
                                )}
                                <div className="staff-meta">
                                    {getRoleBadge(staff.role)}
                                    <Badge variant={staff.is_active ? 'success' : 'error'}>
                                        {staff.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <div className="staff-joined">
                                Joined {formatDate(staff.created_at)}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Invite Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                title="Invite Team Member"
            >
                <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <Input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        placeholder="colleague@example.com"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <Input
                        value={inviteData.name}
                        onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                        placeholder="John Doe"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Role</label>
                        <Select
                            value={inviteData.role}
                            onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                        >
                            <option value="agency_staff">Staff</option>
                            <option value="agency_admin">Admin</option>
                        </Select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Position</label>
                        <Input
                            value={inviteData.staffRole}
                            onChange={(e) => setInviteData({ ...inviteData, staffRole: e.target.value })}
                            placeholder="Sales Executive"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                    <Button onClick={handleInvite} disabled={loading || !inviteData.email}>
                        {loading ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </div>
            </Modal>

            <style jsx>{`
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-icon.success {
                    background: var(--success-50);
                    color: var(--success-600);
                }
                .stat-icon.warning {
                    background: var(--warning-50);
                    color: var(--warning-600);
                }
                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-4);
                }
                .staff-card {
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-4);
                    display: flex;
                    gap: var(--spacing-3);
                    transition: all 0.2s ease;
                }
                .staff-card:hover {
                    border-color: var(--primary-200);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .staff-avatar {
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    font-weight: 600;
                    flex-shrink: 0;
                }
                .staff-info {
                    flex: 1;
                    min-width: 0;
                }
                .staff-name {
                    font-weight: 600;
                    font-size: 15px;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                .you-badge {
                    font-size: 11px;
                    background: var(--primary-100);
                    color: var(--primary-700);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 500;
                }
                .staff-email {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 2px 0;
                }
                .staff-position {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin: 2px 0 8px;
                }
                .staff-meta {
                    display: flex;
                    gap: var(--spacing-2);
                }
                .staff-joined {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    white-space: nowrap;
                }
                .empty-state {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-8);
                    gap: var(--spacing-3);
                    color: var(--text-tertiary);
                }
            `}</style>
        </div>
    );
}
