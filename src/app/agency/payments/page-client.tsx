'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    DollarSign,
    CreditCard,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Download,
    RefreshCcw,
    Calendar,
    FileText,
    CheckCircle,
    Receipt,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { recordPayment, recordRefund } from '@/lib/actions/bookings';

interface Payment {
    id: string;
    amount: number;
    payment_mode: string;
    payment_date: string;
    reference_number: string | null;
    notes: string | null;
    created_at: string;
    booking?: {
        id: string;
        booking_number: string;
        total_amount: number;
        destination: string | null;
        customer?: { id: string; full_name: string } | null;
    } | null;
    recorded_by_user?: { id: string; full_name: string } | null;
}

interface Booking {
    id: string;
    booking_number: string;
    total_amount: number;
    amount_paid: number;
    destination: string | null;
    customer?: { id: string; full_name: string } | null;
}

interface Stats {
    totalReceived: number;
    totalRefunds: number;
    netAmount: number;
    outstanding: number;
    paymentCount: number;
}

interface PaymentsPageClientProps {
    initialPayments: Payment[];
    bookings: Booking[];
    stats: Stats;
    currentUserId: string;
}

const PAYMENT_MODES = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' },
];

export function PaymentsPageClient({
    initialPayments,
    bookings,
    stats,
    currentUserId
}: PaymentsPageClientProps) {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [searchQuery, setSearchQuery] = useState('');
    const [modeFilter, setModeFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'received' | 'refund'>('all');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        booking_id: '',
        amount: 0,
        payment_mode: 'bank_transfer',
        reference_number: '',
        notes: '',
    });

    const filteredPayments = payments.filter(payment => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            payment.booking?.booking_number?.toLowerCase().includes(query) ||
            payment.booking?.customer?.full_name?.toLowerCase().includes(query) ||
            payment.reference_number?.toLowerCase().includes(query);

        const matchesMode = modeFilter === 'all' || payment.payment_mode === modeFilter;
        const matchesType = typeFilter === 'all' ||
            (typeFilter === 'received' && payment.amount > 0) ||
            (typeFilter === 'refund' && payment.amount < 0);

        return matchesSearch && matchesMode && matchesType;
    });

    const handleRecordPayment = async () => {
        if (!formData.booking_id || formData.amount <= 0) return;

        setLoading(true);
        const result = await recordPayment({
            booking_id: formData.booking_id,
            amount: formData.amount,
            payment_mode: formData.payment_mode as 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'other',
            reference_number: formData.reference_number || undefined,
            notes: formData.notes || undefined,
        });

        if (result.data) {
            setShowPaymentModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleRecordRefund = async () => {
        if (!formData.booking_id || formData.amount <= 0) return;

        setLoading(true);
        const result = await recordRefund({
            booking_id: formData.booking_id,
            amount: formData.amount,
            payment_mode: formData.payment_mode as 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque' | 'other',
            reference_number: formData.reference_number || undefined,
            notes: formData.notes || undefined,
        });

        if (result.data) {
            setShowRefundModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            booking_id: '',
            amount: 0,
            payment_mode: 'bank_transfer',
            reference_number: '',
            notes: '',
        });
    };

    const handleBookingSelect = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            const balance = booking.total_amount - booking.amount_paid;
            setFormData({
                ...formData,
                booking_id: bookingId,
                amount: balance > 0 ? balance : 0,
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentModeLabel = (mode: string) => {
        return PAYMENT_MODES.find(m => m.value === mode)?.label || mode;
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Payments</h1>
                    <p className="text-secondary text-sm">Track all payments and refunds</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => { resetForm(); setShowRefundModal(true); }}>
                        <RefreshCcw size={18} />
                        Record Refund
                    </Button>
                    <Button onClick={() => { resetForm(); setShowPaymentModal(true); }}>
                        <Plus size={18} />
                        Record Payment
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-success-50 text-success-600">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-success-600">{formatCurrency(stats.totalReceived)}</div>
                                <div className="text-sm text-secondary">Total Received</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-error-50 text-error-600">
                                <TrendingDown size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-error-600">{formatCurrency(stats.totalRefunds)}</div>
                                <div className="text-sm text-secondary">Total Refunds</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-primary-50 text-primary-600">
                                <DollarSign size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatCurrency(stats.netAmount)}</div>
                                <div className="text-sm text-secondary">Net Amount</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-warning-50 text-warning-600">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-warning-600">{formatCurrency(stats.outstanding)}</div>
                                <div className="text-sm text-secondary">Outstanding</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="flex items-center gap-3">
                            <div className="stat-icon bg-gray-100 text-gray-600">
                                <Receipt size={20} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stats.paymentCount}</div>
                                <div className="text-sm text-secondary">Transactions</div>
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
                                    placeholder="Search by booking number, customer, or reference..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'received' | 'refund')}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Types</option>
                            <option value="received">Received</option>
                            <option value="refund">Refunds</option>
                        </Select>
                        <Select
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                            style={{ width: '150px' }}
                        >
                            <option value="all">All Modes</option>
                            {PAYMENT_MODES.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Booking</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Mode</th>
                                <th>Reference</th>
                                <th>Recorded By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">
                                            No payments found. {searchQuery && 'Try adjusting your search.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium">{formatDate(payment.payment_date || payment.created_at)}</div>
                                                <div className="text-sm text-secondary">{formatTime(payment.created_at)}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-mono text-primary-600">
                                                {payment.booking?.booking_number || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium">
                                                {payment.booking?.customer?.full_name || '-'}
                                            </div>
                                            {payment.booking?.destination && (
                                                <div className="text-sm text-secondary">{payment.booking.destination}</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className={`font-bold ${payment.amount >= 0 ? 'text-success-600' : 'text-error-600'}`}>
                                                {payment.amount >= 0 ? '+' : ''}{formatCurrency(payment.amount)}
                                            </div>
                                            {payment.amount < 0 && (
                                                <Badge variant="error">Refund</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <Badge variant="default">{getPaymentModeLabel(payment.payment_mode)}</Badge>
                                        </td>
                                        <td>
                                            <div className="text-sm">
                                                {payment.reference_number || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-sm text-secondary">
                                                {payment.recorded_by_user?.full_name || '-'}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Payment Modal */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Record Payment"
            >
                <div className="form-group">
                    <label className="form-label">Booking *</label>
                    <Select
                        value={formData.booking_id}
                        onChange={(e) => handleBookingSelect(e.target.value)}
                    >
                        <option value="">Select booking</option>
                        {bookings.filter(b => b.total_amount > b.amount_paid).map(b => (
                            <option key={b.id} value={b.id}>
                                {b.booking_number} - {b.customer?.full_name} (Due: {formatCurrency(b.total_amount - b.amount_paid)})
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <Input
                        type="number"
                        min={0}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <Select
                        value={formData.payment_mode}
                        onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    >
                        {PAYMENT_MODES.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </Select>
                </div>
                <div className="form-group">
                    <label className="form-label">Reference Number</label>
                    <Input
                        value={formData.reference_number}
                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                        placeholder="Transaction ID / Cheque number"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                        className="form-textarea"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                    <Button onClick={handleRecordPayment} disabled={loading || !formData.booking_id || formData.amount <= 0}>
                        {loading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </div>
            </Modal>

            {/* Record Refund Modal */}
            <Modal
                isOpen={showRefundModal}
                onClose={() => setShowRefundModal(false)}
                title="Record Refund"
            >
                <div className="form-group">
                    <label className="form-label">Booking *</label>
                    <Select
                        value={formData.booking_id}
                        onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    >
                        <option value="">Select booking</option>
                        {bookings.filter(b => b.amount_paid > 0).map(b => (
                            <option key={b.id} value={b.id}>
                                {b.booking_number} - {b.customer?.full_name} (Paid: {formatCurrency(b.amount_paid)})
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="form-group">
                    <label className="form-label">Refund Amount *</label>
                    <Input
                        type="number"
                        min={0}
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Payment Mode *</label>
                    <Select
                        value={formData.payment_mode}
                        onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    >
                        {PAYMENT_MODES.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </Select>
                </div>
                <div className="form-group">
                    <label className="form-label">Reference Number</label>
                    <Input
                        value={formData.reference_number}
                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                        placeholder="Transaction ID"
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Reason / Notes</label>
                    <textarea
                        className="form-textarea"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Reason for refund"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowRefundModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleRecordRefund} disabled={loading || !formData.booking_id || formData.amount <= 0}>
                        {loading ? 'Recording...' : 'Record Refund'}
                    </Button>
                </div>
            </Modal>

            <style jsx>{`
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
