'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    Grid,
    List,
    Image as ImageIcon,
    Video,
    MapPin,
    X,
    Download,
    Heart,
    Share2,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface GalleryItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    destination: string | null;
    caption: string | null;
    tags: string[];
    created_at: string;
}

interface GalleryClientProps {
    items: GalleryItem[];
}

// Sample gallery items for demo
const sampleItems: GalleryItem[] = [
    { id: '1', url: '', type: 'image', destination: 'Bali, Indonesia', caption: 'Sunset at Tanah Lot Temple', tags: ['sunset', 'temple', 'bali'], created_at: new Date().toISOString() },
    { id: '2', url: '', type: 'image', destination: 'Paris, France', caption: 'Eiffel Tower at night', tags: ['paris', 'night', 'landmark'], created_at: new Date().toISOString() },
    { id: '3', url: '', type: 'image', destination: 'Tokyo, Japan', caption: 'Cherry blossoms in Ueno Park', tags: ['sakura', 'spring', 'japan'], created_at: new Date().toISOString() },
    { id: '4', url: '', type: 'video', destination: 'Maldives', caption: 'Underwater diving experience', tags: ['diving', 'ocean', 'beach'], created_at: new Date().toISOString() },
    { id: '5', url: '', type: 'image', destination: 'Dubai, UAE', caption: 'Burj Khalifa view', tags: ['architecture', 'city', 'luxury'], created_at: new Date().toISOString() },
    { id: '6', url: '', type: 'image', destination: 'Swiss Alps', caption: 'Mountain hiking trail', tags: ['mountains', 'hiking', 'nature'], created_at: new Date().toISOString() },
    { id: '7', url: '', type: 'image', destination: 'Santorini, Greece', caption: 'Blue domes of Oia', tags: ['greece', 'architecture', 'sea'], created_at: new Date().toISOString() },
    { id: '8', url: '', type: 'video', destination: 'Safari, Kenya', caption: 'Lion pride at sunrise', tags: ['wildlife', 'safari', 'africa'], created_at: new Date().toISOString() },
    { id: '9', url: '', type: 'image', destination: 'Machu Picchu, Peru', caption: 'Ancient Incan ruins', tags: ['heritage', 'mountains', 'history'], created_at: new Date().toISOString() },
];

const GRADIENT_COLORS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
];

const DESTINATION_EMOJIS: Record<string, string> = {
    'Bali': '🏝️',
    'Paris': '🗼',
    'Tokyo': '🗾',
    'Maldives': '🐠',
    'Dubai': '🏙️',
    'Swiss': '🏔️',
    'Santorini': '🏛️',
    'Safari': '🦁',
    'Machu': '🏞️',
    'default': '📍',
};

export function GalleryClient({ items }: GalleryClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const displayItems = items.length > 0 ? items : sampleItems;

    const filteredItems = displayItems.filter(item => {
        const matchesSearch =
            item.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const getEmoji = (destination: string | null) => {
        if (!destination) return DESTINATION_EMOJIS.default;
        const key = Object.keys(DESTINATION_EMOJIS).find(k => destination.includes(k));
        return key ? DESTINATION_EMOJIS[key] : DESTINATION_EMOJIS.default;
    };

    const openLightbox = (item: GalleryItem, index: number) => {
        setSelectedItem(item);
        setSelectedIndex(index);
    };

    const closeLightbox = () => setSelectedItem(null);

    const navigateLightbox = (direction: 'prev' | 'next') => {
        const newIndex = direction === 'prev'
            ? (selectedIndex - 1 + filteredItems.length) % filteredItems.length
            : (selectedIndex + 1) % filteredItems.length;
        setSelectedIndex(newIndex);
        setSelectedItem(filteredItems[newIndex]);
    };

    return (
        <div className="page-content">
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Gallery</h1>
                    <p style={{ color: '#64748b', marginTop: '4px' }}>Browse and manage your travel photos and videos</p>
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
                    <Plus size={18} /> Upload Media
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search by destination, caption, or tag..."
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
                    {(['all', 'image', 'video'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: filterType === type ? '#3b82f6' : '#f1f5f9',
                                color: filterType === type ? 'white' : '#64748b',
                                fontWeight: 500,
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            {type === 'image' && <ImageIcon size={14} />}
                            {type === 'video' && <Video size={14} />}
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'grid' ? 'white' : 'transparent',
                            color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: viewMode === 'list' ? 'white' : 'transparent',
                            color: viewMode === 'list' ? '#0f172a' : '#64748b',
                            cursor: 'pointer',
                            boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '12px 20px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ImageIcon size={18} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{filteredItems.filter(i => i.type === 'image').length}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Photos</span>
                </div>
                <div style={{ padding: '12px 20px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Video size={18} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{filteredItems.filter(i => i.type === 'video').length}</span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Videos</span>
                </div>
            </div>

            {/* Gallery Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                gap: '20px',
            }}>
                {filteredItems.map((item, index) => (
                    <div
                        key={item.id}
                        onClick={() => openLightbox(item, index)}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                    >
                        {/* Image/Video Placeholder */}
                        <div style={{
                            height: viewMode === 'grid' ? '200px' : '120px',
                            background: GRADIENT_COLORS[index % GRADIENT_COLORS.length],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}>
                            <span style={{ fontSize: viewMode === 'grid' ? '64px' : '48px' }}>
                                {getEmoji(item.destination)}
                            </span>
                            {item.type === 'video' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(0,0,0,0.6)',
                                    borderRadius: '8px',
                                    padding: '4px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'white',
                                    fontSize: '11px',
                                }}>
                                    <Video size={12} /> Video
                                </div>
                            )}
                        </div>

                        <div style={{ padding: viewMode === 'grid' ? '16px' : '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {viewMode === 'list' && (
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{item.caption || 'Untitled'}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                        <MapPin size={14} /> {item.destination || 'Unknown'}
                                    </div>
                                </div>
                            )}
                            {viewMode === 'grid' && (
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.caption || 'Untitled'}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {item.destination || 'Unknown'}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {item.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} style={{
                                        fontSize: '10px',
                                        fontWeight: 500,
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            {selectedItem && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={closeLightbox}
                >
                    <button
                        onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                        style={{
                            position: 'absolute',
                            top: '24px',
                            right: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '12px',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                    >
                        <X size={24} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                        style={{
                            position: 'absolute',
                            left: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '12px',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '80%' }}>
                        <div style={{
                            width: '600px',
                            height: '400px',
                            background: GRADIENT_COLORS[selectedIndex % GRADIENT_COLORS.length],
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}>
                            <span style={{ fontSize: '120px' }}>{getEmoji(selectedItem.destination)}</span>
                        </div>
                        <div style={{ color: 'white' }}>
                            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{selectedItem.caption || 'Untitled'}</div>
                            <div style={{ fontSize: '14px', opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <MapPin size={16} /> {selectedItem.destination || 'Unknown'}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: 'white', cursor: 'pointer' }}>
                                    <Heart size={18} /> Like
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: 'white', cursor: 'pointer' }}>
                                    <Share2 size={18} /> Share
                                </button>
                                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', padding: '10px 20px', color: 'white', cursor: 'pointer' }}>
                                    <Download size={18} /> Download
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                        style={{
                            position: 'absolute',
                            right: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '12px',
                            cursor: 'pointer',
                            color: 'white',
                        }}
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            )}
        </div>
    );
}
