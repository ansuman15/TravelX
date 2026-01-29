'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    CalendarWidget,
    RevenueChart,
    DestinationsChart,
    TripsProgress,
    TripCard,
    RecentBookings,
} from '@/components/dashboard';
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Plus,
    MapPin,
    Calendar,
    Clock,
    ChevronRight,
    MessageSquare,
    Package,
    ArrowUpRight,
} from 'lucide-react';

interface DashboardProps {
    stats: {
        totalBookings: number;
        totalCustomers: number;
        totalRevenue: number;
        conversionRate: string;
    };
    leadStats: {
        new: number;
        contacted: number;
        quoted: number;
        negotiating: number;
        booked: number;
        lost: number;
    };
    bookingStats: {
        total: number;
        done: number;
        booked: number;
        cancelled: number;
    };
    weeklyRevenue: Array<{ name: string; value: number }>;
    topDestinations: Array<{ name: string; value: number; color: string }>;
    recentBookings: Array<{
        id: string;
        customer: string;
        destination: string;
        amount: number;
        status: 'confirmed' | 'pending' | 'cancelled';
        date: string;
    }>;
    upcomingTrips: Array<{
        id: string;
        destination: string;
        country: string;
        startDate: string;
        endDate: string;
        travelers: number;
        status: 'upcoming' | 'pending';
    }>;
}

// Sample messages data (would come from API in production)
const sampleMessages = [
    { id: '1', sender: 'Europia Hotel', message: 'We are pleased to announce...', time: '10:00 AM', avatar: '🏨', unread: true },
    { id: '2', sender: 'Global Travel Co', message: 'We have updated our com...', time: '3:00 PM', avatar: '🌍', unread: true },
    { id: '3', sender: 'Kalendra Umbora', message: 'Hi, I need assistance with c...', time: '9:45 AM', avatar: '👤', unread: false },
    { id: '4', sender: 'Osman Farooq', message: 'Hello, I had an amazing tim...', time: '10:15 AM', avatar: '👨', unread: false },
];

// Sample packages (would come from API)  
const samplePackages = [
    { id: '1', name: 'Seoul, South Korea', category: 'Cultural Exploration', days: 10, nights: 9, price: 2100, image: '🇰🇷' },
    { id: '2', name: 'Venice, Italy', category: 'Venice Dreams', days: 8, nights: 8, price: 1500, image: '🇮🇹' },
    { id: '3', name: 'Serengeti, Tanzania', category: 'Safari Adventure', days: 8, nights: 7, price: 3200, image: '🦁' },
];

