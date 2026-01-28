'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    Search,
    MapPin,
    Calendar,
    DollarSign,
    Edit2,
    Trash2,
    Eye,
    Copy,
    ToggleLeft,
    ToggleRight,
    Package,
    Clock,
    CheckCircle,
    List,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { createPackage, updatePackage, deletePackage, togglePackageStatus } from '@/lib/actions/packages';

interface PackageType {
    id: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    description: string | null;
    highlights: string[] | null;
    inclusions: string[] | null;
    exclusions: string[] | null;
    base_price: number | null;
    category: string | null;
    is_active: boolean;
    created_at: string;
    itineraries?: { count: number }[];
    creator?: { full_name: string } | null;
}

interface PackagesPageClientProps {
    initialPackages: PackageType[];
}

const CATEGORY_OPTIONS = [
    { value: 'honeymoon', label: 'Honeymoon' },
    { value: 'family', label: 'Family' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'pilgrimage', label: 'Pilgrimage' },
    { value: 'beach', label: 'Beach' },
    { value: 'hill_station', label: 'Hill Station' },
    { value: 'wildlife', label: 'Wildlife' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'cruise', label: 'Cruise' },
    { value: 'international', label: 'International' },
    { value: 'domestic', label: 'Domestic' },
    { value: 'custom', label: 'Custom' },
];

