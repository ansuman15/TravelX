'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarWidgetProps {
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
    events?: { date: Date; count: number }[];
}

export function CalendarWidget({
    selectedDate = new Date(),
    onDateSelect,
    events = [],
}: CalendarWidgetProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

    const daysInMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear()
        );
    };

    const hasEvent = (day: number) => {
        return events.some((event) => {
            const eventDate = new Date(event.date);
            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonth.getMonth() &&
                eventDate.getFullYear() === currentMonth.getFullYear()
            );
        });
    };

    const monthName = currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate previous month days to fill first week
    const prevMonthDays = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        0
    ).getDate();
    const prevDays = Array.from(
        { length: firstDayOfMonth },
        (_, i) => prevMonthDays - firstDayOfMonth + i + 1
    );

    // Generate current month days
    const currentDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Generate next month days to fill last week
    const totalCells = 42; // 6 weeks
    const remainingDays = totalCells - prevDays.length - currentDays.length;
    const nextDays = Array.from({ length: remainingDays }, (_, i) => i + 1);

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <div className="calendar-title">{monthName}</div>
                <div className="calendar-nav">
                    <button className="calendar-nav-btn" onClick={prevMonth}>
                        <ChevronLeft size={16} />
                    </button>
                    <button className="calendar-nav-btn" onClick={nextMonth}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {dayNames.map((day) => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {/* Previous month days */}
                {prevDays.map((day) => (
                    <div key={`prev-${day}`} className="calendar-day other-month">
                        {day}
                    </div>
                ))}

                {/* Current month days */}
                {currentDays.map((day) => (
                    <div
                        key={day}
                        className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''
                            } ${hasEvent(day) ? 'has-event' : ''}`}
                        style={{ position: 'relative' }}
                        onClick={() => onDateSelect?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))}
                    >
                        {day}
                        {hasEvent(day) && (
                            <span
                                style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '4px',
                                    height: '4px',
                                    background: 'var(--primary-500)',
                                    borderRadius: '50%',
                                }}
                            />
                        )}
                    </div>
                ))}

                {/* Next month days */}
                {nextDays.map((day) => (
                    <div key={`next-${day}`} className="calendar-day other-month">
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}
