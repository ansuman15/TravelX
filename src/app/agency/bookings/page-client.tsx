'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    Search,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Eye,
    FileText,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle,
    Plane,
    Package,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { createBooking, updateBookingStatus, recordPayment, updateBooking } from '@/lib/actions/bookings';

interface PackageItinerary {
    id: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
}

interface PackageType {
    id: string;
    name: string;
    destination: string;
    duration_days: number;
    duration_nights: number;
    base_price: number | null;
    category: string | null;
    itineraries: PackageItinerary[];
}

interface Booking {
    id: string;
    booking_number: string;
    status: string;
    travel_start: string;
    travel_end: string;
    destination: string | null;
    adults: number;
    children: number;
    total_cost: number;
    total_amount: number;
    amount_paid: number;
    assigned_to: string | null;
    package_id: string | null;
    itinerary_id: string | null;
    notes: string | null;
    created_at: string;
    customer?: {
        id: string;
        full_name: string;
        phone: string | null;
        email: string | null;
    } | null;
    assigned_user?: {
        id: string;
        full_name: string;
    } | null;
    package?: {
        id: string;
        name: string;
        destination: string;
        duration_days: number;
        duration_nights: number;
        category: string | null;
    } | null;
    itinerary?: {
        id: string;
        name: string;
        destination: string;
        duration_days: number;
        duration_nights: number;
    } | null;
}

interface Customer {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
}

interface Staff {
    id: string;
    full_name: string;
    role: string;
}

interface BookingsPageClientProps {
    initialBookings: Booking[];
    customers: Customer[];
    staff: Staff[];
    packages: PackageType[];
    currentUserId: string;
}

const STATUS_OPTIONS = [
    { value: 'enquiry', label: 'Enquiry', color: '#3b82f6', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: CheckCircle },
    { value: 'documents_pending', label: 'Docs Pending', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: FileText },
    { value: 'ticketed', label: 'Ticketed', color: '#10b981', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: Plane },
    { value: 'completed', label: 'Completed', color: '#059669', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444', gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)', icon: XCircle },
];

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
    'enquiry': ['confirmed', 'cancelled'],
    'confirmed': ['documents_pending', 'ticketed', 'cancelled'],
    'documents_pending': ['ticketed', 'cancelled'],
    'ticketed': ['completed', 'cancelled'],
    'completed': [],
    'cancelled': [],
};

