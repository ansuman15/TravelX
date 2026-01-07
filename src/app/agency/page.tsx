'use client';

import { StatCard } from '@/components/ui';
import {
    CalendarWidget,
    RevenueChart,
    DestinationsChart,
    TripsProgress,
    TripCard,
    MessageItem,
    RecentBookings,
} from '@/components/dashboard';
import {
    Briefcase,
    Users,
    DollarSign,
    TrendingUp,
    Plus,
} from 'lucide-react';

// Demo data for the dashboard
const revenueData = [
    { name: 'Sun', value: 320 },
    { name: 'Mon', value: 450 },
    { name: 'Tue', value: 635 },
    { name: 'Wed', value: 480 },
    { name: 'Thu', value: 520 },
    { name: 'Fri', value: 590 },
    { name: 'Sat', value: 410 },
];

const destinationsData = [
    { name: 'Tokyo, Japan', value: 35, color: '#3F83F8', participants: 2458 },
    { name: 'Sydney, Australia', value: 28, color: '#0E9F6E', participants: 2458 },
    { name: 'Paris, France', value: 22, color: '#F59E0B', participants: 2458 },
    { name: 'Venice, Italy', value: 15, color: '#EF4444', participants: 2458 },
];

const tripStats = {
    total: 1200,
    done: 620,
    booked: 465,
    cancelled: 115,
};

const upcomingTrips = [
    {
        id: '1',
        destination: 'Paris, France',
        country: 'France',
        startDate: '5 Jul',
        endDate: '10 July',
        travelers: 4,
        status: 'upcoming' as const,
    },
    {
        id: '2',
        destination: 'Tokyo, Japan',
        country: 'Japan',
        startDate: '15 Jul',
        endDate: '22 July',
        travelers: 2,
        status: 'upcoming' as const,
    },
];

const messages = [
    {
        id: '1',
        sender: 'Europa Hotel',
        message: 'We are pleased to announce...',
        time: '8:00 AM',
        unread: true,
    },
    {
        id: '2',
        sender: 'Global Travel Co',
        message: 'We have updated our com...',
        time: '2:30 PM',
        unread: false,
    },
];

const recentBookings = [
    {
        id: '1',
        customer: 'John Doe',
        destination: 'Bali, Indonesia',
        amount: 125000,
        status: 'confirmed' as const,
        date: 'Jan 5, 2026',
    },
    {
        id: '2',
        customer: 'Sarah Smith',
        destination: 'Dubai, UAE',
        amount: 85000,
        status: 'pending' as const,
        date: 'Jan 4, 2026',
    },
    {
        id: '3',
        customer: 'Mike Johnson',
        destination: 'Maldives',
        amount: 250000,
        status: 'confirmed' as const,
        date: 'Jan 3, 2026',
    },
    {
        id: '4',
        customer: 'Emily Brown',
        destination: 'Singapore',
        amount: 45000,
        status: 'cancelled' as const,
        date: 'Jan 2, 2026',
    },
];

export default function AgencyDashboardPage() {
    return (
        <>
            {/* Stats Row */}
            <div className="grid grid-cols-4 mb-6">
                <StatCard
                    label="Total Booking"
                    value="1,200"
                    icon={Briefcase}
                    variant="primary"
                    trend={{ value: 2.98, isPositive: true }}
                />
                <StatCard
                    label="Total New Customers"
                    value="2,845"
                    icon={Users}
                    variant="error"
                    trend={{ value: 1.45, isPositive: false }}
                />
                <StatCard
                    label="Total Earnings"
                    value="₹12,890"
                    icon={DollarSign}
                    variant="success"
                    trend={{ value: 3.75, isPositive: true }}
                />
                <StatCard
                    label="Conversion Rate"
                    value="24.5%"
                    icon={TrendingUp}
                    variant="warning"
                    trend={{ value: 1.2, isPositive: true }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div style={{ gridColumn: 'span 2' }}>
                    {/* Revenue Chart */}
                    <RevenueChart data={revenueData} />

                    {/* Trips Progress */}
                    <div className="card mt-6">
                        <div className="card-body">
                            <TripsProgress stats={tripStats} />
                        </div>
                    </div>

                    {/* Recent Bookings */}
                    <div className="mt-6">
                        <RecentBookings bookings={recentBookings} onViewAll={() => { }} />
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div>
                    {/* Destinations Chart */}
                    <DestinationsChart data={destinationsData} />

                    {/* Calendar */}
                    <div className="mt-6">
                        <CalendarWidget
                            events={[
                                { date: new Date(), count: 3 },
                                { date: new Date(Date.now() + 86400000 * 5), count: 1 },
                            ]}
                        />
                    </div>

                    {/* Upcoming Trips */}
                    <div className="card mt-6">
                        <div className="card-header">
                            <h3 className="card-title">Upcoming Trips</h3>
                            <button className="btn btn-ghost btn-sm">
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {upcomingTrips.map((trip) => (
                                <TripCard key={trip.id} {...trip} />
                            ))}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="card mt-6">
                        <div className="card-header">
                            <h3 className="card-title">Messages</h3>
                            <button className="btn btn-ghost btn-sm">...</button>
                        </div>
                        <div className="card-body">
                            {messages.map((message) => (
                                <MessageItem key={message.id} {...message} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
