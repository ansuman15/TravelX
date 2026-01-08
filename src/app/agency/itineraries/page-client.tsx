'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    MapPin,
    Calendar,
    Copy,
    Edit2,
    Trash2,
    Eye,
    FileText,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

interface Itinerary {
    id: string;
    name: string;
    destination: string;
    days: number;
    status: 'active' | 'draft';
    created_at: string;
    used_count: number;
}

interface ItinerariesPageClientProps {
    itineraries: Itinerary[];
}

export function ItinerariesPageClient({ itineraries }: ItinerariesPageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItinerary, setNewItinerary] = useState({ name: '', destination: '', days: 5 });

    const filteredItineraries = itineraries.filter(itinerary =>
        itinerary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itinerary.destination.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        // TODO: Implement itinerary creation
        setShowCreateModal(false);
        setNewItinerary({ name: '', destination: '', days: 5 });
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Itineraries</h1>
                    <p className="text-secondary text-sm">Create and manage travel itinerary templates</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Create Itinerary
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">{itineraries.length}</div>
                        <div className="text-sm text-secondary">Total Itineraries</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold text-success-600">
                            {itineraries.filter(i => i.status === 'active').length}
                        </div>
                        <div className="text-sm text-secondary">Active</div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-body" style={{ padding: 'var(--spacing-4)' }}>
                        <div className="text-2xl font-bold">
                            {itineraries.reduce((sum, i) => sum + i.used_count, 0)}
                        </div>
                        <div className="text-sm text-secondary">Times Used</div>
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
                            placeholder="Search itineraries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>
            </div>

            {/* Itinerary Cards */}
            <div className="itinerary-grid">
                {filteredItineraries.length === 0 ? (
                    <div className="empty-state">
                        <FileText size={48} />
                        <p>No itineraries found</p>
                        <Button variant="ghost" onClick={() => setShowCreateModal(true)}>
                            Create your first itinerary
                        </Button>
                    </div>
                ) : (
                    filteredItineraries.map(itinerary => (
                        <div key={itinerary.id} className="itinerary-card">
                            <div className="itinerary-header">
                                <div className="itinerary-icon">
                                    <MapPin size={20} />
                                </div>
                                <Badge variant={itinerary.status === 'active' ? 'success' : 'gray'}>
                                    {itinerary.status}
                                </Badge>
                            </div>

                            <h3 className="itinerary-name">{itinerary.name}</h3>
                            <p className="itinerary-destination">{itinerary.destination}</p>

                            <div className="itinerary-meta">
                                <span>
                                    <Calendar size={14} />
                                    {itinerary.days} Days
                                </span>
                                <span>Used {itinerary.used_count} times</span>
                            </div>

                            <div className="itinerary-actions">
                                <Button variant="ghost" size="sm">
                                    <Eye size={14} />
                                    View
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Edit2 size={14} />
                                    Edit
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <Copy size={14} />
                                    Clone
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Itinerary"
            >
                <div className="form-group">
                    <label className="form-label">Itinerary Name *</label>
                    <Input
                        value={newItinerary.name}
                        onChange={(e) => setNewItinerary({ ...newItinerary, name: e.target.value })}
                        placeholder="e.g., Bali Adventure - 5 Days"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="form-label">Destination</label>
                        <Input
                            value={newItinerary.destination}
                            onChange={(e) => setNewItinerary({ ...newItinerary, destination: e.target.value })}
                            placeholder="e.g., Bali, Indonesia"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Duration (Days)</label>
                        <Input
                            type="number"
                            min={1}
                            value={newItinerary.days}
                            onChange={(e) => setNewItinerary({ ...newItinerary, days: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={!newItinerary.name}>
                        Create Itinerary
                    </Button>
                </div>
            </Modal>

            <style jsx>{`
                .itinerary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: var(--spacing-4);
                }
                .itinerary-card {
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-5);
                    transition: all 0.2s ease;
                }
                .itinerary-card:hover {
                    border-color: var(--primary-200);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .itinerary-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-3);
                }
                .itinerary-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--primary-50);
                    color: var(--primary-600);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .itinerary-name {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 var(--spacing-1);
                }
                .itinerary-destination {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin: 0 0 var(--spacing-3);
                }
                .itinerary-meta {
                    display: flex;
                    gap: var(--spacing-4);
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-bottom: var(--spacing-4);
                    padding-bottom: var(--spacing-3);
                    border-bottom: 1px solid var(--border-light);
                }
                .itinerary-meta span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .itinerary-actions {
                    display: flex;
                    gap: var(--spacing-1);
                }
                .empty-state {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-8);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-xl);
                    color: var(--text-tertiary);
                    gap: var(--spacing-3);
                }
            `}</style>
        </div>
    );
}
