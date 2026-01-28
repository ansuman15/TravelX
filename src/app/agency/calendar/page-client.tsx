'use client';

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Plane,
    Clock,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface Booking {
    id: string;
    customer_name: string;
    package_name: string | null;
    start_date: string;
    end_date: string | null;
    status: string;
}

interface CalendarPageClientProps {
    bookings: Booking[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarPageClient({ bookings }: CalendarPageClientProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getBookingsForDate = (day: number) => {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];

        return bookings.filter(booking => {
            const startDate = booking.start_date.split('T')[0];
            const endDate = booking.end_date?.split('T')[0] || startDate;
            return dateStr >= startDate && dateStr <= endDate;
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            default: return 'gray';
        }
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayBookings = getBookingsForDate(day);
        days.push(
            <div key={day} className={`calendar-day ${isToday(day) ? 'today' : ''}`}>
                <span className="day-number">{day}</span>
                <div className="day-events">
                    {dayBookings.slice(0, 3).map((booking, idx) => (
                        <div
                            key={booking.id}
                            className={`event-pill ${getStatusColor(booking.status)}`}
                            title={`${booking.customer_name} - ${booking.package_name || 'Trip'}`}
                        >
                            <Plane size={10} />
                            <span>{booking.customer_name.split(' ')[0]}</span>
                        </div>
                    ))}
                    {dayBookings.length > 3 && (
                        <div className="more-events">+{dayBookings.length - 3} more</div>
                    )}
                </div>
            </div>
        );
    }

    // Upcoming bookings
    const upcomingBookings = bookings
        .filter(b => new Date(b.start_date) >= new Date())
        .slice(0, 5);

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Calendar</h1>
                    <p className="text-secondary text-sm">View bookings and schedule</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={goToToday}>Today</Button>
                </div>
            </div>

            <div className="calendar-layout">
                {/* Main Calendar */}
                <div className="calendar-main">
                    <div className="calendar-header">
                        <Button variant="ghost" size="sm" onClick={prevMonth}>
                            <ChevronLeft size={20} />
                        </Button>
                        <h2 className="calendar-title">
                            {MONTHS[month]} {year}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={nextMonth}>
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    <div className="calendar-grid">
                        {DAYS.map(day => (
                            <div key={day} className="calendar-day-header">{day}</div>
                        ))}
                        {days}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="calendar-sidebar">
                    <div className="card">
                        <div className="card-header">
                            <Clock size={18} />
                            <span>Upcoming</span>
                        </div>
                        <div className="upcoming-list">
                            {upcomingBookings.length === 0 ? (
                                <p className="text-secondary text-sm" style={{ padding: 'var(--spacing-4)' }}>
                                    No upcoming bookings
                                </p>
                            ) : (
                                upcomingBookings.map(booking => (
                                    <div key={booking.id} className="upcoming-item">
                                        <div className="upcoming-date">
                                            {new Date(booking.start_date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </div>
                                        <div className="upcoming-info">
                                            <div className="upcoming-name">{booking.customer_name}</div>
                                            <div className="upcoming-package">{booking.package_name || 'Custom Trip'}</div>
                                        </div>
                                        <Badge variant={getStatusColor(booking.status) as any}>
                                            {booking.status}
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .calendar-layout {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: var(--spacing-6);
                }
                .calendar-main {
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-xl);
                    overflow: hidden;
                }
                .calendar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--spacing-4);
                    border-bottom: 1px solid var(--border-light);
                }
                .calendar-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }
                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                }
                .calendar-day-header {
                    padding: var(--spacing-3);
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                    text-transform: uppercase;
                    background: var(--bg-secondary);
                    border-bottom: 1px solid var(--border-light);
                }
                .calendar-day {
                    min-height: 100px;
                    padding: var(--spacing-2);
                    border-right: 1px solid var(--border-light);
                    border-bottom: 1px solid var(--border-light);
                    background: white;
                    transition: background 0.2s ease;
                }
                .calendar-day:nth-child(7n) {
                    border-right: none;
                }
                .calendar-day:hover {
                    background: var(--bg-secondary);
                }
                .calendar-day.empty {
                    background: var(--bg-tertiary);
                }
                .calendar-day.today {
                    background: var(--primary-50);
                }
                .calendar-day.today .day-number {
                    background: var(--primary-500);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .day-number {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: var(--spacing-1);
                }
                .day-events {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .event-pill {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 500;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    cursor: pointer;
                }
                .event-pill.success {
                    background: var(--success-100);
                    color: var(--success-700);
                }
                .event-pill.warning {
                    background: var(--warning-100);
                    color: var(--warning-700);
                }
                .event-pill.error {
                    background: var(--error-100);
                    color: var(--error-700);
                }
                .event-pill.gray {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                }
                .more-events {
                    font-size: 10px;
                    color: var(--text-tertiary);
                    padding: 2px 4px;
                }
                .calendar-sidebar .card {
                    position: sticky;
                    top: 100px;
                }
                .upcoming-list {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .upcoming-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3) var(--spacing-4);
                    border-bottom: 1px solid var(--border-light);
                }
                .upcoming-item:last-child {
                    border-bottom: none;
                }
                .upcoming-date {
                    background: var(--primary-50);
                    color: var(--primary-700);
                    padding: var(--spacing-2);
                    border-radius: var(--radius-md);
                    font-size: 12px;
                    font-weight: 600;
                    text-align: center;
                    min-width: 50px;
                }
                .upcoming-info {
                    flex: 1;
                    min-width: 0;
                }
                .upcoming-name {
                    font-size: 13px;
                    font-weight: 500;
                }
                .upcoming-package {
                    font-size: 11px;
                    color: var(--text-tertiary);
                }
                @media (max-width: 1024px) {
                    .calendar-layout {
                        grid-template-columns: 1fr;
                    }
                    .calendar-sidebar {
                        order: -1;
                    }
                }
            `}</style>
        </div>
    );
}
