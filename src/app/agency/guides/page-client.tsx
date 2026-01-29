'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Star,
    MapPin,
    Phone,
    Mail,
    Globe,
    Award,
    X,
    ChevronRight,
} from 'lucide-react';

interface Guide {
    id: string;
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
    email: string | null;
    languages: string[];
    experience_years: number;
    skills: string[];
    bio: string | null;
    status: 'active' | 'inactive' | 'on_leave';
    rating: number | null;
    total_tours: number;
}

interface GuidesClientProps {
    guides: Guide[];
}

// Sample guides for demo
const sampleGuides: Guide[] = [
    {
        id: '1',
        full_name: 'Rajesh Kumar',
        avatar_url: null,
        phone: '+91 98765 43210',
        email: 'rajesh@travelx.com',
        languages: ['English', 'Hindi', 'Tamil'],
        experience_years: 8,
        skills: ['Cultural Tours', 'Historical Sites', 'Photography'],
        bio: 'Expert in South Indian heritage tours with deep knowledge of temple architecture and local traditions.',
        status: 'active',
        rating: 4.9,
        total_tours: 156,
    },
    {
        id: '2',
        full_name: 'Priya Sharma',
        avatar_url: null,
        phone: '+91 98765 43211',
        email: 'priya@travelx.com',
        languages: ['English', 'Hindi', 'French'],
        experience_years: 5,
        skills: ['Adventure Tours', 'Trekking', 'Wildlife'],
        bio: 'Certified mountaineer and wildlife expert. Specializes in Himalayan treks and tiger safaris.',
        status: 'active',
        rating: 4.7,
        total_tours: 89,
    },
    {
        id: '3',
        full_name: 'Arjun Menon',
        avatar_url: null,
        phone: '+91 98765 43212',
        email: 'arjun@travelx.com',
        languages: ['English', 'Malayalam', 'Hindi'],
        experience_years: 12,
        skills: ['Backwaters', 'Ayurveda Tours', 'Culinary'],
        bio: 'Kerala specialist with expertise in backwater cruises, Ayurveda retreats, and South Indian cuisine.',
        status: 'active',
        rating: 4.8,
        total_tours: 234,
    },
    {
        id: '4',
        full_name: 'Aisha Patel',
        avatar_url: null,
        phone: '+91 98765 43213',
        email: 'aisha@travelx.com',
        languages: ['English', 'Gujarati', 'German'],
        experience_years: 6,
        skills: ['City Tours', 'Shopping', 'Food Tours'],
        bio: 'Urban explorer specializing in city tours, street food adventures, and local shopping experiences.',
        status: 'on_leave',
        rating: 4.6,
        total_tours: 112,
    },
];

export function GuidesClient({ guides }: GuidesClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'on_leave'>('all');

    const displayGuides = guides.length > 0 ? guides : sampleGuides;

    const filteredGuides = displayGuides.filter(guide => {
        const matchesSearch = guide.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            guide.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || guide.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return { bg: '#dcfce7', color: '#16a34a' };
            case 'inactive': return { bg: '#fee2e2', color: '#dc2626' };
            case 'on_leave': return { bg: '#fef3c7', color: '#d97706' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Tour Guides</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Manage your tour guides and their assignments</p>
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                }}>
                    <Plus size={18} /> Add Guide
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search guides by name or skill..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '14px',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['all', 'active', 'on_leave'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '12px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: statusFilter === status ? '#3b82f6' : '#f1f5f9',
                                color: statusFilter === status ? 'white' : '#64748b',
                                fontWeight: 500,
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            {status === 'all' ? 'All' : status === 'on_leave' ? 'On Leave' : 'Active'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedGuide ? '1fr 400px' : '1fr', gap: '24px' }}>
                {/* Guides Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredGuides.map((guide) => {
                        const statusStyle = getStatusColor(guide.status);
                        return (
                            <div
                                key={guide.id}
                                onClick={() => setSelectedGuide(guide)}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                    cursor: 'pointer',
                                    border: selectedGuide?.id === guide.id ? '2px solid #3b82f6' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '20px',
                                    }}>
                                        {guide.full_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ fontWeight: 600, fontSize: '16px' }}>{guide.full_name}</div>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: statusStyle.bg,
                                                color: statusStyle.color,
                                            }}>
                                                {guide.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>{guide.rating || 'N/A'}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>• {guide.total_tours} tours</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                    {guide.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                fontSize: '11px',
                                                fontWeight: 500,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: '#f1f5f9',
                                                color: '#475569',
                                            }}
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Award size={14} /> {guide.experience_years} years
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Globe size={14} /> {guide.languages.length} languages
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Guide Detail Panel */}
                {selectedGuide && (
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Guide Profile</h3>
                            <button onClick={() => setSelectedGuide(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '28px',
                                margin: '0 auto 12px',
                            }}>
                                {selectedGuide.full_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '18px' }}>{selectedGuide.full_name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                                <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                                <span style={{ fontWeight: 600 }}>{selectedGuide.rating || 'N/A'}</span>
                                <span style={{ color: '#64748b', fontSize: '13px' }}>({selectedGuide.total_tours} tours)</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                            {selectedGuide.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                    <Phone size={18} style={{ color: '#64748b' }} />
                                    <span style={{ fontSize: '14px' }}>{selectedGuide.phone}</span>
                                </div>
                            )}
                            {selectedGuide.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                                    <Mail size={18} style={{ color: '#64748b' }} />
                                    <span style={{ fontSize: '14px' }}>{selectedGuide.email}</span>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Languages</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {selectedGuide.languages.map((lang, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        background: '#dbeafe',
                                        color: '#3b82f6',
                                        fontWeight: 500,
                                    }}>
                                        {lang}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Skills & Expertise</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {selectedGuide.skills.map((skill, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '12px',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {selectedGuide.bio && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>About</div>
                                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{selectedGuide.bio}</p>
                            </div>
                        )}

                        <button style={{
                            width: '100%',
                            padding: '12px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}>
                            Assign to Tour <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