export function PackagesPageClient({ initialPackages }: PackagesPageClientProps) {
    const router = useRouter();
    const [packages, setPackages] = useState<PackageType[]>(initialPackages);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        destination: '',
        duration_days: 3,
        duration_nights: 2,
        description: '',
        base_price: 0,
        category: 'custom',
        highlights: [''],
        inclusions: [''],
        exclusions: [''],
    });

    const filteredPackages = packages.filter(pkg => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            pkg.name.toLowerCase().includes(query) ||
            pkg.destination.toLowerCase().includes(query);

        const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    const resetForm = () => {
        setFormData({
            name: '',
            destination: '',
            duration_days: 3,
            duration_nights: 2,
            description: '',
            base_price: 0,
            category: 'custom',
            highlights: [''],
            inclusions: [''],
            exclusions: [''],
        });
    };

    const openEditModal = (pkg: PackageType) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            destination: pkg.destination,
            duration_days: pkg.duration_days,
            duration_nights: pkg.duration_nights,
            description: pkg.description || '',
            base_price: pkg.base_price || 0,
            category: pkg.category || 'custom',
            highlights: pkg.highlights?.length ? pkg.highlights : [''],
            inclusions: pkg.inclusions?.length ? pkg.inclusions : [''],
            exclusions: pkg.exclusions?.length ? pkg.exclusions : [''],
        });
        setIsEditing(true);
        setShowCreateModal(true);
    };

    const handleCreatePackage = async () => {
        setLoading(true);
        const result = await createPackage({
            ...formData,
            highlights: formData.highlights.filter(h => h.trim()),
            inclusions: formData.inclusions.filter(i => i.trim()),
            exclusions: formData.exclusions.filter(e => e.trim()),
            is_active: true,
        });

        if (result.data) {
            setShowCreateModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleUpdatePackage = async () => {
        if (!selectedPackage) return;

        setLoading(true);
        const result = await updatePackage(selectedPackage.id, {
            ...formData,
            highlights: formData.highlights.filter(h => h.trim()),
            inclusions: formData.inclusions.filter(i => i.trim()),
            exclusions: formData.exclusions.filter(e => e.trim()),
        });

        if (result.data) {
            setShowCreateModal(false);
            setIsEditing(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleDeletePackage = async () => {
        if (!selectedPackage) return;

        setLoading(true);
        const result = await deletePackage(selectedPackage.id);
        if (result.success) {
            setShowDeleteDialog(false);
            setSelectedPackage(null);
            router.refresh();
        }
        setLoading(false);
    };

    const handleToggleStatus = async (pkg: PackageType) => {
        await togglePackageStatus(pkg.id, !pkg.is_active);
        router.refresh();
    };

    const addListItem = (field: 'highlights' | 'inclusions' | 'exclusions') => {
        setFormData({
            ...formData,
            [field]: [...formData[field], ''],
        });
    };

    const updateListItem = (field: 'highlights' | 'inclusions' | 'exclusions', index: number, value: string) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData({ ...formData, [field]: newList });
    };

    const removeListItem = (field: 'highlights' | 'inclusions' | 'exclusions', index: number) => {
        const newList = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newList.length ? newList : [''] });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Packages</h1>
                    <p className="text-secondary text-sm">Create and manage travel package templates</p>
                </div>
                <Button onClick={() => { resetForm(); setIsEditing(false); setShowCreateModal(true); }}>
                    <Plus size={18} />
                    Create Package
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{packages.length}</div>
                        <div className="text-sm text-secondary">Total Packages</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-success-600">
                            {packages.filter(p => p.is_active).length}
                        </div>
                        <div className="text-sm text-secondary">Active</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">
                            {packages.reduce((sum, p) => sum + (p.itineraries?.[0]?.count || 0), 0)}
                        </div>
                        <div className="text-sm text-secondary">Total Itineraries</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">
                            {new Set(packages.map(p => p.destination)).size}
                        </div>
                        <div className="text-sm text-secondary">Destinations</div>
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
                                    placeholder="Search packages by name or destination..."
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
                            {CATEGORY_OPTIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-3 gap-4">
                {filteredPackages.length === 0 ? (
                    <div className="card" style={{ gridColumn: 'span 3' }}>
                        <div className="card-body text-center" style={{ padding: 'var(--spacing-10)' }}>
                            <Package size={48} className="text-secondary mx-auto mb-4" style={{ opacity: 0.3 }} />
                            <div className="text-secondary">
                                No packages found. {searchQuery && 'Try adjusting your search.'}
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredPackages.map((pkg) => (
                        <div key={pkg.id} className="card">
                            <div className="card-body">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{pkg.name}</h3>
                                            {pkg.is_active ? (
                                                <Badge variant="success">Active</Badge>
                                            ) : (
                                                <Badge variant="gray">Inactive</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-secondary text-sm mt-1">
                                            <MapPin size={14} />
                                            {pkg.destination}
                                        </div>
                                    </div>
                                    <Badge variant="primary">
                                        {CATEGORY_OPTIONS.find(c => c.value === pkg.category)?.label || pkg.category}
                                    </Badge>
                                </div>

                                {/* Duration & Price */}
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Clock size={14} className="text-secondary" />
                                        <span>{pkg.duration_days}D / {pkg.duration_nights}N</span>
                                    </div>
                                    {pkg.base_price && pkg.base_price > 0 && (
                                        <div className="flex items-center gap-1 text-sm font-medium text-success-600">
                                            <DollarSign size={14} />
                                            <span>{formatCurrency(pkg.base_price)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {pkg.description && (
                                    <p className="text-sm text-secondary mb-3 line-clamp-2">
                                        {pkg.description}
                                    </p>
                                )}

                                {/* Highlights */}
                                {pkg.highlights && pkg.highlights.length > 0 && (
                                    <div className="mb-3">
                                        <div className="text-xs text-secondary mb-1">Highlights</div>
                                        <div className="flex flex-wrap gap-1">
                                            {pkg.highlights.slice(0, 3).map((h, i) => (
                                                <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                                                    {h}
                                                </span>
                                            ))}
                                            {pkg.highlights.length > 3 && (
                                                <span className="text-xs text-secondary">+{pkg.highlights.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                                    <div className="text-sm text-secondary">
                                        {pkg.itineraries?.[0]?.count || 0} itineraries
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleToggleStatus(pkg)}
                                            title={pkg.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            {pkg.is_active ? <ToggleRight size={16} className="text-success-600" /> : <ToggleLeft size={16} />}
                                        </button>
                                        <Link href={`/agency/packages/${pkg.id}`}>
                                            <button className="btn btn-ghost btn-sm" title="View Itineraries">
                                                <List size={16} />
                                            </button>
                                        </Link>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => openEditModal(pkg)}
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => { setSelectedPackage(pkg); setShowDeleteDialog(true); }}
                                            title="Delete"
                                        >
                                            <Trash2 size={16} className="text-error-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Package Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setIsEditing(false); }}
                title={isEditing ? 'Edit Package' : 'Create New Package'}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Package Name *</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Bali Honeymoon Special"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Destination *</label>
                        <Input
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="e.g., Bali, Indonesia"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <Select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {CATEGORY_OPTIONS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Duration (Days)</label>
                        <Input
                            type="number"
                            min={1}
                            value={formData.duration_days}
                            onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Duration (Nights)</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.duration_nights}
                            onChange={(e) => setFormData({ ...formData, duration_nights: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Base Price (₹)</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.base_price}
                            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the package..."
                        />
                    </div>

                    {/* Highlights */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Highlights</label>
                        {formData.highlights.map((h, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={h}
                                    onChange={(e) => updateListItem('highlights', i, e.target.value)}
                                    placeholder="e.g., Private beach villa"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => removeListItem('highlights', i)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => addListItem('highlights')}
                        >
                            <Plus size={14} /> Add Highlight
                        </button>
                    </div>

                    {/* Inclusions */}
                    <div className="form-group">
                        <label className="form-label">Inclusions</label>
                        {formData.inclusions.map((item, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={item}
                                    onChange={(e) => updateListItem('inclusions', i, e.target.value)}
                                    placeholder="e.g., Breakfast"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => removeListItem('inclusions', i)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => addListItem('inclusions')}
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div>

                    {/* Exclusions */}
                    <div className="form-group">
                        <label className="form-label">Exclusions</label>
                        {formData.exclusions.map((item, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <Input
                                    value={item}
                                    onChange={(e) => updateListItem('exclusions', i, e.target.value)}
                                    placeholder="e.g., Flights"
                                />
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => removeListItem('exclusions', i)}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => addListItem('exclusions')}
                        >
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => { setShowCreateModal(false); setIsEditing(false); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={isEditing ? handleUpdatePackage : handleCreatePackage}
                        disabled={loading || !formData.name || !formData.destination}
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Package' : 'Create Package')}
                    </Button>
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDeletePackage}
                title="Delete Package"
                message={`Are you sure you want to delete "${selectedPackage?.name}"? This will also delete all associated itineraries.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
