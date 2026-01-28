'use client';

import { StatCard } from '@/components/ui';
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
    Plus,
    Sparkles,
    ArrowRight,
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
    userName?: string;
}

export function AgencyDashboardClient({
    stats,
    leadStats,
    bookingStats,
    weeklyRevenue,
    topDestinations,
    recentBookings,
    upcomingTrips,
    userName = 'there',
}: DashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <>
            {/* Welcome Banner */}
            <div className="welcome-banner mb-6 animate-slide-up">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={20} className="animate-pulse-glow" />
                            <span className="text-sm opacity-80">Dashboard Overview</span>
                        </div>
                        <h1 className="welcome-title">{getGreeting()}, {userName}!</h1>
                        <p className="welcome-subtitle">Here's what's happening with your agency today.</p>
                    </div>
                    <button
                        className="btn-professional btn-professional-secondary"
                        onClick={() => window.location.href = '/agency/leads'}
                        style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                    >
                        New Lead <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 mb-6">
                <div className="animate-slide-up stagger-1">
                    <StatCard
                        label="Total Bookings"
                        value={stats.totalBookings.toLocaleString()}
                        icon={Briefcase}
                        variant="primary"
                    />
                </div>
                <div className="animate-slide-up stagger-2">
                    <StatCard
                        label="Total Customers"
                        value={stats.totalCustomers.toLocaleString()}
                        icon={Users}
                        variant="success"
                    />
                </div>
                <div className="animate-slide-up stagger-3">
                    <StatCard
                        label="Revenue (30 days)"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={DollarSign}
                        variant="warning"
                    />
                </div>
                <div className="animate-slide-up stagger-4">
                    <StatCard
                        label="Conversion Rate"
                        value={stats.conversionRate}
                        icon={TrendingUp}
                        variant="error"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div style={{ gridColumn: 'span 2' }}>
                    {/* Revenue Chart */}
                    <RevenueChart data={weeklyRevenue} />

                    {/* Trips Progress */}
                    <div className="card mt-6">
                        <div className="card-body">
                            <TripsProgress stats={bookingStats} />
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="mt-6">
                        <RecentBookings bookings={recentBookings} onViewAll={() => window.location.href = '/agency/bookings'} />
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div>
                    {/* Destinations Chart */}
                    {topDestinations.length > 0 ? (
                        <DestinationsChart data={topDestinations.map(d => ({ ...d, participants: d.value }))} />
                    ) : (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Top Destinations</h3>
                            </div>
                            <div className="card-body text-center" style={{ padding: 'var(--spacing-8)' }}>
                                <div className="text-secondary">No bookings yet</div>
                            </div>
                        </div>
                    )}

                    {/* Calendar */}
                    <div className="mt-6">
                        <CalendarWidget events={[]} />
                    </div>

                    {/* Upcoming Trips */}
                    <div className="card mt-6">
                        <div className="card-header">
                            <h3 className="card-title">Upcoming Trips</h3>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => window.location.href = '/agency/bookings'}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {upcomingTrips.length > 0 ? (
                                upcomingTrips.map((trip) => (
                                    <TripCard key={trip.id} {...trip} />
                                ))
                            ) : (
                                <div className="text-secondary text-center" style={{ padding: 'var(--spacing-4)' }}>
                                    No upcoming trips
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lead Pipeline Summary */}
                    <div className="card mt-6">
                        <div className="card-header">
                            <h3 className="card-title">Lead Pipeline</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-3)' }}>
                                <div className="stat-mini">
                                    <div className="text-sm text-secondary">New</div>
                                    <div className="text-xl font-bold text-primary-600">{leadStats.new}</div>
                                </div>
                                <div className="stat-mini">
                                    <div className="text-sm text-secondary">Contacted</div>
                                    <div className="text-xl font-bold text-warning-600">{leadStats.contacted}</div>
                                </div>
                                <div className="stat-mini">
                                    <div className="text-sm text-secondary">Quoted</div>
                                    <div className="text-xl font-bold text-info-600">{leadStats.quoted}</div>
                                </div>
                                <div className="stat-mini">
                                    <div className="text-sm text-secondary">Booked</div>
                                    <div className="text-xl font-bold text-success-600">{leadStats.booked}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
