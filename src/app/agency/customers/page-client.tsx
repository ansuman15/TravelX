'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Phone,
    Mail,
    User,
    Calendar,
    Globe,
    FileText,
    Edit2,
    Trash2,
    Eye,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { createCustomer, updateCustomer } from '@/lib/actions/leads';

interface Customer {
    id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    alternate_phone: string | null;
    passport_number: string | null;
    passport_expiry: string | null;
    date_of_birth: string | null;
    nationality: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    pincode: string | null;
    notes: string | null;
    created_at: string;
    bookings?: { count: number }[];
}

interface CustomersPageClientProps {
    initialCustomers: Customer[];
}

export function CustomersPageClient({ initialCustomers }: CustomersPageClientProps) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        alternate_phone: '',
        passport_number: '',
        passport_expiry: '',
        date_of_birth: '',
        nationality: 'Indian',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        notes: '',
    });

    const filteredCustomers = customers.filter(customer => {
        const query = searchQuery.toLowerCase();
        return (
            customer.full_name.toLowerCase().includes(query) ||
            customer.email?.toLowerCase().includes(query) ||
            customer.phone?.includes(searchQuery) ||
            customer.passport_number?.toLowerCase().includes(query) ||
            customer.city?.toLowerCase().includes(query)
        );
    });

    const resetForm = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            alternate_phone: '',
            passport_number: '',
            passport_expiry: '',
            date_of_birth: '',
            nationality: 'Indian',
            gender: '',
            address: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            notes: '',
        });
    };

    const handleCreateCustomer = async () => {
        setLoading(true);
        const result = await createCustomer({
            ...formData,
            gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        });

        if (result.data) {
            setShowCreateModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleUpdateCustomer = async () => {
        if (!selectedCustomer) return;

        setLoading(true);
        const result = await updateCustomer(selectedCustomer.id, {
            ...formData,
            gender: formData.gender as 'male' | 'female' | 'other' | undefined,
        });

        if (result.data) {
            setShowDetailModal(false);
            setIsEditing(false);
            router.refresh();
        }
        setLoading(false);
    };

    const openDetailModal = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData({
            full_name: customer.full_name,
            email: customer.email || '',
            phone: customer.phone || '',
            alternate_phone: customer.alternate_phone || '',
            passport_number: customer.passport_number || '',
            passport_expiry: customer.passport_expiry || '',
            date_of_birth: customer.date_of_birth || '',
            nationality: customer.nationality || 'Indian',
            gender: customer.gender || '',
            address: customer.address || '',
            city: customer.city || '',
            state: customer.state || '',
            country: customer.country || 'India',
            pincode: customer.pincode || '',
            notes: customer.notes || '',
        });
        setShowDetailModal(true);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const isPassportExpiringSoon = (expiryDate: string | null) => {
        if (!expiryDate) return false;
        const expiry = new Date(expiryDate);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        return expiry <= sixMonthsFromNow;
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-secondary text-sm">Manage your customer database</p>
                </div>
                <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
                    <Plus size={18} />
                    Add Customer
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{customers.length}</div>
                        <div className="text-sm text-secondary">Total Customers</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">
                            {customers.filter(c => c.passport_number).length}
                        </div>
                        <div className="text-sm text-secondary">With Passport</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-warning-600">
                            {customers.filter(c => isPassportExpiringSoon(c.passport_expiry)).length}
                        </div>
                        <div className="text-sm text-secondary">Passport Expiring Soon</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">
                            {customers.filter(c => {
                                const created = new Date(c.created_at);
                                const thirtyDaysAgo = new Date();
                                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                                return created >= thirtyDaysAgo;
                            }).length}
                        </div>
                        <div className="text-sm text-secondary">New This Month</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                    <div className="input-wrapper">
                        <Search className="input-icon" size={18} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by name, email, phone, passport, city..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-3 gap-4">
                {filteredCustomers.length === 0 ? (
                    <div className="card" style={{ gridColumn: 'span 3' }}>
                        <div className="card-body text-center" style={{ padding: 'var(--spacing-10)' }}>
                            <User size={48} className="text-secondary mx-auto mb-4" style={{ opacity: 0.3 }} />
                            <div className="text-secondary">
                                No customers found. {searchQuery && 'Try adjusting your search.'}
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <div key={customer.id} className="card">
                            <div className="card-body">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="avatar bg-primary-100"
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: 'var(--radius-full)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'var(--primary-600)',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {customer.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{customer.full_name}</div>
                                            <div className="text-sm text-secondary">
                                                {customer.city || customer.nationality || 'No location'}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => openDetailModal(customer)}
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {customer.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone size={14} className="text-secondary" />
                                            <span>{customer.phone}</span>
                                        </div>
                                    )}
                                    {customer.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail size={14} className="text-secondary" />
                                            <span className="truncate">{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.passport_number && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FileText size={14} className="text-secondary" />
                                            <span>{customer.passport_number}</span>
                                            {isPassportExpiringSoon(customer.passport_expiry) && (
                                                <Badge variant="warning">Expiring Soon</Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                                    <div className="text-sm text-secondary">
                                        {customer.bookings?.[0]?.count || 0} bookings
                                    </div>
                                    <div className="text-sm text-secondary">
                                        Added {formatDate(customer.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Customer Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New Customer"
                size="lg"
            >
                <CustomerForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleCreateCustomer}
                    onCancel={() => setShowCreateModal(false)}
                    loading={loading}
                    submitLabel="Create Customer"
                />
            </Modal>

            {/* Customer Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => { setShowDetailModal(false); setIsEditing(false); }}
                title={isEditing ? 'Edit Customer' : 'Customer Details'}
                size="lg"
            >
                {selectedCustomer && (
                    isEditing ? (
                        <CustomerForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleUpdateCustomer}
                            onCancel={() => setIsEditing(false)}
                            loading={loading}
                            submitLabel="Update Customer"
                        />
                    ) : (
                        <div>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Full Name" value={selectedCustomer.full_name} />
                                <DetailItem label="Phone" value={selectedCustomer.phone} />
                                <DetailItem label="Email" value={selectedCustomer.email} />
                                <DetailItem label="Alternate Phone" value={selectedCustomer.alternate_phone} />
                                <DetailItem label="Date of Birth" value={formatDate(selectedCustomer.date_of_birth)} />
                                <DetailItem label="Gender" value={selectedCustomer.gender} />
                                <DetailItem label="Nationality" value={selectedCustomer.nationality} />
                                <DetailItem label="Passport Number" value={selectedCustomer.passport_number} />
                                <DetailItem
                                    label="Passport Expiry"
                                    value={formatDate(selectedCustomer.passport_expiry)}
                                    warning={isPassportExpiringSoon(selectedCustomer.passport_expiry)}
                                />
                                <DetailItem label="City" value={selectedCustomer.city} />
                                <DetailItem label="State" value={selectedCustomer.state} />
                                <DetailItem label="Country" value={selectedCustomer.country} />
                                <div style={{ gridColumn: 'span 2' }}>
                                    <DetailItem label="Address" value={selectedCustomer.address} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <DetailItem label="Notes" value={selectedCustomer.notes} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                    Close
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Edit2 size={16} />
                                    Edit
                                </Button>
                            </div>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
}

// Helper components
function DetailItem({ label, value, warning }: { label: string; value: string | null | undefined; warning?: boolean }) {
    return (
        <div>
            <div className="text-sm text-secondary mb-1">{label}</div>
            <div className={`font-medium ${warning ? 'text-warning-600' : ''}`}>
                {value || '-'}
            </div>
        </div>
    );
}

function CustomerForm({
    formData,
    setFormData,
    onSubmit,
    onCancel,
    loading,
    submitLabel
}: {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    onCancel: () => void;
    loading: boolean;
    submitLabel: string;
}) {
    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter full name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Phone</label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 9876543210"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Alternate Phone</label>
                    <Input
                        value={formData.alternate_phone}
                        onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Gender</label>
                    <Select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </Select>
                </div>
                <div className="form-group">
                    <label className="form-label">Passport Number</label>
                    <Input
                        value={formData.passport_number}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                        placeholder="P1234567"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Passport Expiry</label>
                    <Input
                        type="date"
                        value={formData.passport_expiry}
                        onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Nationality</label>
                    <Input
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
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
                    <label className="form-label">State</label>
                    <Input
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                        placeholder="Full address"
                    />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Notes</label>
                    <textarea
                        className="form-textarea"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Any additional notes..."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={onSubmit} disabled={loading || !formData.full_name}>
                    {loading ? 'Saving...' : submitLabel}
                </Button>
            </div>
        </>
    );
}
