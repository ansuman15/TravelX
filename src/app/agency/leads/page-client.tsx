'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Filter,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    MoreVertical,
    UserPlus,
    MessageSquare,
    CheckCircle,
    XCircle,
    ArrowUpDown,
} from 'lucide-react';
import { Badge, Button, Input, Select } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { createLead, updateLead, updateLeadStatus, assignLead } from '@/lib/actions/leads';

interface Lead {
    id: string;
    source: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    destination: string | null;
    travel_start: string | null;
    travel_end: string | null;
    adults: number;
    children: number;
    budget_range: string | null;
    message: string | null;
    status: string;
    priority: string;
    assigned_to: string | null;
    assigned_user?: { id: string; full_name: string } | null;
    created_at: string;
}

interface Staff {
    id: string;
    full_name: string;
    role: string;
}

interface LeadsPageClientProps {
    initialLeads: Lead[];
    staff: Staff[];
    currentUserId: string;
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New', color: 'info' },
    { value: 'contacted', label: 'Contacted', color: 'warning' },
    { value: 'quoted', label: 'Quoted', color: 'primary' },
    { value: 'negotiating', label: 'Negotiating', color: 'warning' },
    { value: 'booked', label: 'Booked', color: 'success' },
    { value: 'lost', label: 'Lost', color: 'error' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

const SOURCE_OPTIONS = [
    { value: 'website', label: 'Website' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'meta_ads', label: 'Meta Ads' },
    { value: 'call', label: 'Phone Call' },
    { value: 'referral', label: 'Referral' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'other', label: 'Other' },
];

export function LeadsPageClient({ initialLeads, staff, currentUserId }: LeadsPageClientProps) {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        source: 'website',
        destination: '',
        travel_start: '',
        travel_end: '',
        adults: 1,
        children: 0,
        budget_range: '',
        message: '',
        priority: 'medium',
        assigned_to: '',
    });

    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone?.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleCreateLead = async () => {
        setLoading(true);
        const result = await createLead({
            ...formData,
            source: formData.source as 'website' | 'google_ads' | 'meta_ads' | 'call' | 'referral' | 'walk_in' | 'other',
            priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
            assigned_to: formData.assigned_to || undefined,
        });

        if (result.data) {
            setShowCreateModal(false);
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                source: 'website',
                destination: '',
                travel_start: '',
                travel_end: '',
                adults: 1,
                children: 0,
                budget_range: '',
                message: '',
                priority: 'medium',
                assigned_to: '',
            });
            router.refresh();
        }
        setLoading(false);
    };

    const handleStatusChange = async (leadId: string, newStatus: string) => {
        const result = await updateLeadStatus(
            leadId,
            newStatus as 'new' | 'contacted' | 'quoted' | 'negotiating' | 'booked' | 'lost'
        );
        if (result.data) {
            router.refresh();
        }
    };

    const handleAssign = async (leadId: string, userId: string) => {
        const result = await assignLead(leadId, userId);
        if (result.data) {
            router.refresh();
        }
    };

    const getStatusBadge = (status: string) => {
        const statusOption = STATUS_OPTIONS.find(s => s.value === status);
        return (
            <Badge variant={statusOption?.color as 'success' | 'warning' | 'error' | 'info' | 'primary' || 'default'}>
                {statusOption?.label || status}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            low: 'default',
            medium: 'info',
            high: 'warning',
            urgent: 'error',
        };
        return (
            <Badge variant={colors[priority] as 'success' | 'warning' | 'error' | 'info' || 'default'}>
                {priority}
            </Badge>
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

    return (
        <div className="page-content">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Leads & Enquiries</h1>
                    <p className="text-secondary text-sm">Manage your sales pipeline</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Add Lead
                </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-6 gap-4 mb-6">
                {STATUS_OPTIONS.map(status => {
                    const count = leads.filter(l => l.status === status.value).length;
                    return (
                        <div
                            key={status.value}
                            className={`card cursor-pointer ${statusFilter === status.value ? 'ring-2 ring-primary-500' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
                        >
                            <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="text-2xl font-bold">{count}</div>
                                <div className="text-sm text-secondary">{status.label}</div>
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
                                    placeholder="Search by name, destination, email, phone..."
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

            {/* Leads Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Lead</th>
                                <th>Destination</th>
                                <th>Travel Dates</th>
                                <th>Travelers</th>
                                <th>Budget</th>
                                <th>Source</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
                                        <div className="text-secondary">
                                            No leads found. {searchQuery && 'Try adjusting your search.'}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td>
                                            <div>
                                                <div className="font-medium">{lead.full_name}</div>
                                                <div className="text-sm text-secondary flex items-center gap-2">
                                                    {lead.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} /> {lead.phone}
                                                        </span>
                                                    )}
                                                </div>
                                                {lead.email && (
                                                    <div className="text-sm text-secondary flex items-center gap-1">
                                                        <Mail size={12} /> {lead.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-secondary" />
                                                {lead.destination || '-'}
                                            </div>
                                        </td>
                                        <td>
                                            {lead.travel_start ? (
                                                <div className="text-sm">
                                                    <div>{formatDate(lead.travel_start)}</div>
                                                    <div className="text-secondary">to {formatDate(lead.travel_end)}</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <Users size={14} className="text-secondary" />
                                                {lead.adults}A {lead.children > 0 && `+ ${lead.children}C`}
                                            </div>
                                        </td>
                                        <td>
                                            {lead.budget_range ? (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign size={14} className="text-secondary" />
                                                    {lead.budget_range}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <Badge variant="default">
                                                {SOURCE_OPTIONS.find(s => s.value === lead.source)?.label || lead.source}
                                            </Badge>
                                        </td>
                                        <td>{getStatusBadge(lead.status)}</td>
                                        <td>{getPriorityBadge(lead.priority)}</td>
                                        <td>
                                            <Select
                                                value={lead.assigned_to || ''}
                                                onChange={(e) => handleAssign(lead.id, e.target.value)}
                                                style={{ width: '140px', fontSize: '12px' }}
                                            >
                                                <option value="">Unassigned</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.id}>{s.full_name}</option>
                                                ))}
                                            </Select>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Select
                                                    value={lead.status}
                                                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                    style={{ width: '120px', fontSize: '12px' }}
                                                >
                                                    {STATUS_OPTIONS.map(s => (
                                                        <option key={s.value} value={s.value}>{s.label}</option>
                                                    ))}
                                                </Select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Lead Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Add New Lead"
                size="lg"
            >
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
                        <label className="form-label">Source</label>
                        <Select
                            value={formData.source}
                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        >
                            {SOURCE_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
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
                        <label className="form-label">Travel Start Date</label>
                        <Input
                            type="date"
                            value={formData.travel_start}
                            onChange={(e) => setFormData({ ...formData, travel_start: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Travel End Date</label>
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
                        <label className="form-label">Budget Range</label>
                        <Input
                            value={formData.budget_range}
                            onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                            placeholder="e.g., ₹1,50,000 - ₹2,00,000"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <Select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            {PRIORITY_OPTIONS.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </Select>
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
                        <label className="form-label">Notes / Requirements</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Enter any additional notes or requirements..."
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateLead} disabled={loading || !formData.full_name}>
                        {loading ? 'Creating...' : 'Create Lead'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
