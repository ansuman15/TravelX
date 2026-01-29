'use client';

import { useState } from 'react';
import {
    Star,
    TrendingUp,
    TrendingDown,
    MessageSquare,
    Filter,
    Calendar,
    ThumbsUp,
    ThumbsDown,
} from 'lucide-react';

interface Feedback {
    id: string;
    rating: number;
    review: string | null;
    category: string | null;
    created_at: string;
    customer?: { full_name: string; email: string };
    booking?: { destination: string; booking_number: string };
}

interface FeedbackStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    monthlyStats: Array<{ month: string; positive: number; negative: number }>;
}

interface FeedbackClientProps {
    feedback: Feedback[];
    stats: FeedbackStats;
}

// Sample data for demo when no feedback exists
const sampleFeedback: Feedback[] = [
    {
        id: '1',
        rating: 5,
        review: 'Amazing experience! The team was incredibly helpful and organized everything perfectly. Will definitely book again!',
        category: 'Service Quality',
        created_at: new Date().toISOString(),
        customer: { full_name: 'Sarah Johnson', email: 'sarah@example.com' },
        booking: { destination: 'Bali, Indonesia', booking_number: 'BK-2024-001' },
    },
    {
        id: '2',
        rating: 4,
        review: 'Great trip overall. Hotel was excellent, tour guide was knowledgeable. Minor issues with airport transfer timing.',
        category: 'Trip Quality',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        customer: { full_name: 'Michael Chen', email: 'michael@example.com' },
        booking: { destination: 'Tokyo, Japan', booking_number: 'BK-2024-002' },
    },
    {
        id: '3',
        rating: 5,
        review: 'Best vacation ever! Everything was planned to perfection. The local experiences were unforgettable.',
        category: 'Overall Experience',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        customer: { full_name: 'Emily Rodriguez', email: 'emily@example.com' },
        booking: { destination: 'Paris, France', booking_number: 'BK-2024-003' },
    },
    {
        id: '4',
        rating: 3,
        review: 'Decent experience but expected more based on the price. Communication could be improved.',
        category: 'Value for Money',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        customer: { full_name: 'David Kim', email: 'david@example.com' },
        booking: { destination: 'Dubai, UAE', booking_number: 'BK-2024-004' },
    },
];

const sampleStats: FeedbackStats = {
    averageRating: 4.2,
    totalReviews: 156,
    ratingDistribution: { 5: 78, 4: 45, 3: 20, 2: 8, 1: 5 },
    monthlyStats: [
        { month: 'Aug', positive: 25, negative: 3 },
        { month: 'Sep', positive: 28, negative: 4 },
        { month: 'Oct', positive: 32, negative: 2 },
        { month: 'Nov', positive: 30, negative: 5 },
        { month: 'Dec', positive: 35, negative: 3 },
        { month: 'Jan', positive: 26, negative: 2 },
    ],
};

export function FeedbackClient({ feedback, stats }: FeedbackClientProps) {
    const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
    const [dateRange, setDateRange] = useState('all');

    // Use sample data if no real data
    const displayFeedback = feedback.length > 0 ? feedback : sampleFeedback;
    const displayStats = stats.totalReviews > 0 ? stats : sampleStats;

    const filteredFeedback = displayFeedback.filter(f => {
        if (filter === 'positive') return f.rating >= 4;
        if (filter === 'negative') return f.rating <= 2;
        return true;
    });

    const maxMonthValue = Math.max(...displayStats.monthlyStats.map(m => m.positive + m.negative)) || 1;

    return (
        <div className="page-content">
            {/* Page Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>Feedback & Reviews</h1>
                <p style={{ color: '#64748b', marginTop: '4px' }}>Monitor customer satisfaction and reviews</p>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {/* Average Rating */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Average Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a' }}>{displayStats.averageRating}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                    key={star}
                                    size={20}
                                    fill={star <= Math.round(displayStats.averageRating) ? '#fbbf24' : 'none'}
                                    stroke={star <= Math.round(displayStats.averageRating) ? '#fbbf24' : '#d1d5db'}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Total Reviews */}
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Total Reviews</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 700, color: '#0f172a' }}>{displayStats.totalReviews}</span>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '20px',
                            background: '#dcfce7',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <TrendingUp size={12} /> +12%
                        </span>
                    </div>
                </div>

                {/* Positive */}
                <div style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
                    color: 'white',
                }}>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Positive Reviews</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 700 }}>
                            {displayStats.ratingDistribution[5] + displayStats.ratingDistribution[4]}
                        </span>
                        <ThumbsUp size={24} />
                    </div>
                </div>

                {/* Negative */}
                <div style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)',
                    color: 'white',
                }}>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>Negative Reviews</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '36px', fontWeight: 700 }}>
                            {displayStats.ratingDistribution[1] + displayStats.ratingDistribution[2]}
                        </span>
                        <ThumbsDown size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column - Chart & Reviews */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Reviews Over Time Chart */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Reviews Statistics</h3>
                            <select
                                style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 12px', fontSize: '13px' }}
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="all">Last 6 Months</option>
                                <option value="3m">Last 3 Months</option>
                                <option value="1m">Last Month</option>
                            </select>
                        </div>

                        {/* Bar Chart */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '200px', paddingBottom: '30px' }}>
                            {displayStats.monthlyStats.map((month, index) => (
                                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', height: '160px', justifyContent: 'flex-end' }}>
                                        <div
                                            style={{
                                                width: '32px',
                                                height: `${(month.positive / maxMonthValue) * 120}px`,
                                                background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
                                                borderRadius: '4px 4px 0 0',
                                            }}
                                        />
                                        <div
                                            style={{
                                                width: '32px',
                                                height: `${(month.negative / maxMonthValue) * 120}px`,
                                                background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
                                                borderRadius: '0 0 4px 4px',
                                            }}
                                        />
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{month.month}</span>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#22c55e' }} />
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Positive</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Negative</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {(['all', 'positive', 'negative'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: filter === f ? '#3b82f6' : '#f1f5f9',
                                    color: filter === f ? 'white' : '#64748b',
                                    fontWeight: 500,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)} Reviews
                            </button>
                        ))}
                    </div>

                    {/* Review Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredFeedback.map((fb) => (
                            <div
                                key={fb.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '16px',
                                        }}>
                                            {fb.customer?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '15px' }}>{fb.customer?.full_name || 'Anonymous'}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {fb.booking?.destination || 'General Feedback'}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                fill={star <= fb.rating ? '#fbbf24' : 'none'}
                                                stroke={star <= fb.rating ? '#fbbf24' : '#d1d5db'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{fb.review}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                    {fb.category && (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: '#3b82f6',
                                            background: '#dbeafe',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                        }}>
                                            {fb.category}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Rating Distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Rating Breakdown */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Rating Breakdown</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = displayStats.ratingDistribution[rating] || 0;
                                const percentage = displayStats.totalReviews > 0
                                    ? Math.round((count / displayStats.totalReviews) * 100)
                                    : 0;
                                return (
                                    <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ width: '60px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {rating} <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                                        </span>
                                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    background: rating >= 4 ? '#22c55e' : rating === 3 ? '#f59e0b' : '#ef4444',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        </div>
                                        <span style={{ width: '40px', fontSize: '12px', color: '#64748b' }}>{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        borderRadius: '20px',
                        padding: '24px',
                        color: 'white',
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Request Feedback</h3>
                        <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>
                            Send automated feedback requests to customers after their trips
                        </p>
                        <button style={{
                            width: '100%',
                            padding: '12px',
                            background: 'white',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}>
                            Send Requests
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
