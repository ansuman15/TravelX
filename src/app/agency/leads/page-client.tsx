'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Phone,
    Mail,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    UserPlus,
    LayoutGrid,
    List,
    Columns3,
    ChevronRight,
    Clock,
    TrendingUp,
    Target,
    Sparkles,
    Globe,
    MessageSquare,
    ArrowRight,
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
    { value: 'new', label: 'New', color: '#3b82f6', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { value: 'contacted', label: 'Contacted', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { value: 'quoted', label: 'Quoted', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { value: 'negotiating', label: 'Negotiating', color: '#ec4899', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { value: 'booked', label: 'Booked', color: '#10b981', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
    { value: 'lost', label: 'Lost', color: '#ef4444', gradient: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#94a3b8' },
    { value: 'medium', label: 'Medium', color: '#3b82f6' },
    { value: 'high', label: 'High', color: '#f59e0b' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

const SOURCE_OPTIONS = [
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'google_ads', label: 'Google Ads', icon: Target },
    { value: 'meta_ads', label: 'Meta Ads', icon: Sparkles },
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'referral', label: 'Referral', icon: Users },
    { value: 'walk_in', label: 'Walk-in', icon: UserPlus },
    { value: 'other', label: 'Other', icon: MessageSquare },
];

type ViewMode = 'kanban' | 'table' | 'cards';

export function LeadsPageClient({ initialLeads, staff, currentUserId }: LeadsPageClientProps) {
    const router = useRouter();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<ViewMode>('kanban');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(false);
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

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

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const matchesSearch =
                lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.phone?.includes(searchQuery);

            const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leads, searchQuery, statusFilter]);

    // Group leads by status for Kanban
    const leadsByStatus = useMemo(() => {
        return STATUS_OPTIONS.reduce((acc, status) => {
            acc[status.value] = filteredLeads.filter(l => l.status === status.value);
            return acc;
        }, {} as Record<string, Lead[]>);
    }, [filteredLeads]);

    // Stats calculations
    const stats = useMemo(() => {
        const total = leads.length;
        const newLeads = leads.filter(l => l.status === 'new').length;
        const booked = leads.filter(l => l.status === 'booked').length;
        const conversionRate = total > 0 ? ((booked / total) * 100).toFixed(1) : '0';
        return { total, newLeads, booked, conversionRate };
    }, [leads]);

    const resetForm = () => {
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
    };

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
            resetForm();
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

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, lead: Lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        if (draggedLead && draggedLead.status !== targetStatus) {
            await handleStatusChange(draggedLead.id, targetStatus);
        }
        setDraggedLead(null);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return formatDate(dateStr);
    };

    const openDetailModal = (lead: Lead) => {
        setSelectedLead(lead);
        setShowDetailModal(true);
    };

    const getPriorityColor = (priority: string) => {
        return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#94a3b8';
    };

    const getSourceIcon = (source: string) => {
        const SourceIcon = SOURCE_OPTIONS.find(s => s.value === source)?.icon || Globe;
        return <SourceIcon size={12} />;
    };

    return (
        <>
            <style jsx global>{`
                .leads-page {
                    min-height: 100%;
                }
                
                /* Modern Stats Cards */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }
                
                .stat-card {
                    position: relative;
                    padding: 1.25rem;
                    border-radius: 16px;
                    background: white;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
                }
                
                .stat-card-gradient {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    filter: blur(40px);
                    opacity: 0.4;
                }
                
                .stat-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    color: white;
                }
                
                .stat-card-value {
                    font-size: 2rem;
                    font-weight: 700;
                    line-height: 1;
                    margin-bottom: 0.25rem;
                    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .stat-card-label {
                    font-size: 0.875rem;
                    color: #64748b;
                    font-weight: 500;
                }
                
                /* View Toggle */
                .view-toggle {
                    display: flex;
                    background: #f1f5f9;
                    border-radius: 10px;
                    padding: 4px;
                    gap: 2px;
                }
                
                .view-toggle-btn {
                    padding: 8px 12px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    transition: all 0.2s;
                }
                
                .view-toggle-btn:hover {
                    color: #1e293b;
                }
                
                .view-toggle-btn.active {
                    background: white;
                    color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }
                
                /* Status Pills */
                .status-pills {
                    display: flex;
                    gap: 8px;
                    overflow-x: auto;
                    padding: 4px 0;
                    margin-bottom: 1rem;
                }
                
                .status-pill {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: 2px solid transparent;
                    background: #f8fafc;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                
                .status-pill:hover {
                    background: #f1f5f9;
                }
                
                .status-pill.active {
                    background: white;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                }
                
                .status-pill-count {
                    min-width: 24px;
                    height: 24px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: white;
                }
                
                /* Kanban Board */
                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 1rem;
                    min-height: 600px;
                }
                
                .kanban-column {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 1rem;
                    min-height: 500px;
                    transition: all 0.2s;
                }
                
                .kanban-column.drag-over {
                    background: #e0f2fe;
                    border: 2px dashed #3b82f6;
                }
                
                .kanban-column-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 2px solid;
                }
                
                .kanban-column-title {
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                .kanban-column-count {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 700;
                    color: white;
                }
                
                .kanban-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                /* Lead Card */
                .lead-card {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: grab;
                    border-left: 4px solid;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .lead-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
                
                .lead-card:active {
                    cursor: grabbing;
                }
                
                .lead-card.dragging {
                    opacity: 0.5;
                    transform: rotate(3deg);
                }
                
                .lead-card-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                }
                
                .lead-card-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                .lead-card-name {
                    font-weight: 600;
                    font-size: 0.9375rem;
                    color: #1e293b;
                    margin-bottom: 2px;
                }
                
                .lead-card-contact {
                    font-size: 0.75rem;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .lead-card-body {
                    margin-bottom: 0.75rem;
                }
                
                .lead-card-destination {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8125rem;
                    font-weight: 500;
                    color: #334155;
                    margin-bottom: 0.5rem;
                }
                
                .lead-card-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    font-size: 0.75rem;
                    color: #64748b;
                }
                
                .lead-card-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .lead-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 0.75rem;
                    border-top: 1px solid #f1f5f9;
                }
                
                .lead-card-source {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.6875rem;
                    color: #94a3b8;
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }
                
                .lead-card-time {
                    font-size: 0.6875rem;
                    color: #94a3b8;
                }
                
                .lead-card-priority {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                
                /* Search Bar */
                .search-container {
                    position: relative;
                    flex: 1;
                }
                
                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 44px;
                    border-radius: 12px;
                    border: 2px solid #e2e8f0;
                    font-size: 14px;
                    transition: all 0.2s;
                    background: white;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }
                
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }
                
                /* Add Button */
                .add-lead-btn {
                    padding: 12px 24px;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
                }
                
                .add-lead-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
                }
                
                /* Empty State */
                .empty-column {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    color: #94a3b8;
                    text-align: center;
                }
                
                .empty-column-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 0.75rem;
                }
                
                /* Budget Tag */
                .budget-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px;
                    border-radius: 6px;
                    background: #ecfdf5;
                    color: #059669;
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                @media (max-width: 1400px) {
                    .kanban-board {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                @media (max-width: 900px) {
                    .kanban-board {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>

            <div className="leads-page">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                            Leads & Enquiries
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
                            Manage your sales pipeline with {leads.length} active leads
                        </p>
                    </div>
                    <button className="add-lead-btn" onClick={() => { resetForm(); setShowCreateModal(true); }}>
                        <Plus size={18} />
                        Add Lead
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-gradient" style={{ background: '#3b82f6' }} />
                        <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                            <Users size={22} />
                        </div>
                        <div className="stat-card-value">{stats.total}</div>
                        <div className="stat-card-label">Total Leads</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-gradient" style={{ background: '#8b5cf6' }} />
                        <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Sparkles size={22} />
                        </div>
                        <div className="stat-card-value">{stats.newLeads}</div>
                        <div className="stat-card-label">New This Week</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-gradient" style={{ background: '#10b981' }} />
                        <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <Target size={22} />
                        </div>
                        <div className="stat-card-value">{stats.booked}</div>
                        <div className="stat-card-label">Converted</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-card-gradient" style={{ background: '#f59e0b' }} />
                        <div className="stat-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                            <TrendingUp size={22} />
                        </div>
                        <div className="stat-card-value">{stats.conversionRate}%</div>
                        <div className="stat-card-label">Conversion Rate</div>
                    </div>
                </div>

                {/* Filters & View Toggle */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search leads by name, destination, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            <Columns3 size={16} />
                            Kanban
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <List size={16} />
                            Table
                        </button>
                        <button
                            className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                        >
                            <LayoutGrid size={16} />
                            Cards
                        </button>
                    </div>
                </div>

                {/* Status Pills */}
                <div className="status-pills">
                    <button
                        className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                        style={{ borderColor: statusFilter === 'all' ? '#3b82f6' : 'transparent' }}
                    >
                        All Leads
                        <span className="status-pill-count" style={{ background: '#64748b' }}>
                            {leads.length}
                        </span>
                    </button>
                    {STATUS_OPTIONS.map(status => {
                        const count = leads.filter(l => l.status === status.value).length;
                        return (
                            <button
                                key={status.value}
                                className={`status-pill ${statusFilter === status.value ? 'active' : ''}`}
                                onClick={() => setStatusFilter(statusFilter === status.value ? 'all' : status.value)}
                                style={{
                                    borderColor: statusFilter === status.value ? status.color : 'transparent',
                                    color: status.color
                                }}
                            >
                                {status.label}
                                <span className="status-pill-count" style={{ background: status.color }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Kanban Board */}
                {viewMode === 'kanban' && (
                    <div className="kanban-board">
                        {STATUS_OPTIONS.map(status => (
                            <div
                                key={status.value}
                                className="kanban-column"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, status.value)}
                            >
                                <div className="kanban-column-header" style={{ borderColor: status.color }}>
                                    <span className="kanban-column-title" style={{ color: status.color }}>
                                        {status.label}
                                    </span>
                                    <span className="kanban-column-count" style={{ background: status.color }}>
                                        {leadsByStatus[status.value]?.length || 0}
                                    </span>
                                </div>

                                <div className="kanban-cards">
                                    {leadsByStatus[status.value]?.length === 0 ? (
                                        <div className="empty-column">
                                            <div className="empty-column-icon">
                                                <UserPlus size={20} />
                                            </div>
                                            <span style={{ fontSize: '0.8125rem' }}>No leads here</span>
                                        </div>
                                    ) : (
                                        leadsByStatus[status.value]?.map(lead => (
                                            <div
                                                key={lead.id}
                                                className={`lead-card ${draggedLead?.id === lead.id ? 'dragging' : ''}`}
                                                style={{ borderLeftColor: getPriorityColor(lead.priority) }}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead)}
                                                onClick={() => openDetailModal(lead)}
                                            >
                                                <div className="lead-card-header">
                                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                        <div className="lead-card-avatar">
                                                            {lead.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="lead-card-name">{lead.full_name}</div>
                                                            {lead.phone && (
                                                                <div className="lead-card-contact">
                                                                    <Phone size={10} />
                                                                    {lead.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="lead-card-priority"
                                                        style={{ background: getPriorityColor(lead.priority) }}
                                                        title={lead.priority}
                                                    />
                                                </div>

                                                <div className="lead-card-body">
                                                    {lead.destination && (
                                                        <div className="lead-card-destination">
                                                            <MapPin size={14} style={{ color: '#3b82f6' }} />
                                                            {lead.destination}
                                                        </div>
                                                    )}

                                                    <div className="lead-card-meta">
                                                        {lead.travel_start && (
                                                            <div className="lead-card-meta-item">
                                                                <Calendar size={12} />
                                                                {formatDate(lead.travel_start)}
                                                            </div>
                                                        )}
                                                        <div className="lead-card-meta-item">
                                                            <Users size={12} />
                                                            {lead.adults}A {lead.children > 0 && `+ ${lead.children}C`}
                                                        </div>
                                                        {lead.budget_range && (
                                                            <span className="budget-tag">
                                                                <DollarSign size={10} />
                                                                {lead.budget_range}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="lead-card-footer">
                                                    <div className="lead-card-source">
                                                        {getSourceIcon(lead.source)}
                                                        {SOURCE_OPTIONS.find(s => s.value === lead.source)?.label}
                                                    </div>
                                                    <div className="lead-card-time">
                                                        {formatRelativeTime(lead.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
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
                                            <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => openDetailModal(lead)}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div className="lead-card-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                            {lead.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{lead.full_name}</div>
                                                            <div className="text-sm text-secondary">{lead.phone || lead.email}</div>
                                                        </div>
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
                                                            {formatDate(lead.travel_start)} - {formatDate(lead.travel_end)}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td>{lead.adults}A {lead.children > 0 && `+ ${lead.children}C`}</td>
                                                <td>{lead.budget_range || '-'}</td>
                                                <td>
                                                    <Badge variant="default">
                                                        {SOURCE_OPTIONS.find(s => s.value === lead.source)?.label}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '4px 10px',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            background: STATUS_OPTIONS.find(s => s.value === lead.status)?.color,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        color: getPriorityColor(lead.priority),
                                                        fontWeight: 500,
                                                        fontSize: '0.8125rem'
                                                    }}>
                                                        <span style={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            background: getPriorityColor(lead.priority)
                                                        }} />
                                                        {PRIORITY_OPTIONS.find(p => p.value === lead.priority)?.label}
                                                    </span>
                                                </td>
                                                <td onClick={e => e.stopPropagation()}>
                                                    <Select
                                                        value={lead.assigned_to || ''}
                                                        onChange={(e) => handleAssign(lead.id, e.target.value)}
                                                        style={{ width: '130px', fontSize: '12px' }}
                                                    >
                                                        <option value="">Unassigned</option>
                                                        {staff.map(s => (
                                                            <option key={s.id} value={s.id}>{s.full_name}</option>
                                                        ))}
                                                    </Select>
                                                </td>
                                                <td onClick={e => e.stopPropagation()}>
                                                    <Select
                                                        value={lead.status}
                                                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                        style={{ width: '120px', fontSize: '12px' }}
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </Select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Cards View */}
                {viewMode === 'cards' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                        {filteredLeads.length === 0 ? (
                            <div className="card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                                <UserPlus size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                                <div className="text-secondary">No leads found.</div>
                            </div>
                        ) : (
                            filteredLeads.map(lead => (
                                <div
                                    key={lead.id}
                                    className="lead-card"
                                    style={{ borderLeftColor: getPriorityColor(lead.priority), cursor: 'pointer' }}
                                    onClick={() => openDetailModal(lead)}
                                >
                                    <div className="lead-card-header">
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div className="lead-card-avatar">
                                                {lead.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="lead-card-name">{lead.full_name}</div>
                                                {lead.phone && (
                                                    <div className="lead-card-contact">
                                                        <Phone size={10} />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 10px',
                                                borderRadius: '9999px',
                                                fontSize: '0.6875rem',
                                                fontWeight: 600,
                                                background: STATUS_OPTIONS.find(s => s.value === lead.status)?.color,
                                                color: 'white'
                                            }}
                                        >
                                            {STATUS_OPTIONS.find(s => s.value === lead.status)?.label}
                                        </span>
                                    </div>

                                    <div className="lead-card-body">
                                        {lead.destination && (
                                            <div className="lead-card-destination">
                                                <MapPin size={14} style={{ color: '#3b82f6' }} />
                                                {lead.destination}
                                            </div>
                                        )}

                                        <div className="lead-card-meta">
                                            {lead.travel_start && (
                                                <div className="lead-card-meta-item">
                                                    <Calendar size={12} />
                                                    {formatDate(lead.travel_start)} - {formatDate(lead.travel_end)}
                                                </div>
                                            )}
                                            <div className="lead-card-meta-item">
                                                <Users size={12} />
                                                {lead.adults}A {lead.children > 0 && `+ ${lead.children}C`}
                                            </div>
                                        </div>

                                        {lead.budget_range && (
                                            <span className="budget-tag" style={{ marginTop: '0.5rem' }}>
                                                <DollarSign size={10} />
                                                {lead.budget_range}
                                            </span>
                                        )}
                                    </div>

                                    <div className="lead-card-footer">
                                        <div className="lead-card-source">
                                            {getSourceIcon(lead.source)}
                                            {SOURCE_OPTIONS.find(s => s.value === lead.source)?.label}
                                        </div>
                                        <div className="lead-card-time">
                                            {formatRelativeTime(lead.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Detail Modal */}
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    title="Lead Details"
                    size="lg"
                >
                    {selectedLead && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="lead-card-avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
                                    {selectedLead.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>
                                        {selectedLead.full_name}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                        {selectedLead.phone && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={14} /> {selectedLead.phone}
                                            </span>
                                        )}
                                        {selectedLead.email && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Mail size={14} /> {selectedLead.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Destination</div>
                                    <div className="font-medium">{selectedLead.destination || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Travel Dates</div>
                                    <div className="font-medium">
                                        {selectedLead.travel_start
                                            ? `${formatDate(selectedLead.travel_start)} - ${formatDate(selectedLead.travel_end)}`
                                            : '-'
                                        }
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Travelers</div>
                                    <div className="font-medium">{selectedLead.adults} Adults, {selectedLead.children} Children</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Budget</div>
                                    <div className="font-medium">{selectedLead.budget_range || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Source</div>
                                    <div className="font-medium">{SOURCE_OPTIONS.find(s => s.value === selectedLead.source)?.label}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Assigned To</div>
                                    <div className="font-medium">{selectedLead.assigned_user?.full_name || 'Unassigned'}</div>
                                </div>
                            </div>

                            {selectedLead.message && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div className="text-sm text-secondary" style={{ marginBottom: '4px' }}>Notes / Requirements</div>
                                    <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.875rem' }}>
                                        {selectedLead.message}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <Select
                                    value={selectedLead.status}
                                    onChange={(e) => {
                                        handleStatusChange(selectedLead.id, e.target.value);
                                        setShowDetailModal(false);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </Select>
                                <Select
                                    value={selectedLead.assigned_to || ''}
                                    onChange={(e) => {
                                        handleAssign(selectedLead.id, e.target.value);
                                        setShowDetailModal(false);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">Assign to...</option>
                                    {staff.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    )}
                </Modal>

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
        </>
    );
}
