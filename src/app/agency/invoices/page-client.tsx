'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    FileText,
    Download,
    Send,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    Printer,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { createInvoice, issueInvoice, markInvoicePaid } from '@/lib/actions/bookings';

interface Invoice {
    id: string;
    invoice_number: string;
    amount: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    due_date: string | null;
    issued_at: string | null;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
    booking?: {
        id: string;
        booking_number: string;
        total_amount: number;
        destination: string | null;
        customer?: { id: string; full_name: string; email: string | null; phone: string | null } | null;
    } | null;
    created_by_user?: { id: string; full_name: string } | null;
}

interface Booking {
    id: string;
    booking_number: string;
    total_amount: number;
    amount_paid: number;
    destination: string | null;
    customer?: { id: string; full_name: string; email: string | null; phone: string | null } | null;
}

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

interface InvoicesPageClientProps {
    initialInvoices: Invoice[];
    bookings: Booking[];
    agency: Agency | null;
    currentUserId: string;
}

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft', color: 'gray', icon: FileText },
    { value: 'issued', label: 'Issued', color: 'primary', icon: Send },
    { value: 'paid', label: 'Paid', color: 'success', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'error', icon: XCircle },
];

export function InvoicesPageClient({
    initialInvoices,
    bookings,
    agency,
    currentUserId
}: InvoicesPageClientProps) {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        booking_id: '',
        amount: 0,
        tax_amount: 0,
        due_date: '',
        notes: '',
    });

    const filteredInvoices = invoices.filter(invoice => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            invoice.invoice_number?.toLowerCase().includes(query) ||
            invoice.booking?.booking_number?.toLowerCase().includes(query) ||
            invoice.booking?.customer?.full_name?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleCreateInvoice = async () => {
        if (!formData.booking_id || formData.amount <= 0) return;

        setLoading(true);
        const result = await createInvoice({
            booking_id: formData.booking_id,
            amount: formData.amount,
            tax_amount: formData.tax_amount,
            due_date: formData.due_date || undefined,
            notes: formData.notes || undefined,
        });

        if (result.data) {
            setShowCreateModal(false);
            resetForm();
            router.refresh();
        }
        setLoading(false);
    };

    const handleIssueInvoice = async (invoiceId: string) => {
        const result = await issueInvoice(invoiceId);
        if (result.data) {
            router.refresh();
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        const result = await markInvoicePaid(invoiceId);
        if (result.data) {
            router.refresh();
        }
    };

    const resetForm = () => {
        setFormData({
            booking_id: '',
            amount: 0,
            tax_amount: 0,
            due_date: '',
            notes: '',
        });
    };

    const handleBookingSelect = (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            const gstRate = 0.18;
            const baseAmount = booking.total_amount;
            const taxAmount = Math.round(baseAmount * gstRate);
            setFormData({
                ...formData,
                booking_id: bookingId,
                amount: baseAmount,
                tax_amount: taxAmount,
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

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        const Icon = statusOption?.icon || Clock;
        return (
            <Badge variant={statusOption?.color as 'success' | 'warning' | 'error' | 'primary' | 'gray' || 'default'}>
                <Icon size={12} style={{ marginRight: '4px' }} />
                {statusOption?.label || status}
            </Badge>
        );
    };

    const openPreview = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowPreviewModal(true);
    };

    // Stats
    const draftCount = invoices.filter(i => i.status === 'draft').length;
    const issuedCount = invoices.filter(i => i.status === 'issued').length;
    const paidCount = invoices.filter(i => i.status === 'paid').length;
    const totalIssued = invoices.filter(i => i.status !== 'draft' && i.status !== 'cancelled').reduce((sum, i) => sum + i.total_amount, 0);

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Invoices</h1>
                    <p className="text-secondary text-sm">Generate and manage customer invoices</p>
                </div>
                <Button onClick={() => { resetForm(); setShowCreateModal(true); }}>
                    <Plus size={18} />
                    Create Invoice
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{draftCount}</div>
                        <div className="text-sm text-secondary">Draft</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-primary-600">{issuedCount}</div>
                        <div className="text-sm text-secondary">Issued</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-success-600">{paidCount}</div>
                        <div className="text-sm text-secondary">Paid</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{formatCurrency(totalIssued)}</div>
                        <div className="text-sm text-secondary">Total Invoiced</div>
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
                                    placeholder="Search by invoice number, booking, or customer..."
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
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Booking</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Tax</th>
                                <th>Total</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">No invoices found.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id}>
                                        <td>
                                            <div className="font-mono font-medium text-primary-600">
                                                {invoice.invoice_number}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-mono text-sm">
                                                {invoice.booking?.booking_number || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium">{invoice.booking?.customer?.full_name || '-'}</div>
                                        </td>
                                        <td>{formatCurrency(invoice.amount)}</td>
                                        <td>{formatCurrency(invoice.tax_amount)}</td>
                                        <td>
                                            <div className="font-bold">{formatCurrency(invoice.total_amount)}</div>
                                        </td>
                                        <td>{formatDate(invoice.due_date)}</td>
                                        <td>{getStatusBadge(invoice.status)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => openPreview(invoice)}>
                                                    <Eye size={14} />
                                                </Button>
                                                {invoice.status === 'draft' && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleIssueInvoice(invoice.id)}>
                                                        <Send size={14} />
                                                    </Button>
                                                )}
                                                {invoice.status === 'issued' && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleMarkPaid(invoice.id)}>
                                                        <CheckCircle size={14} />
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

            {/* Create Invoice Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create Invoice"
            >
                <div className="form-group">
                    <label className="form-label">Booking *</label>
                    <Select
                        value={formData.booking_id}
                        onChange={(e) => handleBookingSelect(e.target.value)}
                    >
                        <option value="">Select booking</option>
                        {bookings.map(b => (
                            <option key={b.id} value={b.id}>
                                {b.booking_number} - {b.customer?.full_name} ({formatCurrency(b.total_amount)})
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <label className="form-label">Tax (GST)</label>
                        <Input
                            type="number"
                            min={0}
                            value={formData.tax_amount}
                            onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Total</label>
                    <div className="text-2xl font-bold">{formatCurrency(formData.amount + formData.tax_amount)}</div>
                </div>
                <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
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
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button onClick={handleCreateInvoice} disabled={loading || !formData.booking_id || formData.amount <= 0}>
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </Button>
                </div>
            </Modal>

            {/* Invoice Preview Modal */}
            <Modal
                isOpen={showPreviewModal}
                onClose={() => setShowPreviewModal(false)}
                title={`Invoice ${selectedInvoice?.invoice_number}`}
                size="lg"
            >
                {selectedInvoice && (
                    <div className="invoice-preview">
                        {/* Invoice Header */}
                        <div className="invoice-header">
                            <div>
                                <h2 className="text-2xl font-bold">{agency?.name || 'Your Agency'}</h2>
                                <p className="text-secondary text-sm">{agency?.address}</p>
                                <p className="text-secondary text-sm">{agency?.city}</p>
                                {agency?.gst_number && <p className="text-sm">GSTIN: {agency.gst_number}</p>}
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary-600">{selectedInvoice.invoice_number}</div>
                                <div className="text-sm text-secondary">Date: {formatDate(selectedInvoice.created_at)}</div>
                                {selectedInvoice.due_date && (
                                    <div className="text-sm text-secondary">Due: {formatDate(selectedInvoice.due_date)}</div>
                                )}
                                {getStatusBadge(selectedInvoice.status)}
                            </div>
                        </div>

                        {/* Bill To */}
                        <div className="invoice-section">
                            <h3 className="text-sm text-secondary mb-2">BILL TO</h3>
                            <div className="font-medium">{selectedInvoice.booking?.customer?.full_name}</div>
                            {selectedInvoice.booking?.customer?.email && <div className="text-sm">{selectedInvoice.booking.customer.email}</div>}
                            {selectedInvoice.booking?.customer?.phone && <div className="text-sm">{selectedInvoice.booking.customer.phone}</div>}
                        </div>

                        {/* Line Items */}
                        <div className="invoice-table">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th className="text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div>Booking: {selectedInvoice.booking?.booking_number}</div>
                                            <div className="text-sm text-secondary">{selectedInvoice.booking?.destination}</div>
                                        </td>
                                        <td className="text-right">{formatCurrency(selectedInvoice.amount)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="invoice-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(selectedInvoice.amount)}</span>
                            </div>
                            <div className="total-row">
                                <span>Tax (GST 18%)</span>
                                <span>{formatCurrency(selectedInvoice.tax_amount)}</span>
                            </div>
                            <div className="total-row grand-total">
                                <span>Total</span>
                                <span>{formatCurrency(selectedInvoice.total_amount)}</span>
                            </div>
                        </div>

                        {selectedInvoice.notes && (
                            <div className="invoice-notes">
                                <h3 className="text-sm text-secondary mb-2">NOTES</h3>
                                <p>{selectedInvoice.notes}</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="ghost" onClick={() => setShowPreviewModal(false)}>Close</Button>
                            <Button variant="outline" onClick={() => window.print()}>
                                <Printer size={16} />
                                Print
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .invoice-preview {
                    background: white;
                }
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: var(--spacing-6);
                    padding-bottom: var(--spacing-4);
                    border-bottom: 2px solid var(--border-light);
                }
                .invoice-section {
                    margin-bottom: var(--spacing-6);
                }
                .invoice-table {
                    margin-bottom: var(--spacing-6);
                }
                .invoice-totals {
                    max-width: 300px;
                    margin-left: auto;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--spacing-2) 0;
                    border-bottom: 1px solid var(--border-light);
                }
                .total-row.grand-total {
                    font-weight: bold;
                    font-size: var(--font-lg);
                    border-bottom: 2px solid var(--primary-500);
                }
                .invoice-notes {
                    margin-top: var(--spacing-6);
                    padding: var(--spacing-4);
                    background: var(--bg-secondary);
                    border-radius: var(--radius-lg);
                }
            `}</style>
        </div>
    );
}