export function AgencyDashboardClient({
    stats,
    leadStats,
    bookingStats,
    weeklyRevenue,
    topDestinations,
    recentBookings,
    upcomingTrips,
}: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate change percentages (mock data - would be calculated from real data)
    const statCards = [
        {
            label: 'Total Booking',
            value: stats.totalBookings.toLocaleString(),
            change: '+2.98%',
            isPositive: true,
            icon: Briefcase,
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            iconBg: '#e0e7ff',
        },
        {
            label: 'Total New Customers',
            value: stats.totalCustomers.toLocaleString(),
            change: '-1.45%',
            isPositive: false,
            icon: Users,
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            iconBg: '#fce7f3',
        },
        {
            label: 'Total Earnings',
            value: formatCurrency(stats.totalRevenue),
            change: '+3.75%',
            isPositive: true,
            icon: DollarSign,
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            iconBg: '#dbeafe',
        },
    ];

    return (
        <>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '24px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                            }}
                        >
                            <div
                                style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: stat.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={24} style={{ color: stat.gradient.includes('#667eea') ? '#667eea' : stat.gradient.includes('#f093fb') ? '#f093fb' : '#4facfe' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{stat.label}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{stat.value}</span>
                                    <span
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: stat.isPositive ? '#dcfce7' : '#fee2e2',
                                            color: stat.isPositive ? '#16a34a' : '#dc2626',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px',
                                        }}
                                    >
                                        {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid - 3 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Revenue & Destinations Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                        <RevenueChart data={weeklyRevenue} />
                        {topDestinations.length > 0 ? (
                            <DestinationsChart data={topDestinations.map(d => ({ ...d, participants: d.value }))} />
                        ) : (
                            <div className="card">
                                <div className="card-header"><h3 className="card-title">Top Destinations</h3></div>
                                <div className="card-body text-center" style={{ padding: '40px' }}>
                                    <div style={{ color: '#64748b' }}>No bookings yet</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trips Progress */}
                    <div className="card">
                        <div className="card-body">
                            <TripsProgress stats={bookingStats} />
                        </div>
                    </div>

                    {/* Travel Packages */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Travel Packages</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '13px', color: '#64748b' }}>Sort by:</span>
                                <select style={{ border: 'none', fontSize: '13px', fontWeight: 500, color: '#0f172a', cursor: 'pointer' }}>
                                    <option>Latest</option>
                                    <option>Popular</option>
                                    <option>Price</option>
                                </select>
                                <Link href="/agency/packages" style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 500 }}>View All</Link>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {samplePackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    style={{
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <div style={{
                                        height: '120px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '48px',
                                    }}>
                                        {pkg.image}
                                    </div>
                                    <div style={{ padding: '14px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: 600,
                                            color: '#3b82f6',
                                            background: '#dbeafe',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                        }}>
                                            {pkg.category}
                                        </span>
                                        <div style={{ fontWeight: 600, fontSize: '14px', marginTop: '8px' }}>{pkg.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            <Calendar size={12} style={{ marginRight: '4px' }} />
                                            {pkg.days} Days / {pkg.nights} Nights
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>${pkg.price}</span>
                                                <span style={{ fontSize: '11px', color: '#94a3b8' }}> /person</span>
                                            </div>
                                            <button style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                background: 'white',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}>
                                                See Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <RecentBookings bookings={recentBookings} onViewAll={() => window.location.href = '/agency/bookings'} />
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Calendar */}
                    <CalendarWidget events={[]} />

                    {/* Upcoming Trips */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Upcoming Trips</h3>
                            <button
                                onClick={() => window.location.href = '/agency/bookings'}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#3b82f6',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {upcomingTrips.length > 0 ? (
                                upcomingTrips.slice(0, 4).map((trip) => (
                                    <div
                                        key={trip.id}
                                        style={{
                                            display: 'flex',
                                            gap: '12px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: '#f8fafc',
                                        }}
                                    >
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '20px',
                                        }}>
                                            🌍
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '10px',
                                                fontWeight: 600,
                                                color: trip.status === 'upcoming' ? '#3b82f6' : '#f59e0b',
                                                background: trip.status === 'upcoming' ? '#dbeafe' : '#fef3c7',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                marginBottom: '4px',
                                            }}>
                                                {trip.status === 'upcoming' ? 'Romantic Getaway' : 'Adventure Tour'}
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{trip.destination}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    👥 +{trip.travelers}
                                                </span>
                                                <span>📅 {trip.startDate} - {trip.endDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                                    No upcoming trips
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Messages</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>•••</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {sampleMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        display: 'flex',
                                        gap: '12px',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        background: msg.unread ? '#f0f9ff' : 'transparent',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                    }}>
                                        {msg.avatar}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 600, fontSize: '13px' }}>{msg.sender}</span>
                                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>{msg.time}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                    {msg.unread && (
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Activity</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>•••</button>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>Today</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }} />
                                <div>
                                    <div style={{ fontSize: '13px' }}><strong>Alberto Cortez</strong> updated his profile and added a new payment method.</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>3:30 AM</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', marginTop: '6px' }} />
                                <div>
                                    <div style={{ fontSize: '13px' }}><strong>Camellia Swan</strong> booked the Venice Dreams package for June 25, 2024.</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>10:50 AM</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px' }} />
                                <div>
                                    <div style={{ fontSize: '13px' }}>Payment was processed for <strong>Ludwig Contessa&apos;s</strong> Alpine Escape package.</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>10:15 AM</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
