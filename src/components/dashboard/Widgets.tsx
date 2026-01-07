'use client';

import { MapPin, Star, Calendar, Users } from 'lucide-react';
import { Badge } from '../ui';

// ============================================
// UPCOMING TRIP CARD
// ============================================
interface TripCardProps {
    id: string;
    destination: string;
    country: string;
    imageUrl?: string;
    startDate: string;
    endDate: string;
    travelers: number;
    status: 'upcoming' | 'ongoing' | 'completed';
    onClick?: () => void;
}

export function TripCard({
    destination,
    country,
    imageUrl,
    startDate,
    endDate,
    travelers,
    status,
    onClick,
}: TripCardProps) {
    const statusColors = {
        upcoming: 'primary',
        ongoing: 'success',
        completed: 'gray',
    } as const;

    const statusLabels = {
        upcoming: 'Upcoming',
        ongoing: 'Ongoing',
        completed: 'Completed',
    };

    return (
        <div className="trip-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
            <div className="trip-image">
                {imageUrl ? (
                    <img src={imageUrl} alt={destination} />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        <MapPin size={24} />
                    </div>
                )}
            </div>
            <div className="trip-info">
                <Badge variant={statusColors[status]}>{statusLabels[status]}</Badge>
                <div className="trip-destination">{destination}</div>
                <div className="trip-meta">
                    <span>{country}</span>
                    <span>•</span>
                    <Calendar size={12} />
                    <span>{startDate} - {endDate}</span>
                </div>
                <div className="trip-meta" style={{ marginTop: '4px' }}>
                    <Users size={12} />
                    <span>{travelers} travelers</span>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MESSAGE ITEM
// ============================================
interface MessageItemProps {
    id: string;
    sender: string;
    avatar?: string;
    message: string;
    time: string;
    unread?: boolean;
    onClick?: () => void;
}

export function MessageItem({
    sender,
    avatar,
    message,
    time,
    unread,
    onClick,
}: MessageItemProps) {
    return (
        <div className="message-item" onClick={onClick}>
            <div className="message-avatar">
                {avatar ? (
                    <img src={avatar} alt={sender} />
                ) : (
                    <span style={{ color: 'var(--primary-600)', fontWeight: 600 }}>
                        {sender.charAt(0).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="message-content">
                <div className="message-header">
                    <span className="message-sender">{sender}</span>
                    <span className="message-time">{time}</span>
                </div>
                <p className="message-preview">{message}</p>
            </div>
            {unread && (
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--primary-500)',
                        borderRadius: '50%',
                        flexShrink: 0,
                    }}
                />
            )}
        </div>
    );
}

// ============================================
// QUICK STAT MINI CARD
// ============================================
interface QuickStatProps {
    label: string;
    value: string | number;
    sublabel?: string;
    color?: 'primary' | 'success' | 'warning' | 'error';
}

export function QuickStat({ label, value, sublabel, color = 'primary' }: QuickStatProps) {
    const colorMap = {
        primary: 'var(--primary-600)',
        success: 'var(--success-600)',
        warning: 'var(--warning-600)',
        error: 'var(--error-600)',
    };

    return (
        <div
            style={{
                padding: 'var(--spacing-4)',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                borderLeft: `3px solid ${colorMap[color]}`,
            }}
        >
            <div className="text-xs text-secondary font-medium">{label}</div>
            <div className="text-xl font-bold text-primary" style={{ marginTop: '4px' }}>
                {value}
            </div>
            {sublabel && (
                <div className="text-xs text-tertiary" style={{ marginTop: '2px' }}>
                    {sublabel}
                </div>
            )}
        </div>
    );
}

// ============================================
// ACTIVITY FEED ITEM
// ============================================
interface ActivityItemProps {
    id: string;
    type: 'booking' | 'payment' | 'lead' | 'task' | 'document';
    title: string;
    description: string;
    time: string;
    user?: string;
}

export function ActivityItem({ type, title, description, time, user }: ActivityItemProps) {
    const typeIcons = {
        booking: '📋',
        payment: '💳',
        lead: '👤',
        task: '✅',
        document: '📄',
    };

    const typeColors = {
        booking: 'var(--primary-100)',
        payment: 'var(--success-100)',
        lead: 'var(--warning-100)',
        task: 'var(--info-100)',
        document: 'var(--gray-100)',
    };

    return (
        <div className="flex gap-3" style={{ padding: 'var(--spacing-3) 0' }}>
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-lg)',
                    background: typeColors[type],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                }}
            >
                {typeIcons[type]}
            </div>
            <div style={{ flex: 1 }}>
                <div className="text-sm font-medium text-primary">{title}</div>
                <div className="text-xs text-secondary">{description}</div>
                <div className="text-xs text-tertiary" style={{ marginTop: '4px' }}>
                    {user && <span>{user} • </span>}
                    {time}
                </div>
            </div>
        </div>
    );
}

// ============================================
// RECENT BOOKINGS TABLE MINI
// ============================================
interface RecentBooking {
    id: string;
    customer: string;
    destination: string;
    amount: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    date: string;
}

interface RecentBookingsProps {
    bookings: RecentBooking[];
    onViewAll?: () => void;
}

export function RecentBookings({ bookings, onViewAll }: RecentBookingsProps) {
    const statusColors = {
        confirmed: 'success',
        pending: 'warning',
        cancelled: 'error',
    } as const;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Recent Bookings</h3>
                {onViewAll && (
                    <button className="btn btn-ghost btn-sm" onClick={onViewAll}>
                        View All
                    </button>
                )}
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Destination</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((booking) => (
                            <tr key={booking.id}>
                                <td className="font-medium">{booking.customer}</td>
                                <td>{booking.destination}</td>
                                <td>₹{booking.amount.toLocaleString()}</td>
                                <td>
                                    <Badge variant={statusColors[booking.status]}>
                                        {booking.status}
                                    </Badge>
                                </td>
                                <td className="text-secondary">{booking.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