export function BookingsPageClient({
    initialBookings,
    customers,
    staff,
    packages,
    currentUserId
}: BookingsPageClientProps) {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        customer_id: '',
        package_id: '',
        itinerary_id: '',
        destination: '',
        travel_start: '',
        travel_end: '',
        adults: 1,
        children: 0,
        total_cost: 0,
        total_amount: 0,
        assigned_to: '',
        notes: '',
    });

    // Payment form
    const [paymentData, setPaymentData] = useState({
        amount: 0,
        payment_mode: 'bank_transfer',
        reference_number: '',
        notes: '',
    });

    // Get itineraries for selected package
    const selectedPackage = packages.find(p => p.id === formData.package_id);
    const availableItineraries = selectedPackage?.itineraries || [];

    const filteredBookings = bookings.filter(booking => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            booking.booking_number.toLowerCase().includes(query) ||
            booking.customer?.full_name.toLowerCase().includes(query) ||
            booking.destination?.toLowerCase().includes(query) ||
            booking.package?.name?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Handle package selection - auto-fill details from package
    const handlePackageChange = (packageId: string) => {
        const pkg = packages.find(p => p.id === packageId);
        if (pkg) {
            const travelStart = formData.travel_start || new Date().toISOString().split('T')[0];
            const startDate = new Date(travelStart);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + pkg.duration_days - 1);

            setFormData({
                ...formData,
                package_id: packageId,
                itinerary_id: '',
                destination: pkg.destination,
                travel_end: endDate.toISOString().split('T')[0],
                total_amount: pkg.base_price || formData.total_amount,
            });
        } else {
            setFormData({ ...formData, package_id: '', itinerary_id: '' });
        }
    };

    const resetForm = () => {
        setFormData({
            customer_id: '',
            package_id: '',
            itinerary_id: '',
            destination: '',
            travel_start: '',
            travel_end: '',
            adults: 1,
            children: 0,
            total_cost: 0,
            total_amount: 0,
            assigned_to: '',
            notes: '',
        });
    };

    const handleCreateBooking = async () => {
        if (!formData.customer_id || !formData.travel_start || !formData.travel_end) {
            return;
        }

        setLoading(true);
        const result = await createBooking({
            ...formData,
            package_id: formData.package_id || undefined,
            itinerary_id: formData.itinerary_id || undefined,
            assigned_to: formData.assigned_to || undefined,
        });

        if (result.data) {
            setShowCreateModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleStatusChange = async (bookingId: string, newStatus: string, notes?: string) => {
        const result = await updateBookingStatus(bookingId, newStatus, notes);
        if (result.data) {
            router.refresh();
        } else if (result.error) {
            alert(result.error);
        }
    };

    const handleRecordPayment = async () => {
        if (!selectedBooking || paymentData.amount <= 0) return;

        setLoading(true);
        const result = await recordPayment({
            booking_id: selectedBooking.id,
            amount: paymentData.amount,
            payment_mode: paymentData.payment_mode as 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'other',
            reference_number: paymentData.reference_number || undefined,
            notes: paymentData.notes || undefined,
        });

        if (result.data) {
            setShowPaymentModal(false);
            setPaymentData({
                amount: 0,
                payment_mode: 'bank_transfer',
                reference_number: '',
                notes: '',
            });
            router.refresh();
        }
        setLoading(false);
    };

    const handleLinkPackage = async (bookingId: string, packageId: string, itineraryId?: string) => {
        setLoading(true);
        const result = await updateBooking(bookingId, {
            package_id: packageId || undefined,
            itinerary_id: itineraryId || undefined,
        });
        if (result.data) {
            router.refresh();
        }
        setLoading(false);
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        const Icon = statusOption?.icon || Clock;
        return (
            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: statusOption?.color || '#64748b',
                    color: 'white'
                }}
            >
                <Icon size={12} />
                {statusOption?.label || status}
            </span>
        );
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getPaymentProgress = (booking: Booking) => {
        const paid = booking.amount_paid || 0;
        const total = booking.total_amount || 0;
        const percentage = total > 0 ? (paid / total) * 100 : 0;
        return { paid, total, percentage };
    };

    const openDetailModal = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const openPaymentModal = (booking: Booking) => {
        setSelectedBooking(booking);
        const balance = booking.total_amount - (booking.amount_paid || 0);
        setPaymentData({
            amount: balance > 0 ? balance : 0,
            payment_mode: 'bank_transfer',
            reference_number: '',
            notes: '',
        });
        setShowPaymentModal(true);
    };

    // Group bookings by status for stats
    const bookingsByStatus = STATUS_OPTIONS.reduce((acc, status) => {
        acc[status.value] = bookings.filter(b => b.status === status.value);
        return acc;
    }, {} as Record<string, Booking[]>);

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                        Bookings
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                        Manage trip bookings and payments • {bookings.length} total bookings
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowCreateModal(true); }}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    }}
                >
                    <Plus size={18} />
                    New Booking
                </button>
            </div>

            {/* Stats Row - Visual Pipeline */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                {STATUS_OPTIONS.slice(0, 5).map((status, index) => {
                    const count = bookingsByStatus[status.value]?.length || 0;
                    const Icon = status.icon;
                    const isActive = statusFilter === status.value;
                    return (
                        <div
                            key={status.value}
                            onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
                            style={{
                                position: 'relative',
                                flex: '1',
                                minWidth: '160px',
                                padding: '16px',
                                borderRadius: '16px',
                                background: isActive ? status.gradient : 'white',
                                border: isActive ? 'none' : '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isActive ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '12px',
                                    background: isActive ? 'rgba(255,255,255,0.25)' : status.gradient,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon size={22} color={isActive ? 'white' : 'white'} />
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '1.75rem',
                                        fontWeight: 700,
                                        color: isActive ? 'white' : '#1e293b',
                                        lineHeight: 1
                                    }}>{count}</div>
                                    <div style={{
                                        fontSize: '0.8125rem',
                                        color: isActive ? 'rgba(255,255,255,0.9)' : '#64748b',
                                        fontWeight: 500
                                    }}>{status.label}</div>
                                </div>
                            </div>
                            {index < 4 && (
                                <div style={{
                                    position: 'absolute',
                                    right: '-18px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#cbd5e1',
                                    fontSize: '18px',
                                    zIndex: 1
                                }}>→</div>
                            )}
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
                                    placeholder="Search by booking number, customer, destination, package..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '180px' }}
                        >
                            <option value="all">All Status</option>
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Booking #</th>
                                <th>Customer</th>
                                <th>Package</th>
                                <th>Destination</th>
                                <th>Travel Dates</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">
                                            No bookings found. {searchQuery && 'Try adjusting your search.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => {
                                    const { paid, total, percentage } = getPaymentProgress(booking);
                                    const allowedNext = ALLOWED_TRANSITIONS[booking.status] || [];

                                    return (
                                        <tr key={booking.id}>
                                            <td>
                                                <div className="font-mono font-medium text-primary-600">
                                                    {booking.booking_number}
                                                </div>
                                            </td>
                                            <td>
                                                {booking.customer ? (
                                                    <div>
                                                        <div className="font-medium">{booking.customer.full_name}</div>
                                                        <div className="text-sm text-secondary">
                                                            {booking.customer.phone}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td>
                                                {booking.package ? (
                                                    <div>
                                                        <div className="font-medium flex items-center gap-1">
                                                            <Package size={12} className="text-primary-500" />
                                                            {booking.package.name}
                                                        </div>
                                                        {booking.itinerary && (
                                                            <div className="text-xs text-secondary">
                                                                {booking.itinerary.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-secondary text-sm">No package</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={14} className="text-secondary" />
                                                    {booking.destination || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-sm">
                                                    <div>{formatDate(booking.travel_start)}</div>
                                                    <div className="text-secondary">to {formatDate(booking.travel_end)}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="font-medium">{formatCurrency(total)}</div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="text-sm">
                                                        {formatCurrency(paid)} / {formatCurrency(total)}
                                                    </div>
                                                    <div
                                                        className="progress mt-1"
                                                        style={{ height: '4px', width: '80px' }}
                                                    >
                                                        <div
                                                            className="progress-bar"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                background: percentage >= 100 ? 'var(--success-500)' : 'var(--primary-500)',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{getStatusBadge(booking.status)}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openDetailModal(booking)}
                                                    >
                                                        <Eye size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openPaymentModal(booking)}
                                                    >
                                                        <CreditCard size={14} />
                                                    </Button>
                                                    {allowedNext.length > 0 && (
                                                        <Select
                                                            value=""
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleStatusChange(booking.id, e.target.value);
                                                                }
                                                            }}
                                                            style={{ width: '100px', fontSize: '11px' }}
                                                        >
                                                            <option value="">Move to...</option>
                                                            {allowedNext.map(s => {
                                                                const label = STATUS_OPTIONS.find(o => o.value === s)?.label;
                                                                return (
                                                                    <option key={s} value={s}>{label}</option>
                                                                );
                                                            })}
                                                        </Select>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Booking Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Booking"
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Customer *</label>
                        <Select
                            value={formData.customer_id}
                            onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                        >
                            <option value="">Select customer</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.full_name} ({c.phone || c.email})
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Package Selection */}
                    <div className="form-group">
                        <label className="form-label">Package (Optional)</label>
                        <Select
                            value={formData.package_id}
                            onChange={(e) => handlePackageChange(e.target.value)}
                        >
                            <option value="">No package</option>
                            {packages.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} ({p.duration_days}D/{p.duration_nights}N)
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Itinerary Selection (appears when package selected) */}
                    <div className="form-group">
                        <label className="form-label">Itinerary (Optional)</label>
                        <Select
                            value={formData.itinerary_id}
                            onChange={(e) => setFormData({ ...formData, itinerary_id: e.target.value })}
                            disabled={!formData.package_id}
                        >
                            <option value="">No itinerary</option>
                            {availableItineraries.map(it => (
                                <option key={it.id} value={it.id}>
                                    {it.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Destination</label>
                        <Input
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder="e.g., Bali, Indonesia"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Travel Start Date *</label>
                        <Input
                            type="date"
                            value={formData.travel_start}
                            onChange={(e) => setFormData({ ...formData, travel_start: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Travel End Date *</label>
                        <Input
                            type="date"
                            value={formData.travel_end}
                            onChange={(e) => setFormData({ ...formData, travel_end: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Adults</label>
                        <Input
                            type="number"
                            min={1}
                            value={formData.adults}
                            onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Children</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.children}
                            onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Total Cost (Your cost)</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.total_cost}
                            onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Total Amount (Customer pays) *</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.total_amount}
                            onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Assign To</label>
                        <Select
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        >
                            <option value="">Select staff member</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.full_name}</option>
                            ))}
                        </Select>
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
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateBooking}
                        disabled={loading || !formData.customer_id || !formData.travel_start || !formData.travel_end || formData.total_amount <= 0}
                    >
                        {loading ? 'Creating...' : 'Create Booking'}
                    </Button>
                </div>
            </Modal>

            {/* Booking Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Booking ${selectedBooking?.booking_number}`}
                size="lg"
            >
                {selectedBooking && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {getStatusBadge(selectedBooking.status)}
                        </div>

                        {/* Package Info */}
                        {selectedBooking.package && (
                            <div className="card mb-4" style={{ background: 'var(--primary-50)' }}>
                                <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Package size={16} className="text-primary-600" />
                                        <span className="font-medium text-primary-700">Package: {selectedBooking.package.name}</span>
                                    </div>
                                    <div className="text-sm text-primary-600">
                                        {selectedBooking.package.destination} • {selectedBooking.package.duration_days}D/{selectedBooking.package.duration_nights}N
                                    </div>
                                    {selectedBooking.itinerary && (
                                        <div className="text-sm text-primary-600 mt-1">
                                            Itinerary: {selectedBooking.itinerary.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-secondary">Customer</div>
                                <div className="font-medium">{selectedBooking.customer?.full_name || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Phone</div>
                                <div className="font-medium">{selectedBooking.customer?.phone || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Destination</div>
                                <div className="font-medium">{selectedBooking.destination || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Travel Dates</div>
                                <div className="font-medium">
                                    {formatDate(selectedBooking.travel_start)} - {formatDate(selectedBooking.travel_end)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Travelers</div>
                                <div className="font-medium">
                                    {selectedBooking.adults} Adults, {selectedBooking.children} Children
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Assigned To</div>
                                <div className="font-medium">{selectedBooking.assigned_user?.full_name || 'Unassigned'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Total Cost</div>
                                <div className="font-medium">{formatCurrency(selectedBooking.total_cost)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Total Amount</div>
                                <div className="font-medium">{formatCurrency(selectedBooking.total_amount)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Amount Paid</div>
                                <div className="font-medium text-success-600">
                                    {formatCurrency(selectedBooking.amount_paid || 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Balance Due</div>
                                <div className="font-medium text-warning-600">
                                    {formatCurrency(selectedBooking.total_amount - (selectedBooking.amount_paid || 0))}
                                </div>
                            </div>
                            {selectedBooking.notes && (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <div className="text-sm text-secondary">Notes</div>
                                    <div className="font-medium">{selectedBooking.notes}</div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                Close
                            </Button>
                            {selectedBooking.package && selectedBooking.itinerary && (
                                <Link href={`/agency/packages/${selectedBooking.package.id}`}>
                                    <Button variant="outline">
                                        <FileText size={16} />
                                        View Itinerary
                                    </Button>
                                </Link>
                            )}
                            <Button variant="outline" onClick={() => { setShowDetailModal(false); openPaymentModal(selectedBooking); }}>
                                <CreditCard size={16} />
                                Record Payment
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Record Payment"
            >
                {selectedBooking && (
                    <div>
                        <div className="card mb-4" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="flex justify-between mb-2">
                                    <span className="text-secondary">Booking</span>
                                    <span className="font-mono">{selectedBooking.booking_number}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-secondary">Total Amount</span>
                                    <span>{formatCurrency(selectedBooking.total_amount)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-secondary">Amount Paid</span>
                                    <span className="text-success-600">{formatCurrency(selectedBooking.amount_paid || 0)}</span>
                                </div>
                                <div className="flex justify-between font-medium">
                                    <span>Balance Due</span>
                                    <span className="text-warning-600">
                                        {formatCurrency(selectedBooking.total_amount - (selectedBooking.amount_paid || 0))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount *</label>
                            <Input
                                type="number"
                                min={0}
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Mode *</label>
                            <Select
                                value={paymentData.payment_mode}
                                onChange={(e) => setPaymentData({ ...paymentData, payment_mode: e.target.value })}
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="upi">UPI</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="cheque">Cheque</option>
                                <option value="other">Other</option>
                            </Select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Reference Number</label>
                            <Input
                                value={paymentData.reference_number}
                                onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                                placeholder="Transaction ID / Cheque number"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                value={paymentData.notes}
                                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                                placeholder="Any notes..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleRecordPayment} disabled={loading || paymentData.amount <= 0}>
                                {loading ? 'Recording...' : 'Record Payment'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
