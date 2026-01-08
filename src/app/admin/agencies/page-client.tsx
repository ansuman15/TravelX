'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Building,
    Users,
    Power,
    PowerOff,
    Copy,
    Check,
    Key,
    Mail,
    User,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { createAgency, updateAgency, deleteAgency, toggleAgencyStatus } from '@/lib/actions/admin';

interface Agency {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    gst_number: string | null;
    is_active: boolean;
    created_at: string;
    user_count: number;
}

interface Credentials {
    email: string;
    password: string;
    message: string;
}

interface AgenciesPageClientProps {
    agencies: Agency[];
}

export function AgenciesPageClient({ agencies }: AgenciesPageClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
    const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<Credentials | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        gst_number: '',
        adminName: '',
        adminEmail: '',
    });

    const filteredAgencies = agencies.filter(agency => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            agency.name.toLowerCase().includes(query) ||
            agency.city?.toLowerCase().includes(query) ||
            agency.email?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && agency.is_active) ||
            (statusFilter === 'inactive' && !agency.is_active);

        return matchesSearch && matchesStatus;
    });

    const handleSubmit = async () => {
        if (!formData.name) return;
        setError(null);
        setLoading(true);

        if (editingAgency) {
            const result = await updateAgency(editingAgency.id, {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                gst_number: formData.gst_number,
            });
            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setShowModal(false);
                resetForm();
                router.refresh();
            }
        } else {
            // For new agency, require admin email
            if (!formData.adminEmail) {
                setError('Admin email is required for new agency');
                setLoading(false);
                return;
            }

            const result = await createAgency({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                gst_number: formData.gst_number,
                adminName: formData.adminName,
                adminEmail: formData.adminEmail,
            });

            if (result.error) {
                setError(result.error);
            } else if (result.data && result.credentials) {
                setCredentials(result.credentials);
                setShowModal(false);
                setShowCredentialsModal(true);
                resetForm();
                router.refresh();
            }
        }

        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deletingAgency) return;

        setLoading(true);
        const result = await deleteAgency(deletingAgency.id);
        if (result.data) {
            setShowDeleteDialog(false);
            setDeletingAgency(null);
            router.refresh();
        }
        setLoading(false);
    };

    const handleToggleStatus = async (agency: Agency) => {
        const result = await toggleAgencyStatus(agency.id, !agency.is_active);
        if (result.data) {
            router.refresh();
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            gst_number: '',
            adminName: '',
            adminEmail: '',
        });
        setEditingAgency(null);
        setError(null);
    };

    const openEditModal = (agency: Agency) => {
        setEditingAgency(agency);
        setFormData({
            name: agency.name,
            phone: agency.phone || '',
            email: agency.email || '',
            address: agency.address || '',
            city: agency.city || '',
            gst_number: agency.gst_number || '',
            adminName: '',
            adminEmail: '',
        });
        setShowModal(true);
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Stats
    const activeCount = agencies.filter(a => a.is_active).length;
    const inactiveCount = agencies.filter(a => !a.is_active).length;
    const totalUsers = agencies.reduce((sum, a) => sum + a.user_count, 0);

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Agency Management</h1>
                    <p className="text-secondary text-sm">Manage all travel agencies on the platform</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} />
                    Add Agency
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{agencies.length}</div>
                        <div className="text-sm text-secondary">Total Agencies</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-success-600">{activeCount}</div>
                        <div className="text-sm text-secondary">Active</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-error-600">{inactiveCount}</div>
                        <div className="text-sm text-secondary">Inactive</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <div className="text-sm text-secondary">Total Users</div>
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
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Users</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAgencies.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">No agencies found.</div>
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
                                                    {agency.gst_number && (
                                                        <div className="text-xs text-secondary">GST: {agency.gst_number}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm">{agency.email || '-'}</div>
                                            <div className="text-xs text-secondary">{agency.phone || ''}</div>
                                        </td>
                                        <td>{agency.city || '-'}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-secondary" />
                                                <span>{agency.user_count}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge variant={agency.is_active ? 'success' : 'error'}>
                                                {agency.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </td>
                                        <td className="text-sm text-secondary">
                                            {formatDate(agency.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(agency)}>
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(agency)}>
                                                    {agency.is_active ? <PowerOff size={14} /> : <Power size={14} />}
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => { setDeletingAgency(agency); setShowDeleteDialog(true); }}>
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAgency ? 'Edit Agency' : 'Add New Agency'}
            >
                {error && (
                    <div className="error-alert mb-4">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Agency Name *</label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter agency name"
                    />
                </div>

                {!editingAgency && (
                    <div className="admin-section mb-4">
                        <h4 className="section-title">
                            <User size={16} />
                            Agency Admin Account
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Admin Name</label>
                                <Input
                                    value={formData.adminName}
                                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                                    placeholder="Admin's full name"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Admin Email *</label>
                                <Input
                                    type="email"
                                    value={formData.adminEmail}
                                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>
                        <p className="hint-text">A password will be auto-generated and shown after creation.</p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Agency Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="agency@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Mumbai"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">GST Number</label>
                        <Input
                            value={formData.gst_number}
                            onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                            placeholder="22AAAAA0000A1Z5"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea
                        className="form-textarea"
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full address"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.name || (!editingAgency && !formData.adminEmail)}>
                        {loading ? 'Creating...' : editingAgency ? 'Update' : 'Create Agency'}
                    </Button>
                </div>
            </Modal>

            {/* Credentials Modal */}
            <Modal
                isOpen={showCredentialsModal}
                onClose={() => setShowCredentialsModal(false)}
                title="Agency Created Successfully!"
            >
                <div className="credentials-card">
                    <div className="success-icon">
                        <Check size={32} />
                    </div>
                    <h3>Admin Login Credentials</h3>
                    <p className="hint-text">Share these credentials securely with the agency admin.</p>

                    <div className="credential-field">
                        <div className="credential-label">
                            <Mail size={16} />
                            Email
                        </div>
                        <div className="credential-value">
                            <span>{credentials?.email}</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(credentials?.email || '', 'email')}
                            >
                                {copiedField === 'email' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="credential-field">
                        <div className="credential-label">
                            <Key size={16} />
                            Password
                        </div>
                        <div className="credential-value">
                            <span className="password">{credentials?.password}</span>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(credentials?.password || '', 'password')}
                            >
                                {copiedField === 'password' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="warning-text">
                        ⚠️ This password will not be shown again. Make sure to copy it.
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={() => setShowCredentialsModal(false)}>Done</Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Agency"
                message={`Are you sure you want to delete "${deletingAgency?.name}"? This will also remove all associated data.`}
                confirmText="Delete"
                variant="danger"
            />

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
                .admin-section {
                    background: var(--primary-50);
                    padding: var(--spacing-4);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--primary-200);
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-weight: 600;
                    margin-bottom: var(--spacing-3);
                    color: var(--primary-700);
                }
                .hint-text {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-top: var(--spacing-2);
                }
                .error-alert {
                    background: var(--error-50);
                    color: var(--error-700);
                    padding: var(--spacing-3);
                    border-radius: var(--radius-lg);
                    font-size: 14px;
                    border: 1px solid var(--error-200);
                }
                .credentials-card {
                    text-align: center;
                }
                .success-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--success-100);
                    color: var(--success-600);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto var(--spacing-4);
                }
                .credentials-card h3 {
                    margin: 0 0 var(--spacing-2);
                    font-size: 18px;
                }
                .credential-field {
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-3);
                    margin-top: var(--spacing-3);
                    text-align: left;
                }
                .credential-label {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-bottom: var(--spacing-1);
                }
                .credential-value {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-family: monospace;
                    font-size: 15px;
                    font-weight: 500;
                }
                .credential-value .password {
                    background: var(--warning-100);
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .copy-btn {
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .copy-btn:hover {
                    background: var(--bg-tertiary);
                    color: var(--primary-600);
                }
                .warning-text {
                    margin-top: var(--spacing-4);
                    padding: var(--spacing-3);
                    background: var(--warning-50);
                    border-radius: var(--radius-lg);
                    font-size: 13px;
                    color: var(--warning-700);
                }
            `}</style>
        </div>
    );
}
