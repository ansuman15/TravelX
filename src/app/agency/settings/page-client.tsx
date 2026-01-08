'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building,
    User,
    Users,
    Shield,
    Save,
    Plus,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    CreditCard,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { updateAgency, createUser, updateUser, deleteUser } from '@/lib/actions/settings';

interface Agency {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    gst_number: string | null;
    logo_url: string | null;
}

interface UserType {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    created_at: string;
}

interface SettingsPageClientProps {
    agency: Agency | null;
    users: UserType[];
    currentUser: { id: string; role: string };
}

const ROLES = [
    { value: 'agency_admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'agent', label: 'Agent' },
    { value: 'accountant', label: 'Accountant' },
];

export function SettingsPageClient({
    agency,
    users,
    currentUser,
}: SettingsPageClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'agency' | 'users'>('agency');
    const [loading, setLoading] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserType | null>(null);

    // Agency form
    const [agencyForm, setAgencyForm] = useState({
        name: agency?.name || '',
        phone: agency?.phone || '',
        email: agency?.email || '',
        address: agency?.address || '',
        city: agency?.city || '',
        gst_number: agency?.gst_number || '',
    });

    // User form
    const [userForm, setUserForm] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'agent',
        password: '',
    });

    const handleSaveAgency = async () => {
        setLoading(true);
        const result = await updateAgency(agency?.id || '', agencyForm);
        if (result.data) {
            router.refresh();
        }
        setLoading(false);
    };

    const handleUserSubmit = async () => {
        if (!userForm.full_name || !userForm.email) return;

        setLoading(true);

        if (editingUser) {
            const result = await updateUser(editingUser.id, {
                full_name: userForm.full_name,
                phone: userForm.phone || null,
                role: userForm.role,
            });
            if (result.data) {
                setShowUserModal(false);
                resetUserForm();
                router.refresh();
            }
        } else {
            const result = await createUser({
                full_name: userForm.full_name,
                email: userForm.email,
                phone: userForm.phone || null,
                role: userForm.role,
                password: userForm.password,
            });
            if (result.data) {
                setShowUserModal(false);
                resetUserForm();
                router.refresh();
            } else if (result.error) {
                alert(result.error);
            }
        }

        setLoading(false);
    };

    const handleDeleteUser = async () => {
        if (!deletingUser) return;

        setLoading(true);
        const result = await deleteUser(deletingUser.id);
        if (result.data) {
            setShowDeleteDialog(false);
            setDeletingUser(null);
            router.refresh();
        }
        setLoading(false);
    };

    const handleToggleUserStatus = async (user: UserType) => {
        const result = await updateUser(user.id, { is_active: !user.is_active });
        if (result.data) {
            router.refresh();
        }
    };

    const resetUserForm = () => {
        setUserForm({
            full_name: '',
            email: '',
            phone: '',
            role: 'agent',
            password: '',
        });
        setEditingUser(null);
    };

    const openEditUser = (user: UserType) => {
        setEditingUser(user);
        setUserForm({
            full_name: user.full_name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: '',
        });
        setShowUserModal(true);
    };

    const getRoleLabel = (role: string) => {
        return ROLES.find(r => r.value === role)?.label || role;
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-secondary text-sm">Manage your agency settings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs mb-6">
                <button
                    className={`tab ${activeTab === 'agency' ? 'active' : ''}`}
                    onClick={() => setActiveTab('agency')}
                >
                    <Building size={18} />
                    Agency Profile
                </button>
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} />
                    Team Members
                </button>
            </div>

            {/* Agency Settings Tab */}
            {activeTab === 'agency' && (
                <div className="card">
                    <div className="card-header">
                        <Building size={18} />
                        <span>Agency Information</span>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Agency Name *</label>
                                <Input
                                    value={agencyForm.name}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <Input
                                    type="tel"
                                    value={agencyForm.phone}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <Input
                                    type="email"
                                    value={agencyForm.email}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <Input
                                    value={agencyForm.city}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, city: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">GSTIN</label>
                                <Input
                                    value={agencyForm.gst_number}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, gst_number: e.target.value })}
                                    placeholder="22AAAAA0000A1Z5"
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-textarea"
                                    rows={2}
                                    value={agencyForm.address}
                                    onChange={(e) => setAgencyForm({ ...agencyForm, address: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <Button onClick={handleSaveAgency} disabled={loading || !agencyForm.name}>
                                <Save size={16} />
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="card">
                    <div className="card-header flex justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={18} />
                            <span>Team Members</span>
                        </div>
                        <Button onClick={() => { resetUserForm(); setShowUserModal(true); }}>
                            <Plus size={16} />
                            Invite User
                        </Button>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="font-medium">{user.full_name}</div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>{user.phone || '-'}</td>
                                        <td>
                                            <Badge variant={user.role === 'agency_admin' ? 'primary' : 'default'}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge variant={user.is_active ? 'success' : 'error'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openEditUser(user)}>
                                                    <Edit2 size={14} />
                                                </Button>
                                                {user.id !== currentUser.id && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleUserStatus(user)}
                                                        >
                                                            <Shield size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setDeletingUser(user); setShowDeleteDialog(true); }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* User Modal */}
            <Modal
                isOpen={showUserModal}
                onClose={() => setShowUserModal(false)}
                title={editingUser ? 'Edit User' : 'Invite User'}
            >
                <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <Input
                        value={userForm.full_name}
                        onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email *</label>
                    <Input
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        disabled={!!editingUser}
                    />
                </div>
                {!editingUser && (
                    <div className="form-group">
                        <label className="form-label">Temporary Password *</label>
                        <Input
                            type="password"
                            value={userForm.password}
                            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                            placeholder="User will be asked to change"
                        />
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <Input
                        type="tel"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Role *</label>
                    <Select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    >
                        {ROLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </Select>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowUserModal(false)}>Cancel</Button>
                    <Button
                        onClick={handleUserSubmit}
                        disabled={loading || !userForm.full_name || !userForm.email || (!editingUser && !userForm.password)}
                    >
                        {loading ? 'Saving...' : editingUser ? 'Update' : 'Invite User'}
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete "${deletingUser?.full_name}"? They will lose access immediately.`}
                confirmText="Delete"
                variant="danger"
            />

            <style jsx>{`
                .tabs {
                    display: flex;
                    gap: var(--spacing-2);
                    border-bottom: 1px solid var(--border-light);
                    padding-bottom: var(--spacing-2);
                }
                .tab {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-2) var(--spacing-4);
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: var(--text-secondary);
                    border-radius: var(--radius-lg);
                    transition: all 0.2s;
                }
                .tab:hover {
                    background: var(--bg-tertiary);
                }
                .tab.active {
                    background: var(--primary-50);
                    color: var(--primary-600);
                    font-weight: var(--weight-medium);
                }
            `}</style>
        </div>
    );
}
