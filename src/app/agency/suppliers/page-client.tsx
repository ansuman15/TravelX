'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Building,
    Plane,
    Hotel,
    Car,
    Shield,
    FileCheck,
    Activity,
    MoreHorizontal,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { createSupplier, updateSupplier, deleteSupplier } from '@/lib/actions/suppliers';

interface Supplier {
    id: string;
    name: string;
    category: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    payment_terms: string | null;
    default_margin: number | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
}

interface SupplierCount {
    category: string;
    count: number;
}

interface SuppliersPageClientProps {
    initialSuppliers: Supplier[];
    suppliersCount: SupplierCount[];
    currentUserId: string;
}

const CATEGORIES = [
    { value: 'airline', label: 'Airline', icon: Plane },
    { value: 'hotel', label: 'Hotel', icon: Hotel },
    { value: 'dmc', label: 'DMC', icon: Building },
    { value: 'transport', label: 'Transport', icon: Car },
    { value: 'activity', label: 'Activity', icon: Activity },
    { value: 'visa', label: 'Visa Services', icon: FileCheck },
    { value: 'insurance', label: 'Insurance', icon: Shield },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
];

export function SuppliersPageClient({
    initialSuppliers,
    suppliersCount,
    currentUserId
}: SuppliersPageClientProps) {
    const router = useRouter();
    const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        category: 'hotel',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        country: '',
        payment_terms: '',
        default_margin: 0,
        notes: '',
    });

    const filteredSuppliers = suppliers.filter(supplier => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            supplier.name.toLowerCase().includes(query) ||
            supplier.contact_person?.toLowerCase().includes(query) ||
            supplier.city?.toLowerCase().includes(query);

        const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const handleSubmit = async () => {
        if (!formData.name) return;

        setLoading(true);

        if (editingSupplier) {
            const result = await updateSupplier(editingSupplier.id, {
                ...formData,
                default_margin: formData.default_margin || null,
            });
            if (result.data) {
                setShowModal(false);
                resetForm();
                router.refresh();
            }
        } else {
            const result = await createSupplier({
                ...formData,
                default_margin: formData.default_margin || null,
            });
            if (result.data) {
                setShowModal(false);
                resetForm();
                router.refresh();
            }
        }

        setLoading(false);
    };

    const handleDelete = async () => {
        if (!deletingSupplier) return;

        setLoading(true);
        const result = await deleteSupplier(deletingSupplier.id);
        if (result.data) {
            setShowDeleteDialog(false);
            setDeletingSupplier(null);
            router.refresh();
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'hotel',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            country: '',
            payment_terms: '',
            default_margin: 0,
            notes: '',
        });
        setEditingSupplier(null);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            category: supplier.category,
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            city: supplier.city || '',
            country: supplier.country || '',
            payment_terms: supplier.payment_terms || '',
            default_margin: supplier.default_margin || 0,
            notes: supplier.notes || '',
        });
        setShowModal(true);
    };

    const openDeleteDialog = (supplier: Supplier) => {
        setDeletingSupplier(supplier);
        setShowDeleteDialog(true);
    };

    const getCategoryIcon = (category: string) => {
        const cat = CATEGORIES.find(c => c.value === category);
        return cat?.icon || Building;
    };

    const getCategoryLabel = (category: string) => {
        return CATEGORIES.find(c => c.value === category)?.label || category;
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Suppliers</h1>
                    <p className="text-secondary text-sm">Manage your travel service providers</p>
                </div>
                <Button onClick={() => { resetForm(); setShowModal(true); }}>
                    <Plus size={18} />
                    Add Supplier
                </Button>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-8 gap-3 mb-6">
                {CATEGORIES.map(cat => {
                    const count = suppliersCount.find(s => s.category === cat.value)?.count || 0;
                    const Icon = cat.icon;
                    const isActive = categoryFilter === cat.value;
                    return (
                        <div
                            key={cat.value}
                            className={`card cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary-500' : ''}`}
                            onClick={() => setCategoryFilter(isActive ? 'all' : cat.value)}
                        >
                            <div className="card-body" style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                                <Icon size={20} className={isActive ? 'text-primary-500' : 'text-secondary'} style={{ margin: '0 auto' }} />
                                <div className="text-lg font-bold mt-1">{count}</div>
                                <div className="text-xs text-secondary">{cat.label}</div>
                            </div>
                        </div>
                    );
                })}
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
                                    placeholder="Search suppliers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ width: '180px' }}
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-3 gap-4">
                {filteredSuppliers.length === 0 ? (
                    <div className="col-span-3 card">
                        <div className="card-body text-center" style={{ padding: 'var(--spacing-8)' }}>
                            <div className="text-secondary">No suppliers found.</div>
                        </div>
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => {
                        const Icon = getCategoryIcon(supplier.category);
                        return (
                            <div key={supplier.id} className="card">
                                <div className="card-body">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="supplier-icon">
                                                <Icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{supplier.name}</h3>
                                                <Badge variant="default">{getCategoryLabel(supplier.category)}</Badge>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(supplier)}>
                                                <Edit2 size={14} />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(supplier)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>

                                    {supplier.contact_person && (
                                        <div className="text-sm mb-2">
                                            <span className="text-secondary">Contact:</span> {supplier.contact_person}
                                        </div>
                                    )}

                                    <div className="supplier-details">
                                        {supplier.phone && (
                                            <div className="detail-row">
                                                <Phone size={14} className="text-secondary" />
                                                <span>{supplier.phone}</span>
                                            </div>
                                        )}
                                        {supplier.email && (
                                            <div className="detail-row">
                                                <Mail size={14} className="text-secondary" />
                                                <span>{supplier.email}</span>
                                            </div>
                                        )}
                                        {(supplier.city || supplier.country) && (
                                            <div className="detail-row">
                                                <MapPin size={14} className="text-secondary" />
                                                <span>{[supplier.city, supplier.country].filter(Boolean).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {(supplier.default_margin ?? 0) > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <div className="text-sm">
                                                <span className="text-secondary">Default Margin:</span>{' '}
                                                <span className="font-medium text-success-600">{supplier.default_margin}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Supplier Name *</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Emirates Airlines"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <Select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Contact Person</label>
                        <Input
                            value={formData.contact_person}
                            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
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
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Country</label>
                        <Input
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Payment Terms</label>
                        <Input
                            value={formData.payment_terms}
                            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                            placeholder="e.g., Net 30"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Default Margin (%)</label>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={formData.default_margin}
                            onChange={(e) => setFormData({ ...formData, default_margin: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !formData.name}>
                        {loading ? 'Saving...' : editingSupplier ? 'Update' : 'Add Supplier'}
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Supplier"
                message={`Are you sure you want to delete "${deletingSupplier?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />

            <style jsx>{`
                .supplier-icon {
                    width: 44px;
                    height: 44px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .supplier-details {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }
                .detail-row {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-size: var(--font-sm);
                }
            `}</style>
        </div>
    );
}
