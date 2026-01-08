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

interface AgenciesPageClientProps {
    agencies: Agency[];
}

export function AgenciesPageClient({ agencies }: AgenciesPageClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
    const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        gst_number: '',
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

        setLoading(true);

        if (editingAgency) {
            const result = await updateAgency(editingAgency.id, formData);
            if (result.data) {
                setShowModal(false);
                resetForm();
                router.refresh();
            }
        } else {
            const result = await createAgency(formData);
            if (result.data) {
                setShowModal(false);
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
        });
        setEditingAgency(null);
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
        });
        setShowModal(true);
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
                title={editingAgency ? 'Edit Agency' : 'Add Agency'}
            >
                <div className="form-group">
                    <label className="form-label">Agency Name *</label>
                    <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">GST Number</label>
                        <Input
                            value={formData.gst_number}
                            onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
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
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.name}>
                        {loading ? 'Saving...' : editingAgency ? 'Update' : 'Create Agency'}
                    </Button>
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
            `}</style>
        </div>
    );
}
